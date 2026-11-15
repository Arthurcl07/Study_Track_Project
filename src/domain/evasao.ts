// Evasão (SPEC-050, RF-59, RB-45, OPEN-071). Funções puras: sem Next.js nem Prisma. Calculada na leitura, nunca
// gravada (INV-050-01).
import { faltaAbonada, type IntervaloAbono } from "./frequencia";

export const FALTAS_SEGUIDAS_PARA_EVASAO = 3;
export const DIAS_SEM_PRESENCA_PARA_EVASAO = 14;

// Um registro por aula em que o estudante constou na chamada. Datas "AAAA-MM-DD".
export type RegistroDeAula = { data: string; presente: boolean };

export type Evasao = { faltasSeguidas: number; diasSemPresenca: number | null; motivo: "FaltasSeguidas" | "SemPresenca" };

const DIA_MS = 24 * 60 * 60 * 1000;
const diasEntre = (de: string, ate: string) => Math.round((Date.parse(`${ate}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / DIA_MS);

export function somarDias(data: string, dias: number): string {
  return new Date(Date.parse(`${data}T00:00:00Z`) + dias * DIA_MS).toISOString().slice(0, 10);
}

// As várias aulas de uma mesma data contam como um encontro: presente se veio a qualquer uma delas. Falta abonada
// (RB-31) conta como presença.
export function encontros(registros: readonly RegistroDeAula[], abonos: readonly IntervaloAbono[] = []): { data: string; presente: boolean }[] {
  const porData = new Map<string, boolean>();
  for (const r of registros) {
    const presente = r.presente || faltaAbonada(r.data, abonos);
    porData.set(r.data, (porData.get(r.data) ?? false) || presente);
  }
  return [...porData.entries()].map(([data, presente]) => ({ data, presente })).sort((a, b) => a.data.localeCompare(b.data));
}

// RB-45: falta nas 3 últimas aulas registradas, OU nenhuma presença nas aulas dos últimos 14 dias (tendo havido aula).
export function avaliarEvasao(registros: readonly RegistroDeAula[], hoje: string, abonos: readonly IntervaloAbono[] = []): Evasao | null {
  const lista = encontros(registros, abonos);
  if (lista.length === 0) return null;
  let faltasSeguidas = 0;
  for (let i = lista.length - 1; i >= 0 && !lista[i].presente; i--) faltasSeguidas++;
  const ultimaPresenca = [...lista].reverse().find((e) => e.presente)?.data ?? null;
  const inicioJanela = somarDias(hoje, -DIAS_SEM_PRESENCA_PARA_EVASAO);
  const naJanela = lista.filter((e) => e.data > inicioJanela && e.data <= hoje);
  const semPresencaNaJanela = naJanela.length > 0 && naJanela.every((e) => !e.presente);
  const diasSemPresenca = ultimaPresenca ? diasEntre(ultimaPresenca, hoje) : diasEntre(lista[0].data, hoje);
  if (faltasSeguidas >= FALTAS_SEGUIDAS_PARA_EVASAO) return { faltasSeguidas, diasSemPresenca, motivo: "FaltasSeguidas" };
  if (semPresencaNaJanela && diasSemPresenca >= DIAS_SEM_PRESENCA_PARA_EVASAO) return { faltasSeguidas, diasSemPresenca, motivo: "SemPresenca" };
  return null;
}

export function textoDoMotivo(e: Evasao): string {
  return e.motivo === "FaltasSeguidas" ? `${e.faltasSeguidas} faltas seguidas` : `Sem presença há ${e.diasSemPresenca} dias`;
}
