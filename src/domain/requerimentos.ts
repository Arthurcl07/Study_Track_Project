// Requerimentos (SPEC-036, RF-44, RB-34, OPEN-058). Funções puras: tipos, destino, validação, protocolo e transições.
import type { ErrosDeCampo, Validacao } from "./estrutura-academica";

// SPEC-044: "Trancamento" é o trancamento de curso; "TrancamentoDisciplina", o de uma disciplina.
export const TIPOS_REQUERIMENTO = ["RevisaoProva", "SegundaChamada", "DeclaracaoMatricula", "TrancamentoDisciplina", "Trancamento", "Outro"] as const;
export type TipoRequerimento = (typeof TIPOS_REQUERIMENTO)[number];
export type StatusRequerimento = "Aberto" | "EmAnalise" | "Deferido" | "Indeferido";

export const ROTULO_TIPO_REQUERIMENTO: Record<TipoRequerimento, string> = {
  RevisaoProva: "Revisão de prova",
  SegundaChamada: "Segunda chamada",
  DeclaracaoMatricula: "Declaração de matrícula",
  TrancamentoDisciplina: "Trancamento de disciplina",
  Trancamento: "Trancamento de curso",
  Outro: "Outro",
};
export const ROTULO_STATUS_REQUERIMENTO: Record<StatusRequerimento, string> = { Aberto: "Aberto", EmAnalise: "Em análise", Deferido: "Deferido", Indeferido: "Indeferido" };

export const PRAZO_DIAS_UTEIS = 5;

// RB-34: revisão de prova e segunda chamada vão para o professor da turma; o resto, para a secretaria.
// SPEC-044 / RB-42: o trancamento de disciplina também exige a turma, mas vai para a secretaria.
export const vaiAoProfessor = (tipo: TipoRequerimento) => tipo === "RevisaoProva" || tipo === "SegundaChamada";
export const exigeTurma = (tipo: TipoRequerimento) => vaiAoProfessor(tipo) || tipo === "TrancamentoDisciplina";
export const destinoDoTipo = (tipo: TipoRequerimento): "Professor" | "Secretaria" => (vaiAoProfessor(tipo) ? "Professor" : "Secretaria");
export const ehTrancamento = (tipo: TipoRequerimento) => tipo === "Trancamento" || tipo === "TrancamentoDisciplina";

// RB-42: a disciplina só é trancada com a matrícula cursando, o diário da turma aberto e o período aberto.
export function motivoParaNaoTrancarDisciplina(s: { matricula: string | null; diario: string; periodo: string }): string | null {
  if (s.matricula !== "Cursando") return s.matricula === null ? "O estudante não está matriculado nesta turma." : `A matrícula nesta turma já está ${s.matricula === "Trancada" ? "trancada" : "cancelada"}.`;
  if (s.periodo !== "Aberto") return "O período desta turma está encerrado: não dá mais para trancar.";
  if (s.diario !== "Aberto") return "O diário desta turma já foi fechado pelo professor: não dá mais para trancar.";
  return null;
}

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
  return { ok: true, dados: { tipo, turmaId: exigeTurma(tipo) ? turmaId : null, avaliacaoId: vaiAoProfessor(tipo) ? avaliacaoId : null, descricao } };
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
