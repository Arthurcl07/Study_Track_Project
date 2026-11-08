// Frequência pela chamada (SPEC-018, RF-07, RF-27, RB-21, OPEN-041). Funções puras: sem Next.js nem Prisma.
// A classificação por frequência (RB-05) continua só em situacao-academica.ts.
// Até a SPEC-018 o professor digitava o percentual (SPEC-005); agora ele é calculado pelas presenças.
import type { ErrosDeCampo, Validacao } from "./estrutura-academica";

// RB-21 / INV-018-03: presenças ÷ aulas em que o estudante constou × 100; sem aula, não registrada (null).
export function frequenciaPelaChamada(presencas: readonly boolean[]): number | null {
  if (presencas.length === 0) return null;
  return (presencas.filter(Boolean).length / presencas.length) * 100;
}

// SPEC-032 / RB-31: falta numa aula dentro do intervalo de um abono conta como presença. Datas "AAAA-MM-DD".
export type IntervaloAbono = { inicio: string; fim: string };

export function faltaAbonada(data: string, abonos: readonly IntervaloAbono[]): boolean {
  return abonos.some((a) => a.inicio <= data && data <= a.fim);
}

// INV-032-01 / INV-032-02: presença continua presença; falta abonada vira presença (abonos sobrepostos contam uma vez).
export function presencasEfetivas(registros: readonly { data: string; presente: boolean }[], abonos: readonly IntervaloAbono[]): boolean[] {
  return registros.map((r) => r.presente || faltaAbonada(r.data, abonos));
}

export type PresencaDoEstudante = { estudanteId: string; presente: boolean };
// SPEC-028 (OPEN-050): de 1 a 4 aulas na mesma data; aulas[0] é a 1ª aula, aulas[1] a 2ª...
export type DadosChamada = { data: string; aulas: PresencaDoEstudante[][]; presencas: PresencaDoEstudante[] };

export const MAXIMO_AULAS_POR_DATA = 4;
export const MENSAGEM_QUANTIDADE_AULAS = `Registre de 1 a ${MAXIMO_AULAS_POR_DATA} aulas na data.`;

export const MENSAGEM_DATA_AULA = "Informe a data da aula (até hoje).";
export const MENSAGEM_LISTA_CHAMADA = "A chamada precisa ter exatamente os estudantes matriculados na turma.";

export function dataDeAulaValida(valor: unknown, hoje: string): string | null {
  const data = typeof valor === "string" ? valor.trim() : "";
  const valida = /^\d{4}-\d{2}-\d{2}$/.test(data) && !Number.isNaN(Date.parse(`${data}T00:00:00Z`)) && new Date(`${data}T00:00:00Z`).toISOString().slice(0, 10) === data;
  return valida && data <= hoje ? data : null;
}

function lerPresencas(lista: unknown, matriculados: readonly string[]): PresencaDoEstudante[] | null {
  const itens = Array.isArray(lista) ? lista : [];
  const presencas = itens.flatMap((p) => {
    const item = p as { estudanteId?: unknown; presente?: unknown };
    return typeof item?.estudanteId === "string" && typeof item.presente === "boolean" ? [{ estudanteId: item.estudanteId, presente: item.presente }] : [];
  });
  const ids = new Set(presencas.map((p) => p.estudanteId));
  const confere = presencas.length === itens.length && ids.size === presencas.length && ids.size === matriculados.length && matriculados.every((id) => ids.has(id));
  return confere && matriculados.length > 0 ? presencas : null;
}

// INV-018-02 e INV-018-06: data válida e não futura; um registro por estudante matriculado, nem mais nem menos.
// SPEC-028: "aulas" traz de 1 a 4 listas (uma por aula da data); "presencas" sozinho é a 1ª aula da data.
export function validarChamada(entrada: Record<string, unknown>, matriculados: readonly string[], hoje: string): Validacao<DadosChamada> {
  const erros: ErrosDeCampo = {};
  const data = dataDeAulaValida(entrada.data, hoje);
  if (!data) erros.data = MENSAGEM_DATA_AULA;

  const listas = Array.isArray(entrada.aulas) ? entrada.aulas : [entrada.presencas];
  if (listas.length < 1 || listas.length > MAXIMO_AULAS_POR_DATA) erros.aulas = MENSAGEM_QUANTIDADE_AULAS;
  const aulas = listas.map((l) => lerPresencas(l, matriculados));
  if (aulas.some((a) => a === null)) erros.presencas = MENSAGEM_LISTA_CHAMADA;

  if (Object.keys(erros).length > 0 || !data) return { ok: false, erros };
  const validas = aulas as PresencaDoEstudante[][];
  return { ok: true, dados: { data, aulas: validas, presencas: validas[0] } };
}
