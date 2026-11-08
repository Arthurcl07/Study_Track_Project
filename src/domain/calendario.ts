// Calendário acadêmico (SPEC-040, RF-48, RB-38, OPEN-062). Funções puras: eventos, dia letivo e dias úteis.
// Datas em "AAAA-MM-DD" (fuso de Brasília, como o resto do sistema).
import type { ErrosDeCampo, Validacao } from "./estrutura-academica";

export const TIPOS_EVENTO = ["InicioAulas", "FimAulas", "Feriado", "Recesso", "SemanaProvas", "Outro"] as const;
export type TipoEvento = (typeof TIPOS_EVENTO)[number];
export const ROTULO_EVENTO: Record<TipoEvento, string> = {
  InicioAulas: "Início das aulas",
  FimAulas: "Fim das aulas",
  Feriado: "Feriado",
  Recesso: "Recesso",
  SemanaProvas: "Semana de provas",
  Outro: "Outro",
};

export type Evento = { tipo: TipoEvento; titulo: string; inicio: string; fim: string };

const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");
export function dataValida(v: unknown): string | null {
  const d = texto(v);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  const data = new Date(`${d}T00:00:00Z`);
  return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === d ? d : null;
}

export function validarEvento(entrada: Record<string, unknown>): Validacao<Evento & { periodo: string }> {
  const erros: ErrosDeCampo = {};
  const periodo = texto(entrada.periodo);
  const tipo = entrada.tipo as TipoEvento;
  const titulo = texto(entrada.titulo);
  const inicio = dataValida(entrada.inicio);
  const fim = dataValida(entrada.fim) ?? (texto(entrada.fim) === "" ? inicio : null);
  if (!periodo) erros.periodo = "Escolha o período.";
  if (!(TIPOS_EVENTO as readonly unknown[]).includes(tipo)) erros.tipo = "Escolha o tipo do evento.";
  if (!titulo) erros.titulo = "Informe o título.";
  else if (titulo.length > 120) erros.titulo = "O título pode ter até 120 caracteres.";
  if (!inicio) erros.inicio = "Informe a data inicial.";
  if (!fim) erros.fim = "Informe a data final.";
  else if (inicio && fim < inicio) erros.fim = "A data final não pode ser antes da inicial.";
  return Object.keys(erros).length > 0 ? { ok: false, erros } : { ok: true, dados: { periodo, tipo, titulo, inicio: inicio!, fim: fim! } };
}

const dentro = (data: string, e: { inicio: string; fim: string }) => e.inicio <= data && data <= e.fim;

// RB-38 / INV-040-01: sem aula em feriado ou recesso; fora do intervalo início–fim das aulas, quando ele existe.
export function motivoSemAula(data: string, eventos: readonly Evento[]): string | null {
  const bloqueio = eventos.find((e) => (e.tipo === "Feriado" || e.tipo === "Recesso") && dentro(data, e));
  if (bloqueio) return `${data.split("-").reverse().join("/")} é ${bloqueio.tipo === "Feriado" ? "feriado" : "recesso"} no calendário (${bloqueio.titulo}). Não há aula nesse dia.`;
  const inicio = eventos.filter((e) => e.tipo === "InicioAulas").map((e) => e.inicio).sort()[0];
  const fim = eventos.filter((e) => e.tipo === "FimAulas").map((e) => e.fim).sort().at(-1);
  if (inicio && data < inicio) return `As aulas do período começam em ${inicio.split("-").reverse().join("/")}.`;
  if (fim && data > fim) return `As aulas do período terminaram em ${fim.split("-").reverse().join("/")}.`;
  return null;
}

function somarDias(data: string, dias: number) {
  const d = new Date(`${data}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

// RB-34: n dias úteis depois da data — sem sábados, domingos, feriados e recessos.
export function somarDiasUteis(data: string, n: number, eventos: readonly Evento[]): string {
  let atual = data;
  let contados = 0;
  while (contados < n) {
    atual = somarDias(atual, 1);
    const semana = new Date(`${atual}T00:00:00Z`).getUTCDay();
    const folga = semana === 0 || semana === 6 || eventos.some((e) => (e.tipo === "Feriado" || e.tipo === "Recesso") && dentro(atual, e));
    if (!folga) contados++;
  }
  return atual;
}

// Dias do mês "AAAA-MM", começando no domingo da primeira semana (grade de 5 ou 6 semanas).
export function diasDaGradeDoMes(mes: string): { data: string; doMes: boolean }[] {
  const primeiro = `${mes}-01`;
  const semana = new Date(`${primeiro}T00:00:00Z`).getUTCDay();
  const inicio = somarDias(primeiro, -semana);
  const dias = [];
  for (let i = 0; i < 42; i++) {
    const data = somarDias(inicio, i);
    if (i >= 35 && !data.startsWith(mes)) break;
    dias.push({ data, doMes: data.startsWith(mes) });
  }
  return dias;
}

export function mesValido(v: unknown, padrao: string): string {
  return typeof v === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(v) ? v : padrao;
}

export function mesVizinho(mes: string, delta: number): string {
  const [a, m] = mes.split("-").map(Number);
  const d = new Date(Date.UTC(a, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}
