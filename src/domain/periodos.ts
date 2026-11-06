// Regras do período letivo (SPEC-017, RF-26, RB-20, OPEN-040). Funções puras: sem Next.js nem Prisma.
import type { Validacao } from "./estrutura-academica";

export type StatusPeriodo = "Aberto" | "Encerrado";

// INV-017-02: AAAA/1 ou AAAA/2 (primeiro ou segundo semestre).
const FORMATO = /^\d{4}\/[12]$/;

export const MENSAGEM_FORMATO_PERIODO = "Use o formato AAAA/1 ou AAAA/2 (ex.: 2027/1).";
export const MENSAGEM_PERIODO_EM_USO = "Já existe um período com este nome.";
export const MENSAGEM_PERIODO_NAO_ABERTO = "Escolha um período letivo aberto.";

export function validarPeriodo(entrada: Record<string, unknown>): Validacao<{ nome: string }> {
  const nome = typeof entrada.nome === "string" ? entrada.nome.trim() : "";
  if (!nome) return { ok: false, erros: { nome: "Informe o nome do período." } };
  if (!FORMATO.test(nome)) return { ok: false, erros: { nome: MENSAGEM_FORMATO_PERIODO } };
  return { ok: true, dados: { nome } };
}

// RB-20: mensagem única da trava, usada por todas as escritas acadêmicas.
export function mensagemPeriodoEncerrado(nome: string): string {
  return `O período ${nome} está encerrado: a turma é somente leitura.`;
}

// Mais recente primeiro: 2027/1, 2026/2, 2026/1 (o formato AAAA/N ordena como texto).
export function ordenarPeriodos<T extends { nome: string }>(periodos: readonly T[]): T[] {
  return [...periodos].sort((a, b) => b.nome.localeCompare(a.nome));
}
