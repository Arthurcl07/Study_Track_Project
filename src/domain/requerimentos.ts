// Requerimentos (SPEC-036, RF-44, RB-34, OPEN-058). Funções puras: tipos, destino, validação, protocolo e transições.
import type { ErrosDeCampo, Validacao } from "./estrutura-academica";

export const TIPOS_REQUERIMENTO = ["RevisaoProva", "SegundaChamada", "DeclaracaoMatricula", "Trancamento", "Outro"] as const;
export type TipoRequerimento = (typeof TIPOS_REQUERIMENTO)[number];
export type StatusRequerimento = "Aberto" | "EmAnalise" | "Deferido" | "Indeferido";

export const ROTULO_TIPO_REQUERIMENTO: Record<TipoRequerimento, string> = {
  RevisaoProva: "Revisão de prova",
  SegundaChamada: "Segunda chamada",
  DeclaracaoMatricula: "Declaração de matrícula",
  Trancamento: "Trancamento",
  Outro: "Outro",
};
export const ROTULO_STATUS_REQUERIMENTO: Record<StatusRequerimento, string> = { Aberto: "Aberto", EmAnalise: "Em análise", Deferido: "Deferido", Indeferido: "Indeferido" };

export const PRAZO_DIAS_UTEIS = 5;

// RB-34: revisão de prova e segunda chamada vão para o professor da turma; o resto, para a secretaria.
export const exigeTurma = (tipo: TipoRequerimento) => tipo === "RevisaoProva" || tipo === "SegundaChamada";
export const destinoDoTipo = (tipo: TipoRequerimento): "Professor" | "Secretaria" => (exigeTurma(tipo) ? "Professor" : "Secretaria");

export function validarRequerimento(entrada: Record<string, unknown>): Validacao<{ tipo: TipoRequerimento; turmaId: string | null; avaliacaoId: string | null; descricao: string }> {
  const erros: ErrosDeCampo = {};
  const tipo = entrada.tipo as TipoRequerimento;
  const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const descricao = texto(entrada.descricao);
  const turmaId = texto(entrada.turmaId) || null;
  const avaliacaoId = texto(entrada.avaliacaoId) || null;
  const valido = (TIPOS_REQUERIMENTO as readonly unknown[]).includes(tipo);
  if (!valido) erros.tipo = "Escolha o tipo do requerimento.";
  else if (exigeTurma(tipo) && !turmaId) erros.turmaId = "Escolha a turma.";
  if (!descricao) erros.descricao = "Descreva o pedido.";
  else if (descricao.length > 1000) erros.descricao = "A descrição pode ter até 1.000 caracteres.";
  if (Object.keys(erros).length > 0) return { ok: false, erros };
  return { ok: true, dados: { tipo, turmaId: exigeTurma(tipo) ? turmaId : null, avaliacaoId: exigeTurma(tipo) ? avaliacaoId : null, descricao } };
}

// INV-036-01: protocolo "AAAA-NNNNNN" (sequência do ano).
export function protocolo(ano: string, sequencia: number): string {
  return `${ano}-${String(sequencia).padStart(6, "0")}`;
}

// RB-34 / INV-036-04: Aberto → Em análise; Aberto ou Em análise → Deferido ou Indeferido (com resposta). Decidido é final.
export function validarResposta(atual: StatusRequerimento, entrada: Record<string, unknown>): Validacao<{ status: StatusRequerimento; resposta: string | null }> | { ok: false; conflito: string } {
  const status = entrada.status as StatusRequerimento;
  const resposta = typeof entrada.resposta === "string" ? entrada.resposta.trim() : "";
  if (atual === "Deferido" || atual === "Indeferido") return { ok: false, conflito: `Este requerimento já foi ${atual === "Deferido" ? "deferido" : "indeferido"}.` };
  if (!["EmAnalise", "Deferido", "Indeferido"].includes(status)) return { ok: false, erros: { status: "Escolha Em análise, Deferido ou Indeferido." } };
  if (status === "EmAnalise" && atual === "EmAnalise") return { ok: false, conflito: "O requerimento já está em análise." };
  if (status === "Indeferido" && !resposta) return { ok: false, erros: { resposta: "Escreva o motivo do indeferimento." } };
  if (resposta.length > 1000) return { ok: false, erros: { resposta: "A resposta pode ter até 1.000 caracteres." } };
  return { ok: true, dados: { status, resposta: resposta || null } };
}

export const atrasado = (status: StatusRequerimento, prazo: string, hoje: string) => (status === "Aberto" || status === "EmAnalise") && hoje > prazo;
