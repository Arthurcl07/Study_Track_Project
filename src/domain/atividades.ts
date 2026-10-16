// Regras da SPEC-005 para atividades e entregas (RF-08, RF-09, RB-08, OPEN-003, OPEN-010).
// ÚNICO lugar do código que decide o status de uma entrega (INV-005-06): sem Next.js, sem Prisma.
// Datas são tratadas como texto "AAAA-MM-DD" no fuso de Brasília: o prazo vale até o fim do dia.
import type { ErrosDeCampo, Validacao } from "./estrutura-academica";

export const STATUS_ENTREGA = ["NoPrazo", "Pendente", "Atrasada"] as const;
export type StatusEntrega = (typeof STATUS_ENTREGA)[number];

export const FUSO_ACADEMICO = "America/Sao_Paulo";

const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;

// "Hoje" no calendário de Brasília, como "AAAA-MM-DD" (o fuso do servidor não importa).
export function hojeEmBrasilia(agora: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO_ACADEMICO, year: "numeric", month: "2-digit", day: "2-digit" }).format(agora);
}

// Data de calendário válida no formato AAAA-MM-DD (rejeita 2026-02-30, por exemplo).
export function ehDataValida(texto: unknown): texto is string {
  if (typeof texto !== "string" || !FORMATO_DATA.test(texto)) return false;
  const data = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === texto;
}

// OPEN-010 / RB-08: status derivado na leitura. Comparação de textos AAAA-MM-DD = comparação de datas.
export function statusEntrega(prazo: string, dataEntrega: string | null, hoje: string): StatusEntrega {
  if (dataEntrega !== null) return dataEntrega <= prazo ? "NoPrazo" : "Atrasada";
  return hoje <= prazo ? "Pendente" : "Atrasada";
}

export type DadosAtividade = { descricao: string; prazo: string };

// RF-08: descrição e prazo obrigatórios; a turma (e a disciplina) vem da rota.
export function validarAtividade(entrada: Record<string, unknown>): Validacao<DadosAtividade> {
  const erros: ErrosDeCampo = {};
  const descricao = typeof entrada.descricao === "string" ? entrada.descricao.trim() : "";
  const prazo = typeof entrada.prazo === "string" ? entrada.prazo.trim() : "";

  if (!descricao) erros.descricao = "Informe a descrição da atividade.";
  if (!prazo) erros.prazo = "Informe o prazo.";
  else if (!ehDataValida(prazo)) erros.prazo = "Informe um prazo válido.";
  return Object.keys(erros).length > 0 ? { ok: false, erros } : { ok: true, dados: { descricao, prazo } };
}

// OPEN-003: a data da entrega é opcional (padrão: hoje) e não pode estar no futuro.
export function validarDataEntrega(entrada: unknown, hoje: string): Validacao<string> {
  const texto = typeof entrada === "string" ? entrada.trim() : "";
  if (!texto) return { ok: true, dados: hoje };
  if (!ehDataValida(texto)) return { ok: false, erros: { dataEntrega: "Informe uma data válida." } };
  if (texto > hoje) return { ok: false, erros: { dataEntrega: "A data da entrega não pode estar no futuro." } };
  return { ok: true, dados: texto };
}
