// Regras do plano de recuperação (SPEC-008; RB-11, RB-12, OPEN-012, OPEN-021). Funções puras.
import type { Validacao } from "./estrutura-academica";
import type { Situacao } from "./situacao-academica";

export const MAXIMO_ITENS_PLANO = 20;
export const MENSAGEM_FORA_DE_RISCO =
  "Só estudantes em situação de Risco podem receber plano de recuperação (RB-11).";

// INV-008-01 / RB-11: o plano só é criado para estudante em Risco.
export function podeReceberPlano(situacao: Situacao | null | undefined): boolean {
  return situacao === "Risco";
}

// OPEN-021: itens próprios do plano, informados um por linha (ou como lista). De 1 a 20 itens (INV-008-03).
export function validarItensPlano(entrada: unknown): Validacao<string[]> {
  const brutos = Array.isArray(entrada) ? entrada : typeof entrada === "string" ? entrada.split(/\r?\n/) : [];
  const itens = brutos.filter((i): i is string => typeof i === "string").map((i) => i.trim()).filter(Boolean);
  if (itens.length === 0) return { ok: false, erros: { itens: "Informe pelo menos um item do plano." } };
  if (itens.length > MAXIMO_ITENS_PLANO) {
    return { ok: false, erros: { itens: `Use no máximo ${MAXIMO_ITENS_PLANO} itens por plano.` } };
  }
  return { ok: true, dados: itens };
}

export type Progresso = { concluidos: number; total: number; percentual: number };

// RB-12 / INV-008-03: progresso = concluídos ÷ previstos, em percentual inteiro (arredondado).
export function progressoDoPlano(itens: readonly { concluido: boolean }[]): Progresso {
  const total = itens.length;
  const concluidos = itens.filter((i) => i.concluido).length;
  return { concluidos, total, percentual: total === 0 ? 0 : Math.round((concluidos / total) * 100) };
}
