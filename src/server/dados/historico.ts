// Consulta do histórico de notas (SPEC-013, RF-20). O escopo da turma vai dentro da própria query
// (ADR-003): coordenador = turmas sob sua responsabilidade; professor = turmas que leciona.
import type { Sessao } from "@/server/auth/token";
import { filtroTurmasDoEscopo } from "./estrutura";
import { prisma } from "./prisma";

export function turmasDoHistorico(sessao: Sessao) {
  return prisma.turma.findMany({
    where: filtroTurmasDoEscopo(sessao),
    select: { id: true, nome: true, disciplina: { select: { nome: true } } },
    orderBy: [{ periodo: "desc" }, { nome: "asc" }],
  });
}

export function historicoDaTurma(sessao: Sessao, turmaId: string) {
  return prisma.historicoNota.findMany({
    where: { avaliacao: { turma: { AND: [{ id: turmaId }, filtroTurmasDoEscopo(sessao)] } } },
    select: {
      id: true,
      valorAnterior: true,
      valorNovo: true,
      registradoEm: true,
      avaliacao: { select: { nome: true } },
      estudante: { select: { nome: true } },
      autor: { select: { nome: true } },
    },
    orderBy: { registradoEm: "desc" },
  });
}
