// Requerimentos (SPEC-036, RF-44, UC-32, UC-33, RB-34). Estudante abre e acompanha; professor responde revisão e
// segunda chamada das turmas que leciona; a secretaria responde os demais; a coordenação consulta os do curso.
// Escopo na query (ADR-003); requerimento, notificação e auditoria na mesma transação (RB-22, RB-23).
import { hojeEmBrasilia } from "@/domain/atividades";
import { somarDiasUteis } from "@/domain/calendario";
import { notificacaoRequerimento } from "@/domain/notificacoes";
import {
  PRAZO_DIAS_UTEIS,
  ROTULO_STATUS_REQUERIMENTO,
  ROTULO_TIPO_REQUERIMENTO,
  atrasado,
  destinoDoTipo,
  protocolo,
  validarRequerimento,
  validarResposta,
  type StatusRequerimento,
  type TipoRequerimento,
} from "@/domain/requerimentos";
import type { Prisma } from "@prisma/client";
import type { Sessao } from "@/server/auth/token";
import { deData, paraData } from "@/server/dados/atividades";
import { auditar } from "@/server/dados/auditoria";
import { MATRICULA_CURSANDO } from "@/server/dados/matriculas";
import { executarEmTransacao } from "@/server/dados/notas";
import { notificar } from "@/server/dados/notificacoes";
import { TURMA_DE_PERIODO_ABERTO } from "@/server/dados/periodos";
import { prisma } from "@/server/dados/prisma";
import type { Falha, Resultado } from "./cadastros";
import { folgasDoCalendario } from "./calendario";

const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const falha = <T>(f: Falha): Resultado<T> => ({ ok: false, falha: f });

// Turmas em que o estudante está cursando (período aberto), com as avaliações, para o formulário.
export function turmasParaRequerimento(estudanteId: string) {
  return prisma.turma.findMany({
    where: { matriculas: { some: { estudanteId, ...MATRICULA_CURSANDO } }, ...TURMA_DE_PERIODO_ABERTO },
    select: { id: true, nome: true, disciplina: { select: { nome: true } }, professor: { select: { nome: true } }, avaliacoes: { select: { id: true, nome: true }, orderBy: [{ data: "asc" }, { nome: "asc" }] } },
    orderBy: { nome: "asc" },
  });
}

