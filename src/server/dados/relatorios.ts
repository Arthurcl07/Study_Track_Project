// Acesso a dados do relatório (SPEC-009). O escopo do perfil vai dentro da query (ADR-003);
// perfil sem regra (Estudante) não casa com nada (INV-009-03).
import type { Prisma } from "@prisma/client";
import type { Sessao } from "@/server/auth/token";
import { prisma } from "./prisma";

function filtroTurmasDoRelatorio(sessao: Sessao): Prisma.TurmaWhereInput {
  if (sessao.perfil === "Professor") return { professorId: sessao.usuarioId };
  if (sessao.perfil === "Coordenador") return { coordenadorId: sessao.usuarioId };
  return { id: { in: [] } };
}

export function turmasDoRelatorio(sessao: Sessao) {
  return prisma.turma.findMany({
    where: filtroTurmasDoRelatorio(sessao),
    select: {
      id: true,
      nome: true,
      disciplina: { select: { nome: true } },
      matriculas: { select: { estudante: { select: { id: true, nome: true } } }, orderBy: { estudante: { nome: "asc" } } },
      indicadores: { select: { estudanteId: true, media: true, frequenciaAtual: true, situacao: true } },
      atividades: { select: { prazo: true, entregas: { select: { estudanteId: true, dataEntrega: true } } } },
    },
    orderBy: [{ periodo: "desc" }, { nome: "asc" }],
  });
}

// SPEC-014: estudantes distintos em Risco nas turmas sob responsabilidade do coordenador (RB-04).
export async function estudantesEmRiscoDoCoordenador(coordenadorId: string) {
  const linhas = await prisma.indicadorAcademico.findMany({
    where: { situacao: "Risco", turma: { coordenadorId } },
    distinct: ["estudanteId"],
    select: { estudanteId: true },
  });
  return linhas.length;
}
