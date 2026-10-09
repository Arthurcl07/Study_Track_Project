// Acesso a dados do indicador acadêmico (SPEC-003). Consultas filtradas por escopo na própria query (ADR-003).
import type { Prisma, PrismaClient } from "@prisma/client";
import type { Situacao } from "@/domain/situacao-academica";
import type { Sessao } from "@/server/auth/token";
import { prisma } from "./prisma";

// Aceita o cliente normal ou o de uma transação: SPEC-004/005 recalculam na mesma transação da escrita.
export type ClienteBanco = PrismaClient | Prisma.TransactionClient;

export function estaMatriculado(estudanteId: string, turmaId: string, db: ClienteBanco = prisma) {
  return db.matricula.findUnique({ where: { estudanteId_turmaId: { estudanteId, turmaId } }, select: { turmaId: true } });
}

// Notas do estudante nas avaliações da turma, com o peso de cada avaliação.
export async function notasPonderadas(estudanteId: string, turmaId: string, db: ClienteBanco = prisma) {
  const notas = await db.nota.findMany({
    where: { estudanteId, avaliacao: { turmaId } },
    select: { valor: true, avaliacao: { select: { peso: true } } },
  });
  return notas.map((n) => ({ valor: n.valor, peso: n.avaliacao.peso }));
}

export async function frequenciaAtual(estudanteId: string, turmaId: string, db: ClienteBanco = prisma) {
  const registro = await db.frequencia.findUnique({
    where: { estudanteId_turmaId: { estudanteId, turmaId } },
    select: { percentual: true },
  });
  return registro?.percentual ?? null;
}

// INV-003-05: upsert pela chave única (estudante, turma) mantém um único indicador vigente.
export function salvarIndicador(
  dados: { estudanteId: string; turmaId: string; media: number | null; frequenciaAtual: number | null; situacao: Situacao },
  db: ClienteBanco = prisma,
) {
  const { estudanteId, turmaId, ...valores } = dados;
  const atualizacao = { ...valores, atualizadoEm: new Date() };
  return db.indicadorAcademico.upsert({
    where: { estudanteId_turmaId: { estudanteId, turmaId } },
    update: atualizacao,
    create: { estudanteId, turmaId, ...atualizacao },
  });
}

// RB-02, RB-03, RB-04: o filtro de escopo vai dentro da query; perfil sem regra não casa com nada.
function filtroIndicadoresDoEscopo(sessao: Sessao): Prisma.IndicadorAcademicoWhereInput {
  switch (sessao.perfil) {
    case "Estudante":
      return { estudanteId: sessao.usuarioId };
    case "Professor":
      return { turma: { professorId: sessao.usuarioId } };
    case "Coordenador":
      return { turma: { coordenadorId: sessao.usuarioId } };
    default:
      return { id: { in: [] } };
  }
}

export function listarIndicadoresDoEscopo(sessao: Sessao) {
  return prisma.indicadorAcademico.findMany({
    where: filtroIndicadoresDoEscopo(sessao),
    select: {
      media: true,
      frequenciaAtual: true,
      situacao: true,
      atualizadoEm: true,
      estudante: { select: { id: true, nome: true } },
      turma: { select: { id: true, nome: true, disciplina: { select: { nome: true } } } },
    },
    orderBy: [{ turma: { nome: "asc" } }, { estudante: { nome: "asc" } }],
  });
}
