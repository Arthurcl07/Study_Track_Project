// Acesso a dados do relatório (SPEC-009). O escopo do perfil vai dentro da query (ADR-003);
// perfil sem regra (Estudante) não casa com nada (INV-009-03).
import { MATRICULA_CURSANDO } from "./matriculas";
import type { Prisma } from "@prisma/client";
import type { Sessao } from "@/server/auth/token";
import { filtroDePeriodo } from "./periodos";
import { prisma } from "./prisma";

export function filtroTurmasDoRelatorio(sessao: Sessao): Prisma.TurmaWhereInput {
  if (sessao.perfil === "Professor") return { professorId: sessao.usuarioId };
  if (sessao.perfil === "Coordenador") return { curso: { coordenadorId: sessao.usuarioId } };
  return { id: { in: [] } };
}

// SPEC-017: sem período, só as turmas de períodos abertos (INV-017-05).
export function turmasDoRelatorio(sessao: Sessao, periodo?: string | null) {
  return prisma.turma.findMany({
    where: { AND: [filtroTurmasDoRelatorio(sessao), filtroDePeriodo(periodo)] },
    select: {
      id: true,
      nome: true,
      disciplina: { select: { nome: true } },
      curso: { select: { id: true, nome: true } },
      matriculas: { where: MATRICULA_CURSANDO, select: { estudante: { select: { id: true, nome: true } } }, orderBy: { estudante: { nome: "asc" } } },
      indicadores: { select: { estudanteId: true, media: true, frequenciaAtual: true, situacao: true } },
      atividades: { select: { prazo: true, entregas: { select: { estudanteId: true, dataEntrega: true } } } },
    },
    orderBy: [{ periodo: "desc" }, { nome: "asc" }],
  });
}

// SPEC-014: estudantes distintos em Risco nas turmas sob responsabilidade do coordenador (RB-04).
// SPEC-016: opcionalmente só nos cursos informados (filtro do dashboard, já recortado ao escopo).
export async function estudantesEmRiscoDoCoordenador(coordenadorId: string, cursoIds?: string[], periodo?: string | null) {
  const linhas = await prisma.indicadorAcademico.findMany({
    where: { situacao: "Risco", matricula: MATRICULA_CURSANDO, turma: { curso: { coordenadorId }, ...(cursoIds ? { cursoId: { in: cursoIds } } : {}), ...filtroDePeriodo(periodo) } },
    distinct: ["estudanteId"],
    select: { estudanteId: true },
  });
  return linhas.length;
}
