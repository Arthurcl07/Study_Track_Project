// Comparativo entre semestres (SPEC-024, RF-33). Só leitura. Coordenador: turmas dos cursos que coordena, filtradas
// na própria query (RB-04, ADR-003, INV-024-03); o estudante usa as linhas do próprio histórico (SPEC-020).
import { mediaPorDisciplina, resumoPorPeriodo, type LinhaComparativo } from "@/domain/comparativo";
import { prisma } from "@/server/dados/prisma";

export async function comparativoDoCoordenador(coordenadorId: string, cursoIds: string[]) {
  const indicadores = await prisma.indicadorAcademico.findMany({
    where: { turma: { curso: { coordenadorId }, cursoId: { in: cursoIds } } },
    select: {
      media: true,
      frequenciaAtual: true,
      situacao: true,
      turma: { select: { periodo: true, periodoLetivo: { select: { status: true } }, disciplina: { select: { nome: true } } } },
    },
  });
  const linhas: LinhaComparativo[] = indicadores.map((i) => ({
    periodo: i.turma.periodo,
    encerrado: i.turma.periodoLetivo.status === "Encerrado",
    disciplina: i.turma.disciplina.nome,
    media: i.media,
    frequencia: i.frequenciaAtual,
    situacao: i.situacao,
  }));
  return { periodos: resumoPorPeriodo(linhas), porDisciplina: mediaPorDisciplina(linhas) };
}

export type ComparativoCoordenador = Awaited<ReturnType<typeof comparativoDoCoordenador>>;
