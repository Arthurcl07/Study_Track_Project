// Casos de uso do mural de comunicados (SPEC-025, RF-34, UC-23, UC-24). Alcance e escopo filtrados na própria query
// (ADR-003, RB-26). Comunicado, notificações e auditoria na mesma transação (INV-025-04).
import type { Prisma } from "@prisma/client";
import { validarComunicado } from "@/domain/comunicados";
import { notificacaoComunicado } from "@/domain/notificacoes";
import type { Sessao } from "@/server/auth/token";
import { auditar } from "@/server/dados/auditoria";
import { executarEmTransacao } from "@/server/dados/notas";
import { TURMA_DE_PERIODO_ABERTO } from "@/server/dados/periodos";
import { prisma } from "@/server/dados/prisma";
import type { Falha, Resultado } from "./cadastros";
import { travaDoPeriodo } from "./periodos";

const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const falha = <T>(f: Falha): Resultado<T> => ({ ok: false, falha: f });

// INV-025-03: o que cada perfil vê no mural. Estudante: turmas dele (período aberto) e o curso dele; professor: turmas
// que leciona, cursos dessas turmas (período aberto) e os próprios; coordenador: o que é dos cursos que coordena.
async function filtroDoMural(sessao: Sessao): Promise<Prisma.ComunicadoWhereInput | null> {
  const eu = sessao.usuarioId;
  if (sessao.perfil === "Estudante") {
    const conta = await prisma.usuario.findUnique({ where: { id: eu }, select: { cursoId: true } });
    return { OR: [{ turma: { matriculas: { some: { estudanteId: eu } }, ...TURMA_DE_PERIODO_ABERTO } }, ...(conta?.cursoId ? [{ cursoId: conta.cursoId }] : [])] };
  }
  if (sessao.perfil === "Professor") {
    return { OR: [{ turma: { professorId: eu } }, { curso: { turmas: { some: { professorId: eu, ...TURMA_DE_PERIODO_ABERTO } } } }, { autorId: eu }] };
  }
  if (sessao.perfil === "Coordenador") return { OR: [{ turma: { curso: { coordenadorId: eu } } }, { curso: { coordenadorId: eu } }] };
  return null;
}

export async function consultarMural(sessao: Sessao) {
  const filtro = await filtroDoMural(sessao);
  if (!filtro) return null;
  const comunicados = await prisma.comunicado.findMany({
    where: filtro,
    select: {
      id: true,
      titulo: true,
      texto: true,
      criadoEm: true,
      autorId: true,
      autor: { select: { nome: true, perfil: true } },
      turma: { select: { nome: true, disciplina: { select: { nome: true } } } },
      curso: { select: { nome: true } },
    },
    orderBy: [{ criadoEm: "desc" }, { id: "asc" }],
    take: 100,
  });
  return comunicados.map((c) => ({
    id: c.id,
    titulo: c.titulo,
    texto: c.texto,
    criadoEm: c.criadoEm.toISOString(),
    autor: c.autor.perfil === "Coordenador" ? `${c.autor.nome} (coordenação)` : c.autor.perfil === "Professor" ? `Prof. ${c.autor.nome}` : c.autor.nome,
    meu: c.autorId === sessao.usuarioId,
    alcance: c.turma ? `${c.turma.nome} · ${c.turma.disciplina.nome}` : `${c.curso!.nome} · todas as turmas`,
  }));
}

// Turmas e cursos em que o perfil pode publicar (para o formulário).
export async function opcoesDePublicacao(sessao: Sessao) {
  if (sessao.perfil !== "Professor" && sessao.perfil !== "Coordenador") return null;
  const turmas = await prisma.turma.findMany({
    where: { ...(sessao.perfil === "Professor" ? { professorId: sessao.usuarioId } : { curso: { coordenadorId: sessao.usuarioId } }), ...TURMA_DE_PERIODO_ABERTO },
    select: { id: true, nome: true, disciplina: { select: { nome: true } } },
    orderBy: { nome: "asc" },
  });
  const cursos = sessao.perfil === "Coordenador" ? await prisma.curso.findMany({ where: { coordenadorId: sessao.usuarioId }, select: { id: true, nome: true }, orderBy: { nome: "asc" } }) : [];
  return { turmas: turmas.map((t) => ({ id: t.id, rotulo: `${t.nome} · ${t.disciplina.nome}` })), cursos };
}

