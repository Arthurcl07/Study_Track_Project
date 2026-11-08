// Diário de classe (SPEC-039, RF-47, RB-37, OPEN-061). Funções puras: o que falta para fechar e as transições.
import { elegivelAoExame } from "./situacao-academica";

export type StatusDiario = "Aberto" | "Fechado" | "Homologado";
export type AcaoDiario = "fechar" | "homologar" | "devolver" | "reabrir";

export type AvaliacaoDoDiario = { nome: string; tipo: "Prova" | "Trabalho" | "Substitutiva" | "Exame"; comNota: ReadonlySet<string> };
export type EstudanteDoDiario = { id: string; nome: string; media: number | null; frequencia: number | null };

// RB-37 / INV-039-01: Prova e Trabalho com nota de todos os cursando; Exame com nota de todos os que estão em exame.
export function pendenciasParaFechar(avaliacoes: readonly AvaliacaoDoDiario[], estudantes: readonly EstudanteDoDiario[]): string[] {
  const pendencias: string[] = [];
  for (const a of avaliacoes) {
    if (a.tipo === "Substitutiva") continue;
    const devem = a.tipo === "Exame" ? estudantes.filter((e) => elegivelAoExame(e.media, e.frequencia)) : estudantes;
    const faltam = devem.filter((e) => !a.comNota.has(e.id)).map((e) => e.nome);
    if (faltam.length > 0) pendencias.push(`${a.nome}: ${faltam.slice(0, 4).join(", ")}${faltam.length > 4 ? ` e mais ${faltam.length - 4}` : ""}`);
  }
  return pendencias;
}

// INV-039-03: Aberto → Fechado (professor); Fechado → Homologado ou Aberto/devolvido (coordenação); Homologado → Aberto.
export function proximoEstado(atual: StatusDiario, acao: AcaoDiario): StatusDiario | null {
  if (acao === "fechar") return atual === "Aberto" ? "Fechado" : null;
  if (acao === "homologar") return atual === "Fechado" ? "Homologado" : null;
  if (acao === "devolver") return atual === "Fechado" ? "Aberto" : null;
  return atual === "Homologado" ? "Aberto" : null;
}

export const ROTULO_DIARIO: Record<StatusDiario, string> = { Aberto: "Aberto", Fechado: "Fechado, aguardando homologação", Homologado: "Homologado" };

export function mensagemTransicaoInvalida(atual: StatusDiario, acao: AcaoDiario): string {
  const verbo = { fechar: "fechar", homologar: "homologar", devolver: "devolver", reabrir: "reabrir" }[acao];
  return `Não é possível ${verbo} um diário ${ROTULO_DIARIO[atual].toLowerCase()}.`;
}
