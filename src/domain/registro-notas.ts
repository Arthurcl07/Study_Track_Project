// Validação do valor da nota e dos dados da avaliação (SPEC-004; OPEN-002, OPEN-017).
// Regras puras: sem Next.js nem Prisma. A faixa vem de situacao-academica.ts (OPEN-002) e a média
// continua sendo calcularMedia, no mesmo arquivo; aqui não há outra fórmula nem outra faixa.
import { NOTA_MAXIMA, NOTA_MINIMA } from "./situacao-academica";
import type { ErrosDeCampo, Validacao } from "./estrutura-academica";

export const MENSAGEM_NOTA_INVALIDA = `Valor inválido: informe uma nota de ${NOTA_MINIMA} a ${NOTA_MAXIMA}.`;

export type DadosAvaliacao = { nome: string; peso: number; data: Date };

// Aceita número ou texto numérico; vírgula decimal ("7,5") é lida como ponto.
function numero(valor: unknown): number {
  if (typeof valor === "number") return valor;
  if (typeof valor !== "string") return NaN;
  const texto = valor.trim().replace(",", ".");
  return texto === "" ? NaN : Number(texto);
}

// INV-004-04 / OPEN-002: só valores numéricos finitos de 0 a 10 seguem para o banco.
export function validarValorNota(entrada: unknown): Validacao<number> {
  const valor = numero(entrada);
  if (!Number.isFinite(valor) || valor < NOTA_MINIMA || valor > NOTA_MAXIMA) {
    return { ok: false, erros: { valor: MENSAGEM_NOTA_INVALIDA } };
  }
  return { ok: true, dados: valor };
}

// OPEN-017 / OPEN-002: avaliação com nome, peso maior que zero e data. A turma vem da rota.
export function validarAvaliacao(entrada: Record<string, unknown>): Validacao<DadosAvaliacao> {
  const erros: ErrosDeCampo = {};
  const nome = typeof entrada.nome === "string" ? entrada.nome.trim() : "";
  const peso = numero(entrada.peso);
  const textoData = typeof entrada.data === "string" ? entrada.data.trim() : "";
  const data = new Date(textoData);

  if (!nome) erros.nome = "Informe o nome da avaliação.";
  if (!Number.isFinite(peso) || peso <= 0) erros.peso = "O peso deve ser um número maior que zero.";
  if (!textoData || Number.isNaN(data.getTime())) erros.data = "Informe uma data válida.";
  return Object.keys(erros).length > 0 ? { ok: false, erros } : { ok: true, dados: { nome, peso, data } };
}
