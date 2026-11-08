// Regras do boletim e do histórico escolar (SPEC-020, RF-29, RB-24, OPEN-044). Funções puras: sem Next.js nem Prisma.
// Os limites são os mesmos da classificação (RB-05 e RB-06), definidos em situacao-academica.ts.
import { FREQUENCIA_MINIMA, MEDIA_NORMAL, NOTA_FINAL_MINIMA_EXAME, notaFinalComExame } from "./situacao-academica";

// SPEC-029 e SPEC-031 (2026-11-06): Aprovado no exame (RB-29) e matrícula trancada ou cancelada (RB-30).
export type Resultado = "Aprovado" | "AprovadoExame" | "ReprovadoNota" | "ReprovadoFrequencia" | "ReprovadoNotaFrequencia" | "SemRegistro" | "EmCurso" | "Trancada" | "Cancelada";

export const ROTULO_RESULTADO: Record<Resultado, string> = {
  Aprovado: "Aprovado",
  AprovadoExame: "Aprovado no exame",
  Trancada: "Trancada",
  Cancelada: "Cancelada",
  ReprovadoNota: "Reprovado por nota",
  ReprovadoFrequencia: "Reprovado por frequência",
  ReprovadoNotaFrequencia: "Reprovado por nota e frequência",
  SemRegistro: "Sem registro",
  EmCurso: "Em curso",
};

export const ehAprovado = (r: Resultado) => r === "Aprovado" || r === "AprovadoExame";

export type TurmaParaResultado = {
  encerrado: boolean;
  media: number | null;
  frequencia: number | null;
  exame?: number | null;
  matricula?: "Cursando" | "Trancada" | "Cancelada";
};

// RB-24 / INV-020-02: resultado só em período encerrado; aberto = Em curso; faltando média ou frequência = Sem registro.
// RB-30: matrícula trancada ou cancelada mostra isso em qualquer período. RB-29: com exame vale a nota final (≥ 5,0).
export function resultadoDaTurma(turma: TurmaParaResultado): Resultado {
  if (turma.matricula === "Trancada" || turma.matricula === "Cancelada") return turma.matricula;
  if (!turma.encerrado) return "EmCurso";
  if (turma.media === null || turma.frequencia === null) return "SemRegistro";
  if (turma.media < MEDIA_NORMAL && turma.exame !== null && turma.exame !== undefined && turma.frequencia >= FREQUENCIA_MINIMA) {
    return notaFinalComExame(turma.media, turma.exame) >= NOTA_FINAL_MINIMA_EXAME ? "AprovadoExame" : "ReprovadoNota";
  }
  const nota = turma.media < MEDIA_NORMAL;
  const frequencia = turma.frequencia < FREQUENCIA_MINIMA;
  if (nota && frequencia) return "ReprovadoNotaFrequencia";
  if (nota) return "ReprovadoNota";
  if (frequencia) return "ReprovadoFrequencia";
  return "Aprovado";
}

// INV-020-04: carga horária aprovada = soma das cargas das turmas com resultado Aprovado.
export function resumoDoHistorico(linhas: readonly { cargaHoraria: number; resultado: Resultado }[]) {
  const aprovadas = linhas.filter((l) => ehAprovado(l.resultado));
  return { disciplinasAprovadas: aprovadas.length, cargaHorariaAprovada: aprovadas.reduce((s, l) => s + l.cargaHoraria, 0) };
}

// Boletim padrão: o período aberto mais recente em que o estudante tem turma; sem aberto, o mais recente.
export function periodoPadrao(periodos: readonly { nome: string; status: "Aberto" | "Encerrado" }[]): string | null {
  const ordenados = [...periodos].sort((a, b) => b.nome.localeCompare(a.nome));
  return (ordenados.find((p) => p.status === "Aberto") ?? ordenados[0])?.nome ?? null;
}
