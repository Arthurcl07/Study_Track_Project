// Acesso a dados do indicador acadêmico (SPEC-003). Consultas filtradas por escopo na própria query (ADR-003).
import { MATRICULA_CURSANDO } from "./matriculas";
import type { Prisma, PrismaClient } from "@prisma/client";
import type { Situacao } from "@/domain/situacao-academica";
import type { Sessao } from "@/server/auth/token";
import { prisma } from "./prisma";

// Aceita o cliente normal ou o de uma transação: SPEC-004/005 recalculam na mesma transação da escrita.
export type ClienteBanco = PrismaClient | Prisma.TransactionClient;

export function estaMatriculado(estudanteId: string, turmaId: string, db: ClienteBanco = prisma) {
  return db.matricula.findUnique({ where: { estudanteId_turmaId: { estudanteId, turmaId } }, select: { turmaId: true } });
}

// SPEC-029: todas as avaliações da turma com tipo, peso e a nota do estudante (null = sem nota), para a média
// com substitutiva (RB-28); a prova sem nota conta como zero só na troca pela substitutiva.
export async function avaliacoesDaMedia(estudanteId: string, turmaId: string, db: ClienteBanco = prisma) {
  const avaliacoes = await db.avaliacao.findMany({
    where: { turmaId },
    select: { tipo: true, peso: true, notas: { where: { estudanteId }, select: { valor: true } } },
    orderBy: [{ data: "asc" }, { id: "asc" }],
  });
  return avaliacoes.map((a) => ({ tipo: a.tipo, peso: a.peso, valor: a.notas[0]?.valor ?? null }));
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
      return { turma: { curso: { coordenadorId: sessao.usuarioId } } };
    default:
      return { id: { in: [] } };
  }
}

// SPEC-006 / OPEN-004: alertas = indicadores vigentes em Atenção ou Risco, no escopo do perfil.
// Lidos na hora (nunca gravados), então refletem sempre o indicador atual (INV-006-02).
export function indicadoresEmAlertaDoEscopo(sessao: Sessao) {
  return prisma.indicadorAcademico.findMany({
    // SPEC-017 (INV-017-05): alertas só de turmas de períodos abertos.
    where: { AND: [filtroIndicadoresDoEscopo(sessao), { situacao: { in: ["Atencao", "Risco"] } }, { turma: { periodoLetivo: { status: "Aberto" } } }, { matricula: MATRICULA_CURSANDO }] },
    select: {
      media: true,
      frequenciaAtual: true,
      situacao: true,
      atualizadoEm: true,
      estudante: { select: { id: true, nome: true } },
      turma: { select: { id: true, nome: true, disciplina: { select: { nome: true } }, professor: { select: { nome: true } } } },
    },
    orderBy: [{ turma: { nome: "asc" } }, { estudante: { nome: "asc" } }],
  });
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