// AC-036-01 / AC-036-02 / AC-036-08: protocolo, prazo de 5 dias úteis e destino pelo tipo.
export async function abrirRequerimento(sessao: Sessao, entrada: Record<string, unknown>, hoje = hojeEmBrasilia()) {
  if (sessao.perfil !== "Estudante") return falha({ tipo: "fora-do-escopo" });
  const validacao = validarRequerimento(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  const d = validacao.dados;
  const estudante = await prisma.usuario.findUnique({ where: { id: sessao.usuarioId }, select: { nome: true, cursoId: true } });
  if (d.turmaId) {
    const turma = await prisma.turma.findFirst({ where: { id: d.turmaId, matriculas: { some: { estudanteId: sessao.usuarioId, ...MATRICULA_CURSANDO } }, ...TURMA_DE_PERIODO_ABERTO }, select: { id: true } });
    if (!turma) return falha({ tipo: "invalido", erros: { turmaId: "Escolha uma turma em que você está cursando." } });
    if (d.avaliacaoId && !(await prisma.avaliacao.findFirst({ where: { id: d.avaliacaoId, turmaId: d.turmaId }, select: { id: true } }))) {
      return falha({ tipo: "invalido", erros: { avaliacaoId: "Avaliação de outra turma." } });
    }
  }
  const prazo = somarDiasUteis(hoje, PRAZO_DIAS_UTEIS, await folgasDoCalendario());
  const ano = hoje.slice(0, 4);
  return sucesso(
    await executarEmTransacao(async (tx) => {
      // INV-036-01: a sequência do ano é calculada com bloqueio, para dois pedidos simultâneos não repetirem o protocolo.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`requerimento-${ano}`}))`;
      const ultimo = await tx.requerimento.findFirst({ where: { protocolo: { startsWith: `${ano}-` } }, select: { protocolo: true }, orderBy: { protocolo: "desc" } });
      const numero = protocolo(ano, (ultimo ? Number(ultimo.protocolo.slice(5)) : 0) + 1);
      const req = await tx.requerimento.create({
        data: { protocolo: numero, estudanteId: sessao.usuarioId, tipo: d.tipo, destino: destinoDoTipo(d.tipo), turmaId: d.turmaId, avaliacaoId: d.avaliacaoId, descricao: d.descricao, prazo: paraData(prazo) },
        select: { id: true, protocolo: true },
      });
      await auditar(tx, {
        autorId: sessao.usuarioId,
        acao: "requerimento.aberto",
        cursoId: estudante?.cursoId ?? null,
        turmaId: d.turmaId,
        descricao: `${numero} · ${ROTULO_TIPO_REQUERIMENTO[d.tipo]} de ${estudante?.nome ?? ""} (prazo ${prazo.split("-").reverse().join("/")})`,
      });
      return { ...req, prazo, destino: destinoDoTipo(d.tipo) };
    }),
  );
}

// INV-036-03: o que cada perfil vê. Estudante: os próprios. Professor: revisão e segunda chamada das turmas dele.
// Secretaria: os de destino Secretaria. Coordenador: os dos estudantes dos cursos dele (só leitura).
function escopo(sessao: Sessao): Prisma.RequerimentoWhereInput | null {
  if (sessao.perfil === "Estudante") return { estudanteId: sessao.usuarioId };
  if (sessao.perfil === "Professor") return { destino: "Professor", turma: { professorId: sessao.usuarioId } };
  if (sessao.perfil === "Administrador") return { destino: "Secretaria" };
  if (sessao.perfil === "Coordenador") return { estudante: { curso: { coordenadorId: sessao.usuarioId } } };
  return null;
}

const podeResponder = (sessao: Sessao) => sessao.perfil === "Professor" || sessao.perfil === "Administrador";

export async function listarRequerimentos(sessao: Sessao, hoje = hojeEmBrasilia()) {
  const where = escopo(sessao);
  if (!where) return null;
  const lista = await prisma.requerimento.findMany({
    where,
    select: {
      id: true,
      protocolo: true,
      tipo: true,
      status: true,
      descricao: true,
      resposta: true,
      prazo: true,
      criadoEm: true,
      respondidoEm: true,
      estudante: { select: { nome: true, ficha: { select: { numeroMatricula: true } }, curso: { select: { nome: true } } } },
      turma: { select: { nome: true, disciplina: { select: { nome: true } }, professor: { select: { nome: true } } } },
      avaliacao: { select: { nome: true } },
      responsavel: { select: { nome: true } },
    },
    orderBy: [{ criadoEm: "desc" }, { id: "asc" }],
    take: 300,
  });
  const itens = lista.map((r) => {
    const prazo = deData(r.prazo);
    return {
      id: r.id,
      protocolo: r.protocolo,
      tipo: r.tipo as TipoRequerimento,
      rotuloTipo: ROTULO_TIPO_REQUERIMENTO[r.tipo as TipoRequerimento],
      status: r.status as StatusRequerimento,
      rotuloStatus: ROTULO_STATUS_REQUERIMENTO[r.status as StatusRequerimento],
      descricao: r.descricao,
      resposta: r.resposta,
      prazo,
      atrasado: atrasado(r.status as StatusRequerimento, prazo, hoje),
      criadoEm: r.criadoEm.toISOString(),
      respondidoEm: r.respondidoEm?.toISOString() ?? null,
      estudante: r.estudante.nome,
      matricula: r.estudante.ficha?.numeroMatricula ?? null,
      curso: r.estudante.curso?.nome ?? null,
      turma: r.turma ? `${r.turma.nome} · ${r.turma.disciplina.nome}` : null,
      professor: r.turma?.professor.nome ?? null,
      avaliacao: r.avaliacao?.nome ?? null,
      responsavel: r.responsavel?.nome ?? null,
    };
  });
  // Pendentes primeiro (os atrasados no topo), depois os decididos.
  const pendente = (s: StatusRequerimento) => s === "Aberto" || s === "EmAnalise";
  itens.sort((a, b) => Number(pendente(b.status)) - Number(pendente(a.status)) || Number(b.atrasado) - Number(a.atrasado) || (pendente(a.status) ? a.prazo.localeCompare(b.prazo) : 0));
  return { podeResponder: podeResponder(sessao), itens };
}

// AC-036-03 a AC-036-06: só o responsável; indeferir exige resposta; decidido é final.
export async function responderRequerimento(sessao: Sessao, id: string, entrada: Record<string, unknown>) {
  const where = escopo(sessao);
  if (!where || !podeResponder(sessao)) return falha({ tipo: "fora-do-escopo" });
  const req = await prisma.requerimento.findFirst({ where: { AND: [where, { id }] }, select: { id: true, protocolo: true, tipo: true, status: true, estudanteId: true, turmaId: true, estudante: { select: { nome: true, cursoId: true } } } });
  if (!req) return falha({ tipo: "nao-encontrado", erro: "Requerimento não encontrado." });
  const validacao = validarResposta(req.status as StatusRequerimento, entrada);
  if (!validacao.ok) return "conflito" in validacao ? falha({ tipo: "conflito", erro: validacao.conflito }) : falha({ tipo: "invalido", erros: validacao.erros });
  const { status, resposta } = validacao.dados;
  const decidido = status === "Deferido" || status === "Indeferido";
  return sucesso(
    await executarEmTransacao(async (tx) => {
      await tx.requerimento.update({ where: { id }, data: { status, ...(resposta ? { resposta } : {}), ...(decidido ? { respondidoEm: new Date(), responsavelId: sessao.usuarioId } : {}) } });
      const tipo = ROTULO_TIPO_REQUERIMENTO[req.tipo as TipoRequerimento];
      await notificar(tx, req.estudanteId, notificacaoRequerimento(req.protocolo, tipo, status, resposta));
      await auditar(tx, {
        autorId: sessao.usuarioId,
        acao: "requerimento.respondido",
        cursoId: req.estudante.cursoId,
        turmaId: req.turmaId,
        descricao: `${req.protocolo} · ${tipo} de ${req.estudante.nome}: ${ROTULO_STATUS_REQUERIMENTO[status]}${resposta ? ` — ${resposta}` : ""}`,
        antes: { status: req.status },
        depois: { status, resposta },
      });
      return { id, status };
    }),
  );
}

// AC-036-07: declaração de matrícula só de requerimento deferido (do próprio estudante ou pela secretaria).
export async function consultarDeclaracao(sessao: Sessao, requerimentoId: string) {
  const dono = sessao.perfil === "Estudante" ? { estudanteId: sessao.usuarioId } : sessao.perfil === "Administrador" ? {} : null;
  if (!dono) return null;
  const req = await prisma.requerimento.findFirst({
    where: { id: requerimentoId, tipo: "DeclaracaoMatricula", status: "Deferido", ...dono },
    select: { protocolo: true, respondidoEm: true, estudanteId: true },
  });
  if (!req) return null;
  const [estudante, turmas, instituicao] = await Promise.all([
    prisma.usuario.findUniqueOrThrow({ where: { id: req.estudanteId }, select: { id: true, nome: true, curso: { select: { nome: true } }, ficha: { select: { numeroMatricula: true, cpf: true, situacaoCurso: true } } } }),
    prisma.turma.findMany({ where: { matriculas: { some: { estudanteId: req.estudanteId, ...MATRICULA_CURSANDO } }, ...TURMA_DE_PERIODO_ABERTO }, select: { nome: true, periodo: true, disciplina: { select: { nome: true, cargaHoraria: true } } }, orderBy: { nome: "asc" } }),
    prisma.instituicao.findUnique({ where: { id: 1 } }),
  ]);
  return { protocolo: req.protocolo, emitidaEm: (req.respondidoEm ?? new Date()).toISOString(), estudante, turmas, instituicao };
}
