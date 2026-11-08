// Comparativo entre semestres (SPEC-024, RF-33). Só leitura. Coordenador: turmas dos cursos que coordena, filtradas
// na própria query (RB-04, ADR-003, INV-024-03); o estudante usa as linhas do próprio histórico (SPEC-020).
import { MATRICULA_CURSANDO } from "@/server/dados/matriculas";
import { mediaPorDisciplina, resumoPorPeriodo, type LinhaComparativo } from "@/domain/comparativo";
import { prisma } from "@/server/dados/prisma";

export async function comparativoDoCoordenador(coordenadorId: string, cursoIds: string[]) {
  const indicadores = await prisma.indicadorAcademico.findMany({
    // SPEC-031 (RB-30): só matrículas cursando; SPEC-029: a nota do exame entra no resultado (RB-24).
    where: { turma: { curso: { coordenadorId }, cursoId: { in: cursoIds } }, matricula: MATRICULA_CURSANDO },
    select: {
      estudanteId: true,
      turmaId: true,
      media: true,
      frequenciaAtual: true,
      situacao: true,
      turma: { select: { periodo: true, periodoLetivo: { select: { status: true } }, disciplina: { select: { nome: true } } } },
    },
  });
  const exames = await prisma.nota.findMany({
    where: { avaliacao: { tipo: "Exame", turma: { curso: { coordenadorId }, cursoId: { in: cursoIds } } } },
    select: { estudanteId: true, valor: true, avaliacao: { select: { turmaId: true } } },
  });
  const exameDe = new Map(exames.map((e) => [`${e.estudanteId}:${e.avaliacao.turmaId}`, e.valor]));
  const linhas: LinhaComparativo[] = indicadores.map((i) => ({
    exame: exameDe.get(`${i.estudanteId}:${i.turmaId}`) ?? null,
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
