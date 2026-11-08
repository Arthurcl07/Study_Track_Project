// Diário de classe (SPEC-039, RF-47, UC-36, RB-37). Fechar: professor da turma. Homologar, devolver e reabrir:
// coordenador do curso. Escopo na query (ADR-003); período encerrado bloqueia tudo (RB-20); auditoria na transação.
import { mensagemTransicaoInvalida, pendenciasParaFechar, proximoEstado, type AcaoDiario, type StatusDiario } from "@/domain/diario";
import { notificacaoDiarioDevolvido } from "@/domain/notificacoes";
import { auditar, turmaParaAuditoria } from "@/server/dados/auditoria";
import { MATRICULA_CURSANDO } from "@/server/dados/matriculas";
import { executarEmTransacao } from "@/server/dados/notas";
import { notificar } from "@/server/dados/notificacoes";
import { prisma } from "@/server/dados/prisma";
import type { Falha, Resultado } from "./cadastros";
import { travaDoPeriodo } from "./periodos";

const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const falha = <T>(f: Falha): Resultado<T> => ({ ok: false, falha: f });

// O que falta para fechar (para o cartão do professor e para a regra).
export async function pendenciasDoDiario(turmaId: string) {
  const turma = await prisma.turma.findUnique({
    where: { id: turmaId },
    select: {
      diario: true,
      diarioFechadoEm: true,
      diarioHomologadoEm: true,
      diarioObservacao: true,
      avaliacoes: { select: { nome: true, tipo: true, notas: { select: { estudanteId: true } } }, orderBy: [{ data: "asc" }, { nome: "asc" }] },
      matriculas: { where: MATRICULA_CURSANDO, select: { estudante: { select: { id: true, nome: true } } } },
      indicadores: { select: { estudanteId: true, media: true, frequenciaAtual: true } },
    },
  });
  if (!turma) return null;
  const estudantes = turma.matriculas.map(({ estudante }) => {
    const i = turma.indicadores.find((x) => x.estudanteId === estudante.id);
    return { id: estudante.id, nome: estudante.nome, media: i?.media ?? null, frequencia: i?.frequenciaAtual ?? null };
  });
  const avaliacoes = turma.avaliacoes.map((a) => ({ nome: a.nome, tipo: a.tipo, comNota: new Set(a.notas.map((n) => n.estudanteId)) }));
  return {
    status: turma.diario as StatusDiario,
    fechadoEm: turma.diarioFechadoEm?.toISOString() ?? null,
    homologadoEm: turma.diarioHomologadoEm?.toISOString() ?? null,
    observacao: turma.diarioObservacao,
    pendencias: pendenciasParaFechar(avaliacoes, estudantes),
    semAvaliacao: avaliacoes.length === 0,
  };
}

async function turmaDoDiario(turmaId: string, quem: { professorId?: string; coordenadorId?: string }) {
  return prisma.turma.findFirst({
    where: { id: turmaId, ...(quem.professorId ? { professorId: quem.professorId } : { curso: { coordenadorId: quem.coordenadorId } }) },
    select: { id: true, nome: true, diario: true, professorId: true, disciplina: { select: { nome: true } } },
  });
}

