// Consultas dos dashboards por perfil (SPEC-016). O escopo vai dentro da própria query (ADR-003, INV-016-01);
// as do administrador só tocam em contas (RB-13, INV-016-05).
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export async function cursoDoEstudante(estudanteId: string) {
  const usuario = await prisma.usuario.findUnique({ where: { id: estudanteId }, select: { curso: { select: { nome: true } } } });
  return usuario?.curso?.nome ?? null;
}

// Planos ativos nas turmas indicadas (professor: as que leciona; coordenador: as dos seus cursos).
export function planosAtivos(turmas: Prisma.TurmaWhereInput) {
  return prisma.planoRecuperacao.findMany({
    where: { status: "Ativo", turma: turmas },
    select: {
      id: true,
      estudanteId: true,
      turmaId: true,
      estudante: { select: { nome: true } },
      turma: { select: { nome: true } },
      itens: { select: { concluido: true } },
    },
    orderBy: [{ turma: { nome: "asc" } }, { estudante: { nome: "asc" } }],
  });
}

// Matrículas em Risco nas turmas indicadas, para saber quem ainda está sem plano (RB-11).
export function matriculasEmRisco(turmas: Prisma.TurmaWhereInput) {
  return prisma.indicadorAcademico.findMany({
    where: { situacao: "Risco", turma: turmas },
    select: { estudanteId: true, turmaId: true, estudante: { select: { nome: true } }, turma: { select: { nome: true } } },
    orderBy: [{ estudante: { nome: "asc" } }],
  });
}

// RF-25: só perfil, situação e senha provisória — nenhum dado acadêmico.
export function contasParaContagem() {
  return prisma.usuario.findMany({ select: { perfil: true, ativo: true, trocarSenha: true } });
}

export function contasRecentes(quantidade = 5) {
  return prisma.usuario.findMany({
    select: { id: true, nome: true, perfil: true, criadaEm: true, trocarSenha: true },
    orderBy: [{ criadaEm: "desc" }, { nome: "asc" }],
    take: quantidade,
  });
}
