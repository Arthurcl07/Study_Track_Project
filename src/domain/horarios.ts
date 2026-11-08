// Grade horária e salas (SPEC-041, RF-49, RB-39, OPEN-063). Funções puras: validação, sobreposição e grade.
import type { ErrosDeCampo, Validacao } from "./estrutura-academica";

export const DIAS_SEMANA = ["", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"] as const;
export const DIAS_CURTOS = ["", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

export type Horario = { diaSemana: number; inicio: string; fim: string };

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function validarHorario(entrada: Record<string, unknown>): Validacao<Horario & { salaId: string }> {
  const erros: ErrosDeCampo = {};
  const diaSemana = Number(entrada.diaSemana);
  const inicio = texto(entrada.inicio);
  const fim = texto(entrada.fim);
  const salaId = texto(entrada.salaId);
  if (!Number.isInteger(diaSemana) || diaSemana < 1 || diaSemana > 6) erros.diaSemana = "Escolha o dia (segunda a sábado).";
  if (!HORA.test(inicio)) erros.inicio = "Informe o início (HH:MM).";
  if (!HORA.test(fim)) erros.fim = "Informe o fim (HH:MM).";
  else if (HORA.test(inicio) && fim <= inicio) erros.fim = "O fim precisa ser depois do início.";
  if (!salaId) erros.salaId = "Escolha a sala.";
  return Object.keys(erros).length > 0 ? { ok: false, erros } : { ok: true, dados: { diaSemana, inicio, fim, salaId } };
}

export function validarSala(entrada: Record<string, unknown>): Validacao<{ nome: string; capacidade: number }> {
  const erros: ErrosDeCampo = {};
  const nome = texto(entrada.nome);
  const capacidade = Number(entrada.capacidade);
  if (!nome) erros.nome = "Informe o nome da sala.";
  else if (nome.length > 60) erros.nome = "O nome pode ter até 60 caracteres.";
  if (!Number.isInteger(capacidade) || capacidade <= 0 || capacidade > 1000) erros.capacidade = "A capacidade deve ser um número inteiro maior que zero.";
  return Object.keys(erros).length > 0 ? { ok: false, erros } : { ok: true, dados: { nome, capacidade } };
}

// RB-39 / INV-041-01: dois horários se sobrepõem no mesmo dia quando um começa antes do outro terminar.
export function sobrepoe(a: Horario, b: Horario): boolean {
  return a.diaSemana === b.diaSemana && a.inicio < b.fim && b.inicio < a.fim;
}

export const descreverHorario = (h: Horario) => `${DIAS_SEMANA[h.diaSemana]} ${h.inicio}–${h.fim}`;
export const descreverHorarioCurto = (h: Horario) => `${DIAS_CURTOS[h.diaSemana]} ${h.inicio}–${h.fim}`;

// INV-041-02: vagas não passam da menor capacidade das salas da turma (sem sala ou sem vagas: sem limite).
export function motivoVagasAcimaDaSala(vagas: number | null, capacidades: readonly number[]): string | null {
  if (vagas === null || capacidades.length === 0) return null;
  const menor = Math.min(...capacidades);
  return vagas > menor ? `As vagas (${vagas}) passam da capacidade da menor sala da turma (${menor} lugares).` : null;
}

export function validarVagas(valor: unknown): { ok: true; vagas: number | null } | { ok: false; erro: string } {
  if (valor === null || valor === undefined || valor === "") return { ok: true, vagas: null };
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 && n <= 1000 ? { ok: true, vagas: n } : { ok: false, erro: "As vagas devem ser um número inteiro maior que zero (ou vazio, sem limite)." };
}
