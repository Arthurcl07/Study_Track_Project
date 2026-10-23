// Apoio aos testes: cada teste cria os próprios usuários e os remove ao final (estrategia-testes.md, seção 7).
import { randomUUID } from "node:crypto";
import type { Perfil } from "@/domain/perfil";
import { salvarConta } from "@/server/auth/contas";
import { prisma } from "@/server/dados/prisma";
import { NOME_COOKIE_SESSAO } from "@/server/auth/token";
import { POST as login } from "@/app/api/auth/login/route";

const DOMINIO_TESTE = "@vitest.studytrack.test";

export const PREFIXO_DISCIPLINA_TESTE = "vitest-";

// SPEC-015: todo coordenador de teste coordena um curso próprio (a menos que se peça semCurso), e todo estudante
// de teste é de um curso (RB-19): o informado ou um curso padrão de teste, compartilhado no arquivo de testes.
export async function criarUsuarioDeTeste(perfil: Perfil, opcoes: { cursoId?: string; semCurso?: boolean } = {}) {
  const senha = `senha-${randomUUID()}`;
  const cursoDoEstudante = perfil === "Estudante" ? (opcoes.cursoId ?? (await cursoPadraoDeTeste())) : null;
  const usuario = await salvarConta({
    nome: `Teste ${perfil}`,
    email: `${perfil.toLowerCase()}-${randomUUID()}${DOMINIO_TESTE}`,
    senha,
    perfil,
    cursoId: cursoDoEstudante,
  });
  const cursoId = perfil === "Coordenador" && !opcoes.semCurso ? await criarCursoDeTeste(usuario.id) : cursoDoEstudante;
  return { ...usuario, senha, cursoId: cursoId ?? "" };
}

export async function criarCursoDeTeste(coordenadorId: string) {
  const curso = await prisma.curso.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}curso-${randomUUID()}`, coordenadorId } });
  return curso.id;
}

let cursoPadrao: Promise<string> | null = null;
export function cursoPadraoDeTeste() {
  cursoPadrao ??= (async () => {
    const coordenador = await salvarConta({ nome: "Teste Coordenador padrão", email: emailDeTeste("coordenador-padrao"), senha: `senha-${randomUUID()}`, perfil: "Coordenador" });
    return criarCursoDeTeste(coordenador.id);
  })();
  return cursoPadrao;
}

// Remove turmas (e matrículas, em cascata) ligadas a usuários ou cursos de teste, os estudantes de teste, os cursos
// e disciplinas de teste e os demais usuários de teste, nessa ordem (as chaves do curso são Restrict).
export async function removerUsuariosDeTeste() {
  const deTeste = { email: { endsWith: DOMINIO_TESTE } };
  const cursoDeTeste = { OR: [{ nome: { startsWith: PREFIXO_DISCIPLINA_TESTE } }, { coordenador: deTeste }] };
  await prisma.turma.deleteMany({ where: { OR: [{ professor: deTeste }, { curso: cursoDeTeste }] } });
  await prisma.usuario.deleteMany({ where: { ...deTeste, perfil: "Estudante" } });
  await prisma.curso.deleteMany({ where: cursoDeTeste });
  await prisma.disciplina.deleteMany({ where: { nome: { startsWith: PREFIXO_DISCIPLINA_TESTE } } });
  await prisma.usuario.deleteMany({ where: deTeste });
  cursoPadrao = null;
}

export function emailDeTeste(prefixo: string) {
  return `${prefixo}-${randomUUID()}${DOMINIO_TESTE}`;
}

// POST por padrão; a SPEC-004 usa PATCH para alterar nota.
export function requisicaoJson(url: string, corpo: unknown, token?: string, metodo: "POST" | "PATCH" = "POST") {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.cookie = `${NOME_COOKIE_SESSAO}=${token}`;
  return new Request(url, { method: metodo, headers, body: JSON.stringify(corpo) });
}

export function parametros(id: string) {
  return { params: Promise.resolve({ id }) };
}

export function requisicaoDeLogin(email: string, senha: string) {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
}

// Faz login pela rota real e devolve o valor do cookie de sessão emitido.
export async function entrarComo(email: string, senha: string): Promise<string> {
  const resposta = await login(requisicaoDeLogin(email, senha));
  const cookie = resposta.headers.get("set-cookie") ?? "";
  const token = cookie.match(new RegExp(`${NOME_COOKIE_SESSAO}=([^;]+)`))?.[1];
  if (!token) throw new Error(`Login falhou (status ${resposta.status}).`);
  return token;
}

export function requisicaoComSessao(url: string, token?: string) {
  const headers = token ? { cookie: `${NOME_COOKIE_SESSAO}=${token}` } : undefined;
  return new Request(url, { headers });
}