// AC-025-01 a AC-025-06 / INV-025-02: só professor da turma ou coordenador do curso; período aberto (RB-20).
export async function publicarComunicado(sessao: Sessao, entrada: Record<string, unknown>) {
  if (sessao.perfil !== "Professor" && sessao.perfil !== "Coordenador") return falha({ tipo: "fora-do-escopo" });
  const validacao = validarComunicado(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  const { titulo, texto, alcance } = validacao.dados;
  const eu = sessao.usuarioId;

  let alvo: { turmaId: string | null; cursoId: string; rotulo: string; turmas: { id: string; professorId: string }[] };
  if (alcance.tipo === "turma") {
    const turma = await prisma.turma.findFirst({
      where: { id: alcance.turmaId, ...(sessao.perfil === "Professor" ? { professorId: eu } : { curso: { coordenadorId: eu } }) },
      select: { id: true, nome: true, cursoId: true, professorId: true, disciplina: { select: { nome: true } } },
    });
    if (!turma) return falha({ tipo: "fora-do-escopo" });
    const trava = await travaDoPeriodo({ id: turma.id });
    if (trava) return falha(trava);
    alvo = { turmaId: turma.id, cursoId: turma.cursoId, rotulo: `${turma.nome} · ${turma.disciplina.nome}`, turmas: [turma] };
  } else {
    if (sessao.perfil !== "Coordenador") return falha({ tipo: "fora-do-escopo" });
    const curso = await prisma.curso.findFirst({ where: { id: alcance.cursoId, coordenadorId: eu }, select: { id: true, nome: true } });
    if (!curso) return falha({ tipo: "fora-do-escopo" });
    const turmas = await prisma.turma.findMany({ where: { cursoId: curso.id, ...TURMA_DE_PERIODO_ABERTO }, select: { id: true, professorId: true } });
    if (turmas.length === 0) return falha({ tipo: "invalido", erros: { cursoId: "Este curso não tem turma em período aberto." } });
    alvo = { turmaId: null, cursoId: curso.id, rotulo: `${curso.nome} · todas as turmas`, turmas };
  }

  // Estudantes das turmas alcançadas e, quando o autor é o coordenador, os professores delas (sem o próprio autor).
  const matriculas = await prisma.matricula.findMany({ where: { turmaId: { in: alvo.turmas.map((t) => t.id) } }, select: { estudanteId: true } });
  const destinatarios = new Set(matriculas.map((m) => m.estudanteId));
  if (sessao.perfil === "Coordenador") for (const t of alvo.turmas) destinatarios.add(t.professorId);
  destinatarios.delete(eu);
  const autor = sessao.perfil === "Coordenador" ? `${sessao.nome} (coordenação)` : `Prof. ${sessao.nome}`;

  return sucesso(
    await executarEmTransacao(async (tx) => {
      const comunicado = await tx.comunicado.create({ data: { autorId: eu, turmaId: alvo.turmaId, cursoId: alvo.turmaId ? null : alvo.cursoId, titulo, texto }, select: { id: true, titulo: true } });
      const aviso = notificacaoComunicado(titulo, autor, alvo.rotulo);
      await tx.notificacao.createMany({ data: [...destinatarios].map((usuarioId) => ({ usuarioId, ...aviso })) });
      await auditar(tx, { autorId: eu, acao: "comunicado.publicado", cursoId: alvo.cursoId, turmaId: alvo.turmaId, descricao: `"${titulo}" para ${alvo.rotulo} (${destinatarios.size} notificado(s))`, depois: { titulo, texto } });
      return { ...comunicado, notificados: destinatarios.size };
    }),
  );
}

// AC-025-07 / AC-025-08 / INV-025-05: só o autor apaga; de outra pessoa ou inexistente, não encontrado.
export async function apagarComunicado(sessao: Sessao, id: string) {
  const comunicado = await prisma.comunicado.findFirst({
    where: { id, autorId: sessao.usuarioId },
    select: { id: true, titulo: true, texto: true, turmaId: true, cursoId: true, turma: { select: { cursoId: true } } },
  });
  if (!comunicado) return falha({ tipo: "nao-encontrado", erro: "Comunicado não encontrado." });
  return sucesso(
    await executarEmTransacao(async (tx) => {
      await tx.comunicado.delete({ where: { id } });
      await auditar(tx, {
        autorId: sessao.usuarioId,
        acao: "comunicado.apagado",
        cursoId: comunicado.cursoId ?? comunicado.turma?.cursoId ?? null,
        turmaId: comunicado.turmaId,
        descricao: `"${comunicado.titulo}"`,
        antes: { titulo: comunicado.titulo, texto: comunicado.texto },
      });
      return { id };
    }),
  );
}
