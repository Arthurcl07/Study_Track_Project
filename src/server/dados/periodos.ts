// Acesso a dados dos períodos letivos (SPEC-017, RF-26, RB-20).
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

// INV-017-05: sem período escolhido, só as turmas de períodos abertos; com período, só as daquele período.
export function filtroDePeriodo(periodo?: string | null): Prisma.TurmaWhereInput {
  return periodo ? { periodo } : { periodoLetivo: { status: "Aberto" } };
}

export const TURMA_DE_PERIODO_ABERTO: Prisma.TurmaWhereInput = { periodoLetivo: { status: "Aberto" } };

export function listarPeriodos() {
  return prisma.periodoLetivo.findMany({
    select: { id: true, nome: true, status: true, encerradoEm: true, _count: { select: { turmas: true } } },
    orderBy: { nome: "desc" },
  });
}

export function periodosAbertos() {
  return prisma.periodoLetivo.findMany({ where: { status: "Aberto" }, select: { id: true, nome: true }, orderBy: { nome: "desc" } });
}

// Períodos que têm alguma turma no escopo (para o filtro do relatório e do dashboard do coordenador).
export async function periodosDasTurmas(escopo: Prisma.TurmaWhereInput) {
  return prisma.periodoLetivo.findMany({
    where: { turmas: { some: escopo } },
    select: { nome: true, status: true },
    orderBy: { nome: "desc" },
  });
}

export function buscarPeriodo(id: string) {
  return prisma.periodoLetivo.findUnique({ where: { id }, select: { id: true, nome: true, status: true } });
}

export function periodoPorNome(nome: string) {
  return prisma.periodoLetivo.findUnique({ where: { nome }, select: { nome: true, status: true } });
}

export function criarPeriodo(nome: string, db: Prisma.TransactionClient | typeof prisma = prisma) {
  return db.periodoLetivo.create({ data: { nome }, select: { id: true, nome: true, status: true } });
}

export function mudarStatus(id: string, status: "Aberto" | "Encerrado", db: Prisma.TransactionClient | typeof prisma = prisma) {
  return db.periodoLetivo.update({
    where: { id },
    data: { status, encerradoEm: status === "Encerrado" ? new Date() : null },
    select: { id: true, nome: true, status: true, encerradoEm: true, _count: { select: { turmas: true } } },
  });
}

// RB-20 / INV-017-03: devolve o nome do período encerrado da turma que casa com o filtro, ou null.
// O filtro identifica a turma pela própria turma ou por algo dela (atividade, entrega, nota, plano, item).
export async function periodoEncerradoDaTurma(turma: Prisma.TurmaWhereInput) {
  const encontrada = await prisma.turma.findFirst({
    where: { AND: [turma, { periodoLetivo: { status: "Encerrado" } }] },
    select: { periodo: true },
  });
  return encontrada?.periodo ?? null;
}
