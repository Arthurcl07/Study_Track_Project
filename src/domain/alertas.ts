// Regras da SPEC-006 (alertas) e da evolução da SPEC-007. Funções puras: sem Next.js, sem Prisma.
// A classificação Normal/Atenção/Risco continua só em situacao-academica.ts; aqui só se decide o que
// a partir dela vira alerta (INV-006-01) e como as notas formam a evolução (OPEN-011).
import type { Situacao } from "./situacao-academica";

export type NivelAlerta = "Atencao" | "Risco";

// INV-006-01 / RB-09: só Atenção e Risco geram alerta; Normal ou sem indicador, nenhum.
export function nivelDoAlerta(situacao: Situacao | null | undefined): NivelAlerta | null {
  return situacao === "Atencao" || situacao === "Risco" ? situacao : null;
}

// Risco antes de Atenção: o mais grave aparece primeiro.
export function prioridadeDoAlerta(nivel: NivelAlerta): number {
  return nivel === "Risco" ? 0 : 1;
}

export type PontoEvolucao = { avaliacao: string; data: string; nota: number };

// OPEN-011 / INV-007-04: evolução = notas já lançadas, em ordem de data da avaliação (empate: nome).
export function ordenarEvolucao(pontos: readonly PontoEvolucao[]): PontoEvolucao[] {
  return [...pontos].sort((a, b) => a.data.localeCompare(b.data) || a.avaliacao.localeCompare(b.avaliacao, "pt-BR"));
}
