// Acesso a dados dos cursos (SPEC-015, RF-22). Só estrutura: nome, coordenador e contagens, nunca dado
// acadêmico (RB-13, INV-015-08).
import { prisma } from "./prisma";

const CURSO = {
  id: true,
  nome: true,
  coordenador: { select: { id: true, nome: true } },
  _count: { select: { grade: true, turmas: true, estudantes: true } },
} as const;

function formatar(curso: { id: string; nome: string; coordenador: { id: string; nome: string }; _count: { grade: number; turmas: number; estudantes: number } }) {
  const { _count, ...resto } = curso;
  return { ...resto, disciplinas: _count.grade, turmas: _count.turmas, estudantes: _count.estudantes };
}

export async function listarCursos() {
  return (await prisma.curso.findMany({ select: CURSO, orderBy: { nome: "asc" } })).map(formatar);
}

export function listarCursosResumidos() {
  return prisma.curso.findMany({ select: { id: true, nome: true }, orderBy: { nome: "asc" } });
}

export function buscarCurso(id: string) {
  return prisma.curso.findUnique({ where: { id }, select: { id: true } });
}

export function cursoComNome(nome: string) {
  return prisma.curso.findFirst({ where: { nome: { equals: nome, mode: "insensitive" } }, select: { id: true } });
}

// RB-17: perfil e situação da conta escolhida como coordenador.
export function contaParaCoordenar(id: string) {
  return prisma.usuario.findUnique({ where: { id }, select: { perfil: true, ativo: true } });
}

export function listarCoordenadoresAtivos() {
  return prisma.usuario.findMany({ where: { perfil: "Coordenador", ativo: true }, select: { id: true, nome: true }, orderBy: { nome: "asc" } });
}

export async function criarCurso(dados: { nome: string; coordenadorId: string }) {
  return formatar(await prisma.curso.create({ data: dados, select: CURSO }));
}

// A troca vale na hora: o escopo do coordenador é lido do curso a cada consulta (INV-015-07).
export async function trocarCoordenador(cursoId: string, coordenadorId: string) {
  return formatar(await prisma.curso.update({ where: { id: cursoId }, data: { coordenadorId }, select: CURSO }));
}
