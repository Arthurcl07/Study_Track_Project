// Acesso a dados da estrutura acadêmica (SPEC-002). Toda consulta filtra pelo usuário
// autenticado dentro da própria query e nega por padrão (ADR-003, INV-002-06).
import type { Prisma } from "@prisma/client";
import type { DadosDisciplina, DadosTurma } from "@/domain/estrutura-academica";
import type { Sessao } from "@/server/auth/token";
import { prisma } from "./prisma";

// Filtro de escopo por perfil. Perfil sem regra recebe um filtro que não casa com nada.
// SPEC-015 / RB-04: as turmas do coordenador são as dos cursos que ele coordena (INV-015-07).
export function filtroTurmasDoEscopo(sessao: Sessao): Prisma.TurmaWhereInput {
  switch (sessao.perfil) {
    case "Coordenador":
      return { curso: { coordenadorId: sessao.usuarioId } };
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
  curso: { select: { id: true, nome: true } },
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

// SPEC-015: a turma está sob a responsabilidade do coordenador quando o curso dela é dele (RB-04).
export function turmaSobResponsabilidade(coordenadorId: string, turmaId: string) {
  return prisma.turma.findFirst({ where: { id: turmaId, curso: { coordenadorId } }, select: { id: true, cursoId: true } });
}

// SPEC-015 / OPEN-030: cursos que o coordenador coordena (o escopo dele).
export function cursosDoCoordenador(coordenadorId: string) {
  return prisma.curso.findMany({ where: { coordenadorId }, select: { id: true, nome: true }, orderBy: { nome: "asc" } });
}

// RF-23 / OPEN-033: a disciplina nova já nasce na grade do curso escolhido.
export function criarDisciplina(dados: DadosDisciplina, cursoId: string) {
  return prisma.disciplina.create({ data: { ...dados, cursos: { create: { cursoId } } } });
}

// Disciplinas da grade dos cursos informados, com todos os cursos em que cada uma está (OPEN-031).
export function disciplinasDosCursos(cursoIds: string[]) {
  return prisma.disciplina.findMany({
    where: { cursos: { some: { cursoId: { in: cursoIds } } } },
    select: {
      id: true,
      nome: true,
      cargaHoraria: true,
      cursos: { select: { curso: { select: { id: true, nome: true } } }, orderBy: { curso: { nome: "asc" } } },
    },
    orderBy: { nome: "asc" },
  });
}

// Disciplinas que ainda não estão na grade do curso, para "Adicionar disciplina de outro curso".
export function disciplinasForaDaGrade(cursoId: string) {
  return prisma.disciplina.findMany({
    where: { cursos: { none: { cursoId } } },
    select: { id: true, nome: true, cursos: { select: { curso: { select: { nome: true } } }, orderBy: { curso: { nome: "asc" } } } },
    orderBy: { nome: "asc" },
  });
}

export async function gradeDoCurso(cursoId: string) {
  const linhas = await prisma.cursoDisciplina.findMany({ where: { cursoId }, select: { disciplinaId: true } });
  return linhas.map((l) => l.disciplinaId);
}

// INV-015-04: a chave composta (curso, disciplina) impede duplicar a disciplina na grade.
export function adicionarDisciplinaAGrade(cursoId: string, disciplinaId: string) {
  return prisma.cursoDisciplina.create({ data: { cursoId, disciplinaId }, select: { cursoId: true, disciplinaId: true } });
}

export function buscarDisciplina(id: string) {
  return prisma.disciplina.findUnique({ where: { id }, select: { id: true } });
}

// Só professores ativos podem receber turma (SPEC-010, RF-17, INV-010-07).
export function listarProfessores() {
  return prisma.usuario.findMany({
    where: { perfil: "Professor", ativo: true },
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });
}

export function buscarProfessor(id: string) {
  return prisma.usuario.findFirst({ where: { id, perfil: "Professor", ativo: true }, select: { id: true } });
}

// RF-17 / INV-010-07: a turma e seus planos de recuperação ATIVOS passam ao novo professor na mesma
// transação (INV-008-02); planos encerrados mantêm o professor que os conduziu.
export function trocarProfessorDaTurma(turmaId: string, professorId: string) {
  return prisma.$transaction(async (tx) => {
    const turma = await tx.turma.update({ where: { id: turmaId }, data: { professorId }, select: RESUMO_TURMA });
    await tx.planoRecuperacao.updateMany({ where: { turmaId, status: "Ativo" }, data: { professorId } });
    return turma;
  });
}

// SPEC-015 / RB-18: a turma é de exatamente 1 curso; o coordenador responsável é o do curso.
export function criarTurma(dados: DadosTurma, cursoId: string) {
  return prisma.turma.create({ data: { ...dados, cursoId }, select: RESUMO_TURMA });
}

// Cria o estudante e a matrícula na mesma transação: nada é persistido parcialmente (INV-002-05).
// SPEC-015 / RB-19: o estudante pertence ao curso da turma.
export function criarEstudanteMatriculado(
  dados: { nome: string; email: string; senhaHash: string },
  turma: { id: string; cursoId: string },
) {
  const turmaId = turma.id;
  return prisma.$transaction(async (tx) => {
    const estudante = await tx.usuario.create({
      // RB-15 (SPEC-011): a senha inicial informada pelo coordenador é provisória.
      data: { ...dados, perfil: "Estudante", trocarSenha: true, cursoId: turma.cursoId },
      select: { id: true, nome: true, email: true },
    });
    await tx.matricula.create({ data: { estudanteId: estudante.id, turmaId } });
    return estudante;
  });
}

export function buscarEstudantePorEmail(email: string) {
  return prisma.usuario.findFirst({
    where: { email: email.trim().toLowerCase(), perfil: "Estudante" },
    select: { id: true, nome: true, email: true, cursoId: true },
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
