// Acesso a dados de avaliações e notas (SPEC-004). O filtro "professor responsável pela turma"
// vai dentro da própria query (ADR-003, RB-03): fora do escopo e inexistente dão o mesmo null.
import type { DadosAvaliacao } from "@/domain/registro-notas";
import type { ClienteBanco } from "./indicadores";
import { MATRICULA_CURSANDO } from "./matriculas";
import { prisma } from "./prisma";

export function turmaLecionada(professorId: string, turmaId: string) {
  return prisma.turma.findFirst({ where: { id: turmaId, professorId }, select: { id: true } });
}

export function criarAvaliacao(turmaId: string, dados: DadosAvaliacao, db: ClienteBanco = prisma) {
  return db.avaliacao.create({
    data: { ...dados, turmaId },
    select: { id: true, turmaId: true, nome: true, peso: true, data: true, tipo: true },
  });
}

// Avaliação da turma informada, numa turma que o professor leciona, com o estudante matriculado nela.
export function avaliacaoParaLancamento(
  professorId: string,
  entrada: { turmaId: string; avaliacaoId: string; estudanteId: string },
) {
  return prisma.avaliacao.findFirst({
    where: {
      id: entrada.avaliacaoId,
      turmaId: entrada.turmaId,
      turma: { professorId, matriculas: { some: { estudanteId: entrada.estudanteId, ...MATRICULA_CURSANDO } } },
    },
    select: { id: true, turmaId: true, tipo: true },
  });
}

// Nota já lançada numa turma que o professor leciona.
export function notaDoProfessor(professorId: string, notaId: string) {
  return prisma.nota.findFirst({
    where: { id: notaId, avaliacao: { turma: { professorId } } },
    select: { id: true, estudanteId: true, avaliacaoId: true, valor: true, avaliacao: { select: { turmaId: true } } },
  });
}

const NOTA_REGISTRADA = { id: true, valor: true, avaliacaoId: true, estudanteId: true, dataRegistro: true } as const;

export function inserirNota(dados: { avaliacaoId: string; estudanteId: string; valor: number }, db: ClienteBanco) {
  return db.nota.create({ data: dados, select: NOTA_REGISTRADA });
}

export function atualizarValorNota(notaId: string, valor: number, db: ClienteBanco) {
  return db.nota.update({ where: { id: notaId }, data: { valor }, select: NOTA_REGISTRADA });
}

// SPEC-013 / RB-16: registro de histórico, sempre na mesma transação da nota. Só existe inserção:
// a aplicação não tem operação para editar nem apagar registros.
export function registrarHistorico(
  dados: { avaliacaoId: string; estudanteId: string; autorId: string; valorAnterior: number | null; valorNovo: number },
  db: ClienteBanco,
) {
  return db.historicoNota.create({ data: dados, select: { id: true } });
}

export function executarEmTransacao<T>(operacao: (tx: ClienteBanco) => Promise<T>): Promise<T> {
  return prisma.$transaction((tx) => operacao(tx));
}

// Dados da tela de lançamento: só as turmas que o professor leciona (RB-03).
// SPEC-017 (RB-20): só turmas de períodos abertos, as únicas que aceitam lançamento.
export function turmasParaLancamento(professorId: string) {
  return prisma.turma.findMany({
    where: { professorId, periodoLetivo: { status: "Aberto" } },
    select: {
      id: true,
      nome: true,
      periodo: true,
      disciplina: { select: { nome: true } },
      avaliacoes: {
        // SPEC-029: o tipo (substitutiva e exame têm regras próprias).
        select: { id: true, nome: true, peso: true, data: true, tipo: true, notas: { select: { id: true, estudanteId: true, valor: true } } },
        orderBy: [{ data: "asc" }, { nome: "asc" }],
      },
      matriculas: {
        where: MATRICULA_CURSANDO,
        // SPEC-033: número de matrícula; SPEC-029: média e frequência para saber quem está em exame.
        select: { estudante: { select: { id: true, nome: true, ficha: { select: { numeroMatricula: true } } } } },
        orderBy: { estudante: { nome: "asc" } },
      },
      indicadores: { select: { estudanteId: true, media: true, frequenciaAtual: true } },
    },
    orderBy: [{ periodo: "desc" }, { nome: "asc" }],
  });
}
