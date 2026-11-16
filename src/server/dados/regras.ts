// Regras de avaliação configuradas (SPEC-052, RB-47). A regra em si (os limites e a classificação) fica em
// src/domain/situacao-academica.ts; aqui só a leitura e a gravação.
import { REGRA_PADRAO, type RegraAvaliacao } from "@/domain/situacao-academica";
import type { ClienteBanco } from "./indicadores";
import { prisma } from "./prisma";

const CAMPOS = { mediaMinima: true, limiteRisco: true, frequenciaMinima: true, notaExame: true } as const;

// Regra vigente (períodos abertos). Sem instituição cadastrada, a padrão.
export async function regraVigente(db: ClienteBanco = prisma): Promise<RegraAvaliacao> {
  return (await db.instituicao.findUnique({ where: { id: 1 }, select: CAMPOS })) ?? REGRA_PADRAO;
}

type RegraDoPeriodo = { regraMediaMinima: number | null; regraLimiteRisco: number | null; regraFrequenciaMinima: number | null; regraNotaExame: number | null };

// INV-052-02: período encerrado usa a regra com que foi encerrado.
export function regraGuardada(p: RegraDoPeriodo | null | undefined): RegraAvaliacao | null {
  if (!p || p.regraMediaMinima === null || p.regraLimiteRisco === null || p.regraFrequenciaMinima === null || p.regraNotaExame === null) return null;
  return { mediaMinima: p.regraMediaMinima, limiteRisco: p.regraLimiteRisco, frequenciaMinima: p.regraFrequenciaMinima, notaExame: p.regraNotaExame };
}

export const CAMPOS_REGRA_DO_PERIODO = { status: true, regraMediaMinima: true, regraLimiteRisco: true, regraFrequenciaMinima: true, regraNotaExame: true } as const;

// Regra de cada período pelo nome: a guardada (encerrado) ou a vigente (aberto).
export async function regrasDosPeriodos(nomes: readonly string[], db: ClienteBanco = prisma): Promise<Map<string, RegraAvaliacao>> {
  const [vigente, periodos] = await Promise.all([regraVigente(db), db.periodoLetivo.findMany({ where: { nome: { in: [...new Set(nomes)] } }, select: { nome: true, ...CAMPOS_REGRA_DO_PERIODO } })]);
  return new Map(periodos.map((p) => [p.nome, (p.status === "Encerrado" ? regraGuardada(p) : null) ?? vigente]));
}

export async function regraDoPeriodo(nome: string, db: ClienteBanco = prisma): Promise<RegraAvaliacao> {
  return (await regrasDosPeriodos([nome], db)).get(nome) ?? (await regraVigente(db));
}

export async function regraDaTurma(turmaId: string, db: ClienteBanco = prisma): Promise<RegraAvaliacao> {
  const turma = await db.turma.findUnique({ where: { id: turmaId }, select: { periodoLetivo: { select: CAMPOS_REGRA_DO_PERIODO } } });
  return (turma?.periodoLetivo.status === "Encerrado" ? regraGuardada(turma.periodoLetivo) : null) ?? (await regraVigente(db));
}

export function regraParaGuardar(regra: RegraAvaliacao | null) {
  return {
    regraMediaMinima: regra?.mediaMinima ?? null,
    regraLimiteRisco: regra?.limiteRisco ?? null,
    regraFrequenciaMinima: regra?.frequenciaMinima ?? null,
    regraNotaExame: regra?.notaExame ?? null,
  };
}
