// Rematrícula pelo estudante (SPEC-038, RF-46, RB-36, OPEN-060). Funções puras: janela e motivo de recusa.
import { dataValida } from "./calendario";
import { descreverHorarioCurto, sobrepoe, type Horario } from "./horarios";
import type { ErrosDeCampo, Validacao } from "./estrutura-academica";

export function janelaAberta(hoje: string, inicio: string | null, fim: string | null): boolean {
  return Boolean(inicio && fim && inicio <= hoje && hoje <= fim);
}

export function validarJanela(entrada: Record<string, unknown>): Validacao<{ inicio: string | null; fim: string | null }> {
  const vazio = (v: unknown) => v === null || v === undefined || v === "";
  if (vazio(entrada.inicio) && vazio(entrada.fim)) return { ok: true, dados: { inicio: null, fim: null } };
  const erros: ErrosDeCampo = {};
  const inicio = dataValida(entrada.inicio);
  const fim = dataValida(entrada.fim);
  if (!inicio) erros.inicio = "Informe o início da rematrícula.";
  if (!fim) erros.fim = "Informe o fim da rematrícula.";
  else if (inicio && fim < inicio) erros.fim = "O fim não pode ser antes do início.";
  return Object.keys(erros).length > 0 ? { ok: false, erros } : { ok: true, dados: { inicio, fim } };
}

export type HorarioComTurma = Horario & { turma: string };

export function choqueDeHorario(horarios: readonly Horario[], outros: readonly HorarioComTurma[]): string | null {
  for (const h of horarios) {
    const c = outros.find((o) => sobrepoe(o, h));
    if (c) return `Choque com ${c.turma} (${descreverHorarioCurto(c)})`;
  }
  return null;
}

export type SituacaoDaTurma = {
  matriculado: boolean;
  vagas: number | null;
  ocupadas: number;
  aprovado: boolean;
  requisitosFaltando: readonly string[];
  choque: string | null;
};

// RB-36: a primeira razão que impede a matrícula (null = pode).
export function motivoParaNaoRematricular(s: SituacaoDaTurma): string | null {
  if (s.matriculado) return "Você já está matriculado nesta turma.";
  if (s.aprovado) return "Você já foi aprovado nesta disciplina.";
  if (s.requisitosFaltando.length > 0) return `Falta pré-requisito: ${s.requisitosFaltando.join(", ")}.`;
  if (s.vagas !== null && s.ocupadas >= s.vagas) return "Sem vaga.";
  if (s.choque) return `${s.choque}.`;
  return null;
}

export const vagasRestantes = (vagas: number | null, ocupadas: number) => (vagas === null ? null : Math.max(vagas - ocupadas, 0));
