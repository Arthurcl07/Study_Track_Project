// Apoio aos testes: cada teste cria os próprios usuários e os remove ao final (estrategia-testes.md, seção 7).
import { randomUUID } from "node:crypto";
import type { Perfil } from "@/domain/perfil";
import { salvarConta } from "@/server/auth/contas";
import { prisma } from "@/server/dados/prisma";
import { NOME_COOKIE_SESSAO } from "@/server/auth/token";
import { POST as login } from "@/app/api/auth/login/route";

const DOMINIO_TESTE = "@vitest.studytrack.test";

export async function criarUsuarioDeTeste(perfil: Perfil) {
  const senha = `senha-${randomUUID()}`;
  const usuario = await salvarConta({
    nome: `Teste ${perfil}`,
    email: `${perfil.toLowerCase()}-${randomUUID()}${DOMINIO_TESTE}`,
    senha,
    perfil,
  });
  return { ...usuario, senha };
}

export const PREFIXO_DISCIPLINA_TESTE = "vitest-";

// Remove turmas (e matrículas, em cascata) ligadas a usuários de teste, disciplinas de teste e os usuários.
export async function removerUsuariosDeTeste() {
  const deTeste = { email: { endsWith: DOMINIO_TESTE } };
  await prisma.turma.deleteMany({ where: { OR: [{ professor: deTeste }, { coordenador: deTeste }] } });
  await prisma.disciplina.deleteMany({ where: { nome: { startsWith: PREFIXO_DISCIPLINA_TESTE } } });
  await prisma.usuario.deleteMany({ where: deTeste });
}

export function emailDeTeste(prefixo: string) {
  return `${prefixo}-${randomUUID()}${DOMINIO_TESTE}`;
}

export function requisicaoJson(url: string, corpo: unknown, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.cookie = `${NOME_COOKIE_SESSAO}=${token}`;
  return new Request(url, { method: "POST", headers, body: JSON.stringify(corpo) });
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