// AC-039-01 / AC-039-02 (professor) e AC-039-03 a AC-039-05 (coordenação).
export async function mudarDiario(turmaId: string, entrada: Record<string, unknown>, sessao: { usuarioId: string; perfil: string }) {
  const acao = entrada.acao as AcaoDiario;
  if (!["fechar", "homologar", "devolver", "reabrir"].includes(acao)) return falha({ tipo: "invalido", erros: { acao: "Ação inválida." } });
  const doProfessor = acao === "fechar";
  if (doProfessor !== (sessao.perfil === "Professor") || (!doProfessor && sessao.perfil !== "Coordenador")) return falha({ tipo: "fora-do-escopo" });
  const turma = await turmaDoDiario(turmaId, doProfessor ? { professorId: sessao.usuarioId } : { coordenadorId: sessao.usuarioId });
  if (!turma) return falha({ tipo: "nao-encontrado", erro: "Turma não encontrada." });
  const trava = await travaDoPeriodo({ id: turmaId }, { ignorarDiario: true });
  if (trava) return falha(trava);
  const atual = turma.diario as StatusDiario;
  const novo = proximoEstado(atual, acao);
  if (!novo) return falha({ tipo: "conflito", erro: mensagemTransicaoInvalida(atual, acao) });
  const observacao = typeof entrada.observacao === "string" ? entrada.observacao.trim() : "";
  if (acao === "devolver" && !observacao) return falha({ tipo: "invalido", erros: { observacao: "Escreva o que o professor precisa corrigir." } });
  if (observacao.length > 500) return falha({ tipo: "invalido", erros: { observacao: "A observação pode ter até 500 caracteres." } });
  if (acao === "fechar") {
    const estado = await pendenciasDoDiario(turmaId);
    if (estado!.semAvaliacao) return falha({ tipo: "conflito", erro: "A turma ainda não tem avaliação: não há o que fechar." });
    if (estado!.pendencias.length > 0) return falha({ tipo: "conflito", erro: `Faltam notas para fechar o diário — ${estado!.pendencias.join("; ")}.` });
  }
  const agora = new Date();
  return sucesso(
    await executarEmTransacao(async (tx) => {
      await tx.turma.update({
        where: { id: turmaId },
        data: {
          diario: novo,
          ...(acao === "fechar" ? { diarioFechadoEm: agora, diarioObservacao: null } : {}),
          ...(acao === "homologar" ? { diarioHomologadoEm: agora } : {}),
          ...(acao === "devolver" ? { diarioObservacao: observacao, diarioFechadoEm: null } : {}),
          ...(acao === "reabrir" ? { diarioHomologadoEm: null, diarioFechadoEm: null, diarioObservacao: observacao || null } : {}),
        },
      });
      const contexto = await turmaParaAuditoria(turmaId, tx);
      const acaoAuditoria = { fechar: "diario.fechado", homologar: "diario.homologado", devolver: "diario.devolvido", reabrir: "diario.reaberto" } as const;
      await auditar(tx, { autorId: sessao.usuarioId, acao: acaoAuditoria[acao], ...contexto, descricao: `${contexto.rotulo}${observacao ? `: ${observacao}` : ""}`, antes: { diario: atual }, depois: { diario: novo } });
      // AC-039-04: devolução avisa o professor.
      if (acao === "devolver") await notificar(tx, turma.professorId, notificacaoDiarioDevolvido(`${turma.nome} · ${turma.disciplina.nome}`, observacao));
      return { diario: novo };
    }),
  );
}

// Página Diários da coordenação: turmas de período aberto dos cursos dela, fechadas primeiro.
export async function listarDiarios(coordenadorId: string) {
  const turmas = await prisma.turma.findMany({
    where: { curso: { coordenadorId }, periodoLetivo: { status: "Aberto" } },
    select: { id: true, nome: true, diario: true, diarioFechadoEm: true, diarioHomologadoEm: true, diarioObservacao: true, disciplina: { select: { nome: true } }, professor: { select: { nome: true } }, curso: { select: { nome: true } } },
    orderBy: [{ diarioFechadoEm: "asc" }, { nome: "asc" }],
  });
  const ordem = { Fechado: 0, Aberto: 1, Homologado: 2 } as const;
  return turmas
    .map((t) => ({ id: t.id, rotulo: `${t.nome} · ${t.disciplina.nome}`, curso: t.curso.nome, professor: t.professor.nome, diario: t.diario as StatusDiario, fechadoEm: t.diarioFechadoEm?.toISOString() ?? null, homologadoEm: t.diarioHomologadoEm?.toISOString() ?? null, observacao: t.diarioObservacao }))
    .sort((a, b) => ordem[a.diario] - ordem[b.diario]);
}

export function contarDiariosParaHomologar(coordenadorId: string) {
  return prisma.turma.count({ where: { curso: { coordenadorId }, diario: "Fechado", periodoLetivo: { status: "Aberto" } } });
}
