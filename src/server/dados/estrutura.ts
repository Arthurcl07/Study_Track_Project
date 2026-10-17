// Acesso a dados da estrutura acadêmica (SPEC-002). Toda consulta filtra pelo usuário
// autenticado dentro da própria query e nega por padrão (ADR-003, INV-002-06).
import type { Prisma } from "@prisma/client";
import type { DadosDisciplina, DadosTurma } from "@/domain/estrutura-academica";
import type { Sessao } from "@/server/auth/token";
import { prisma } from "./prisma";

// Filtro de escopo por perfil. Perfil sem regra recebe um filtro que não casa com nada.
export function filtroTurmasDoEscopo(sessao: Sessao): Prisma.TurmaWhereInput {
  switch (sessao.perfil) {
    case "Coordenador":
      return { coordenadorId: sessao.usuarioId };
    case "Professor":
      return { professorId: sessao.usuarioId };
    case "Estudante":
      return { matriculas: { some: { estudanteId: sessao.usuarioId } } };
    default:
      return { id: { in: [] } };
  }
}

const RESUMO_TURMA = {
  id: true,
  nome: true,
  periodo: true,
  disciplina: { select: { id: true, nome: true, cargaHoraria: true } },
  professor: { select: { id: true, nome: true } },
} satisfies Prisma.TurmaSelect;

const ESTUDANTES_DA_TURMA = {
  matriculas: {
    select: { estudante: { select: { id: true, nome: true, email: true } } },
    orderBy: { estudante: { nome: "asc" } },
  },
} satisfies Prisma.TurmaSelect;

// RB-02 / INV-001-04: o Estudante nunca recebe a lista de colegas da turma.
function selecaoParaPerfil(sessao: Sessao) {
  return sessao.perfil === "Estudante" ? RESUMO_TURMA : { ...RESUMO_TURMA, ...ESTUDANTES_DA_TURMA };
}

type TurmaConsultada = Prisma.TurmaGetPayload<{ select: typeof RESUMO_TURMA }> & {
  estudantes?: { id: string; nome: string; email: string }[];
};

function formatarTurma(turma: Record<string, unknown>): TurmaConsultada {
  const { matriculas, ...resto } = turma as Record<string, unknown> & {
    matriculas?: { estudante: { id: string; nome: string; email: string } }[];
  };
  const base = resto as unknown as TurmaConsultada;
  return matriculas ? { ...base, estudantes: matriculas.map((m) => m.estudante) } : base;
}

export async function listarTurmasDoEscopo(sessao: Sessao): Promise<TurmaConsultada[]> {
  const turmas = await prisma.turma.findMany({
    where: filtroTurmasDoEscopo(sessao),
    select: selecaoParaPerfil(sessao),
    orderBy: [{ periodo: "desc" }, { nome: "asc" }],
  });
  return turmas.map(formatarTurma);
}

// Devolve null tanto para turma inexistente quanto para turma fora do escopo (não revela existência).
export async function buscarTurmaDoEscopo(sessao: Sessao, turmaId: string): Promise<TurmaConsultada | null> {
  const turma = await prisma.turma.findFirst({
    where: { AND: [{ id: turmaId }, filtroTurmasDoEscopo(sessao)] },
    select: selecaoParaPerfil(sessao),
  });
  return turma ? formatarTurma(turma) : null;
}

export function turmaSobResponsabilidade(coordenadorId: string, turmaId: string) {
  return prisma.turma.findFirst({ where: { id: turmaId, coordenadorId }, select: { id: true } });
}

export function criarDisciplina(dados: DadosDisciplina) {
  return prisma.disciplina.create({ data: dados });
}

export function listarDisciplinas() {
  return prisma.disciplina.findMany({ orderBy: { nome: "asc" } });
}

export function buscarDisciplina(id: string) {
  return prisma.disciplina.findUnique({ where: { id }, select: { id: true } });
}

export function listarProfessores() {
  return prisma.usuario.findMany({
    where: { perfil: "Professor" },
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });
}

export function buscarProfessor(id: string) {
  return prisma.usuario.findFirst({ where: { id, perfil: "Professor" }, select: { id: true } });
}

// O coordenador que cria a turma passa a ser o responsável por ela (OPEN-001).
export function criarTurma(dados: DadosTurma, coordenadorId: string) {
  return prisma.turma.create({ data: { ...dados, coordenadorId }, select: RESUMO_TURMA });
}

// Cria o estudante e a matrícula na mesma transação: nada é persistido parcialmente (INV-002-05).
export function criarEstudanteMatriculado(
  dados: { nome: string; email: string; senhaHash: string },
  turmaId: string,
) {
  return prisma.$transaction(async (tx) => {
    const estudante = await tx.usuario.create({
      data: { ...dados, perfil: "Estudante" },
      select: { id: true, nome: true, email: true },
    });
    await tx.matricula.create({ data: { estudanteId: estudante.id, turmaId } });
    return estudante;
  });
}

export function buscarEstudantePorEmail(email: string) {
  return prisma.usuario.findFirst({
    where: { email: email.trim().toLowerCase(), perfil: "Estudante" },
    select: { id: true, nome: true, email: true },
  });
}

export function emailJaCadastrado(email: string) {
  return prisma.usuario.findUnique({ where: { email: email.trim().toLowerCase() }, select: { id: true } });
}

export function matricular(estudanteId: string, turmaId: string) {
  return prisma.matricula.upsert({
    where: { estudanteId_turmaId: { estudanteId, turmaId } },
    update: {},
    create: { estudanteId, turmaId },
  });
}
