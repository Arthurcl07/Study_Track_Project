// Frequência pela chamada (SPEC-018, RF-07, RF-27, RB-21, OPEN-041). Funções puras: sem Next.js nem Prisma.
// A classificação por frequência (RB-05) continua só em situacao-academica.ts.
// Até a SPEC-018 o professor digitava o percentual (SPEC-005); agora ele é calculado pelas presenças.
import type { ErrosDeCampo, Validacao } from "./estrutura-academica";

// RB-21 / INV-018-03: presenças ÷ aulas em que o estudante constou × 100; sem aula, não registrada (null).
export function frequenciaPelaChamada(presencas: readonly boolean[]): number | null {
  if (presencas.length === 0) return null;
  return (presencas.filter(Boolean).length / presencas.length) * 100;
}

export type DadosChamada = { data: string; presencas: { estudanteId: string; presente: boolean }[] };

export const MENSAGEM_DATA_AULA = "Informe a data da aula (até hoje).";
export const MENSAGEM_LISTA_CHAMADA = "A chamada precisa ter exatamente os estudantes matriculados na turma.";

// INV-018-02 e INV-018-06: data válida e não futura; um registro por estudante matriculado, nem mais nem menos.
export function validarChamada(entrada: Record<string, unknown>, matriculados: readonly string[], hoje: string): Validacao<DadosChamada> {
  const erros: ErrosDeCampo = {};
  const data = typeof entrada.data === "string" ? entrada.data.trim() : "";
  const valida = /^\d{4}-\d{2}-\d{2}$/.test(data) && !Number.isNaN(Date.parse(`${data}T00:00:00Z`)) && new Date(`${data}T00:00:00Z`).toISOString().slice(0, 10) === data;
  if (!valida || data > hoje) erros.data = MENSAGEM_DATA_AULA;

  const lista = Array.isArray(entrada.presencas) ? entrada.presencas : [];
  const presencas = lista.flatMap((p) => {
    const item = p as { estudanteId?: unknown; presente?: unknown };
    return typeof item?.estudanteId === "string" && typeof item.presente === "boolean" ? [{ estudanteId: item.estudanteId, presente: item.presente }] : [];
  });
  const ids = new Set(presencas.map((p) => p.estudanteId));
  const confere =
    presencas.length === lista.length && ids.size === presencas.length && ids.size === matriculados.length && matriculados.every((id) => ids.has(id));
  if (!confere || matriculados.length === 0) erros.presencas = MENSAGEM_LISTA_CHAMADA;

  return Object.keys(erros).length > 0 ? { ok: false, erros } : { ok: true, dados: { data, presencas } };
}
