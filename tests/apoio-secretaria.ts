// Apoio dos testes da secretaria (SPEC-030 a SPEC-035): administrador com sessão e turma com estudantes.
import { randomUUID } from "node:crypto";
import { NOME_COOKIE_SESSAO } from "@/server/auth/token";
import { prisma } from "@/server/dados/prisma";
import { PREFIXO_DISCIPLINA_TESTE, criarUsuarioDeTeste, entrarComo } from "./apoio";

export const API = "http://localhost/api";

export async function entrar(perfil: "Estudante" | "Professor" | "Coordenador" | "Administrador", opcoes: { cursoId?: string } = {}) {
  const usuario = await criarUsuarioDeTeste(perfil, opcoes);
  return { usuario, token: await entrarComo(usuario.email, usuario.senha) };
}

export function requisicao(url: string, metodo: string, token: string, corpo?: unknown) {
  return new Request(url, {
    method: metodo,
    headers: { "content-type": "application/json", cookie: `${NOME_COOKIE_SESSAO}=${token}` },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
}

export const contexto = <T extends Record<string, string>>(params: T) => ({ params: Promise.resolve(params) });

// Curso de um coordenador com uma turma (professor) e estudantes matriculados.
export async function turmaComEstudantes(quantos: number, periodo = "2026/2") {
  const coordenador = await entrar("Coordenador");
  const professor = await criarUsuarioDeTeste("Professor");
  const cursoId = coordenador.usuario.cursoId;
  const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60, cursos: { create: { cursoId } } } });
  const turma = await prisma.turma.create({ data: { nome: `T-${randomUUID().slice(0, 6)}`, periodo, disciplinaId: disciplina.id, professorId: professor.id, cursoId } });
  const estudantes = [];
  for (let i = 0; i < quantos; i++) estudantes.push(await criarUsuarioDeTeste("Estudante", { cursoId }));
  await prisma.matricula.createMany({ data: estudantes.map((e) => ({ estudanteId: e.id, turmaId: turma.id })) });
  return { coordenador, professor, cursoId, disciplina, turma, estudantes };
}
