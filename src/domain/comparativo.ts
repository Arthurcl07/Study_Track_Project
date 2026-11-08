// Comparativo entre semestres (SPEC-024, RF-33, OPEN-046). Funções puras: sem Next.js nem Prisma.
// O resultado de cada matrícula usa a regra única do histórico (RB-24, resultadoDaTurma).
import { ehAprovado, resultadoDaTurma } from "./documentos";
import type { Situacao } from "./situacao-academica";

export type LinhaComparativo = { periodo: string; encerrado: boolean; disciplina: string; media: number | null; frequencia: number | null; situacao: Situacao | null; exame?: number | null };

export type ResumoPeriodo = {
  periodo: string;
  encerrado: boolean;
  matriculas: number;
  media: number | null;
  frequencia: number | null;
  percentualRisco: number | null;
  percentualAprovacao: number | null;
};

const mediaSimples = (valores: (number | null)[]) => {
  const v = valores.filter((x): x is number => x !== null);
  return v.length === 0 ? null : v.reduce((s, x) => s + x, 0) / v.length;
};
const percentual = (parte: number, todo: number) => (todo === 0 ? null : (parte / todo) * 100);

// INV-024-01 / INV-024-02: médias simples (como o relatório); % em Risco sobre as matrículas com situação;
// % de aprovação só em período encerrado, sobre as matrículas com resultado (sem "Sem registro").
export function resumoPorPeriodo(linhas: readonly LinhaComparativo[]): ResumoPeriodo[] {
  const periodos = [...new Set(linhas.map((l) => l.periodo))].sort();
  return periodos.map((periodo) => {
    const doPeriodo = linhas.filter((l) => l.periodo === periodo);
    const encerrado = doPeriodo.every((l) => l.encerrado);
    const comSituacao = doPeriodo.filter((l) => l.situacao !== null);
    const resultados = encerrado ? doPeriodo.map((l) => resultadoDaTurma(l)).filter((r) => r !== "SemRegistro") : [];
    return {
      periodo,
      encerrado,
      matriculas: doPeriodo.length,
      media: mediaSimples(doPeriodo.map((l) => l.media)),
      frequencia: mediaSimples(doPeriodo.map((l) => l.frequencia)),
      percentualRisco: percentual(comSituacao.filter((l) => l.situacao === "Risco").length, comSituacao.length),
      percentualAprovacao: encerrado ? percentual(resultados.filter(ehAprovado).length, resultados.length) : null,
    };
  });
}

// Média de cada disciplina em cada período (null quando a disciplina não teve turma com média no período).
export function mediaPorDisciplina(linhas: readonly LinhaComparativo[]) {
  const periodos = [...new Set(linhas.map((l) => l.periodo))].sort();
  const disciplinas = [...new Set(linhas.map((l) => l.disciplina))].sort((a, b) => a.localeCompare(b));
  return {
    periodos,
    linhas: disciplinas.map((disciplina) => ({
      disciplina,
      medias: periodos.map((p) => mediaSimples(linhas.filter((l) => l.disciplina === disciplina && l.periodo === p).map((l) => l.media))),
    })),
  };
}

// Tendência entre dois valores: "sobe", "desce" ou "igual" (diferença menor que 0,05 conta como igual).
export function tendencia(anterior: number | null, atual: number | null): "sobe" | "desce" | "igual" | null {
  if (anterior === null || atual === null) return null;
  if (Math.abs(atual - anterior) < 0.05) return "igual";
  return atual > anterior ? "sobe" : "desce";
}
