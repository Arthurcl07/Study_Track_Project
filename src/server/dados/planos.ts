// Acesso a dados do dashboard da turma e dos planos de recuperação (SPEC-008). O professor só alcança
// turmas e planos das turmas que leciona, sempre dentro da própria query (ADR-003, RB-03).
import { prisma } from "./prisma";

export function turmaDoProfessorParaDashboard(professorId: string, turmaId: string) {
  return prisma.turma.findFirst({
    where: { id: turmaId, professorId },
    select: {
      id: true,
      nome: true,
      periodo: true,
      disciplina: { select: { nome: true } },
      matriculas: { select: { estudante: { select: { id: true, nome: true } } }, orderBy: { estudante: { nome: "asc" } } },
      indicadores: { select: { estudanteId: true, media: true, frequenciaAtual: true, situacao: true } },
      planos: {
        select: { id: true, status: true, criadoEm: true, estudanteId: true, itens: { select: { concluido: true } } },
        orderBy: { criadoEm: "desc" },
      },
    },
  });
}

// Estudante matriculado em turma do professor, com o indicador vigente (para a regra RB-11).
export function estudanteParaPlano(professorId: string, turmaId: string, estudanteId: string) {
  return prisma.turma.findFirst({
    where: { id: turmaId, professorId, matriculas: { some: { estudanteId } } },
    select: { id: true, indicadores: { where: { estudanteId }, select: { situacao: true } } },
  });
}

export function criarPlano(dados: { estudanteId: string; turmaId: string; professorId: string; itens: string[] }) {
  return prisma.planoRecuperacao.create({
    data: {
      estudanteId: dados.estudanteId,
      turmaId: dados.turmaId,
      professorId: dados.professorId,
      itens: { create: dados.itens.map((descricao, ordem) => ({ descricao, ordem })) },
    },
    select: { id: true, status: true, estudanteId: true, turmaId: true, professorId: true, itens: { select: { concluido: true } } },
  });
}

export function planoDoProfessor(professorId: string, planoId: string) {
  return prisma.planoRecuperacao.findFirst({
    where: { id: planoId, turma: { professorId } },
    select: {
      id: true,
      status: true,
      criadoEm: true,
      encerradoEm: true,
      estudante: { select: { id: true, nome: true } },
      turma: { select: { id: true, nome: true, disciplina: { select: { nome: true } } } },
      professor: { select: { nome: true } },
      itens: { select: { id: true, descricao: true, concluido: true, concluidoEm: true }, orderBy: { ordem: "asc" } },
      estudanteId: true,
      turmaId: true,
    },
  });
}

export function indicadorDoEstudanteNaTurma(estudanteId: string, turmaId: string) {
  return prisma.indicadorAcademico.findUnique({
    where: { estudanteId_turmaId: { estudanteId, turmaId } },
    select: { media: true, frequenciaAtual: true, situacao: true },
  });
}

export function itemDoProfessor(professorId: string, itemId: string) {
  return prisma.itemPlano.findFirst({
    where: { id: itemId, plano: { turma: { professorId } } },
    select: { id: true, planoId: true, plano: { select: { status: true } } },
  });
}

export function marcarItem(itemId: string, concluido: boolean) {
  return prisma.itemPlano.update({
    where: { id: itemId },
    data: { concluido, concluidoEm: concluido ? new Date() : null },
    select: { id: true, concluido: true, concluidoEm: true, planoId: true },
  });
}

export function itensDoPlano(planoId: string) {
  return prisma.itemPlano.findMany({ where: { planoId }, select: { concluido: true } });
}

export function encerrarPlano(planoId: string) {
  return prisma.planoRecuperacao.update({
    where: { id: planoId },
    data: { status: "Encerrado", encerradoEm: new Date() },
    select: { id: true, status: true, encerradoEm: true },
  });
}

// SPEC-012 / RF-19: planos do próprio estudante, filtrados pelo estudante da sessão na query (ADR-003, RB-02).
export function planosDoEstudante(estudanteId: string) {
  return prisma.planoRecuperacao.findMany({
    where: { estudanteId },
    select: {
      id: true,
      status: true,
      criadoEm: true,
      encerradoEm: true,
      turma: { select: { nome: true, disciplina: { select: { nome: true } } } },
      professor: { select: { nome: true } },
      itens: { select: { id: true, descricao: true, concluido: true }, orderBy: { ordem: "asc" } },
    },
    orderBy: { criadoEm: "desc" },
  });
}
