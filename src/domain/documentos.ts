// Regras do boletim e do histórico escolar (SPEC-020, RF-29, RB-24, OPEN-044). Funções puras: sem Next.js nem Prisma.
// Os limites são os mesmos da classificação (RB-05 e RB-06), definidos em situacao-academica.ts.
import { FREQUENCIA_MINIMA, MEDIA_NORMAL } from "./situacao-academica";

export type Resultado = "Aprovado" | "ReprovadoNota" | "ReprovadoFrequencia" | "ReprovadoNotaFrequencia" | "SemRegistro" | "EmCurso";

export const ROTULO_RESULTADO: Record<Resultado, string> = {
  Aprovado: "Aprovado",
  ReprovadoNota: "Reprovado por nota",
  ReprovadoFrequencia: "Reprovado por frequência",
  ReprovadoNotaFrequencia: "Reprovado por nota e frequência",
  SemRegistro: "Sem registro",
  EmCurso: "Em curso",
};

// RB-24 / INV-020-02: resultado só em período encerrado; aberto = Em curso; faltando média ou frequência = Sem registro.
export function resultadoDaTurma(turma: { encerrado: boolean; media: number | null; frequencia: number | null }): Resultado {
  if (!turma.encerrado) return "EmCurso";
  if (turma.media === null || turma.frequencia === null) return "SemRegistro";
  const nota = turma.media < MEDIA_NORMAL;
  const frequencia = turma.frequencia < FREQUENCIA_MINIMA;
  if (nota && frequencia) return "ReprovadoNotaFrequencia";
  if (nota) return "ReprovadoNota";
  if (frequencia) return "ReprovadoFrequencia";
  return "Aprovado";
}

// INV-020-04: carga horária aprovada = soma das cargas das turmas com resultado Aprovado.
export function resumoDoHistorico(linhas: readonly { cargaHoraria: number; resultado: Resultado }[]) {
  const aprovadas = linhas.filter((l) => l.resultado === "Aprovado");
  return { disciplinasAprovadas: aprovadas.length, cargaHorariaAprovada: aprovadas.reduce((s, l) => s + l.cargaHoraria, 0) };
}

// Boletim padrão: o período aberto mais recente em que o estudante tem turma; sem aberto, o mais recente.
export function periodoPadrao(periodos: readonly { nome: string; status: "Aberto" | "Encerrado" }[]): string | null {
  const ordenados = [...periodos].sort((a, b) => b.nome.localeCompare(a.nome));
  return (ordenados.find((p) => p.status === "Aberto") ?? ordenados[0])?.nome ?? null;
}
