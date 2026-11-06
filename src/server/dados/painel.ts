// Acesso a dados do painel do estudante (SPEC-007). Tudo filtrado pelo estudante dentro da própria
// query (ADR-003, INV-007-01/03): turmas em que está matriculado, só as PRÓPRIAS notas e indicadores.
import { prisma } from "./prisma";

export function turmasDoPainel(estudanteId: string) {
  return prisma.turma.findMany({
    // SPEC-017 (INV-017-05): o painel mostra só turmas de períodos abertos; as anteriores ficam no histórico escolar.
    where: { matriculas: { some: { estudanteId } }, periodoLetivo: { status: "Aberto" } },
    select: {
      id: true,
      nome: true,
      periodo: true,
      disciplina: { select: { nome: true } },
      professor: { select: { nome: true } },
      avaliacoes: {
        // SPEC-023: o peso entra no simulador de notas (RB-25).
        select: { nome: true, data: true, peso: true, notas: { where: { estudanteId }, select: { valor: true } } },
      },
      indicadores: {
        where: { estudanteId },
        select: { media: true, frequenciaAtual: true, situacao: true, atualizadoEm: true },
      },
    },
    orderBy: [{ periodo: "desc" }, { disciplina: { nome: "asc" } }],
  });
}
