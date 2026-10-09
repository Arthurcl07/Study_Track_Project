// SPEC-001 — testes de integração da autenticação (rota real + banco PostgreSQL local).
import { afterAll, describe, expect, it } from "vitest";
import { PERFIS } from "@/domain/perfil";
import { painelDoPerfil } from "@/domain/autorizacao";
import { POST as login } from "@/app/api/auth/login/route";
import { prisma } from "@/server/dados/prisma";
import { verificarSessao, NOME_COOKIE_SESSAO } from "@/server/auth/token";
import { criarUsuarioDeTeste, removerUsuariosDeTeste, requisicaoDeLogin } from "../apoio";

const FORMATO_BCRYPT = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

describe("SPEC-001 — autenticação", () => {
  it("AC-001-01: Estudante com credenciais corretas recebe sessão e é redirecionado ao painel do Estudante", async () => {
    const estudante = await criarUsuarioDeTeste("Estudante");

    const resposta = await login(requisicaoDeLogin(estudante.email, estudante.senha));

    expect(resposta.status).toBe(200);
    expect(await resposta.json()).toEqual({ perfil: "Estudante", destino: "/estudante" });
    const cookie = resposta.headers.get("set-cookie") ?? "";
    expect(cookie).toContain(`${NOME_COOKIE_SESSAO}=`);
    expect(cookie.toLowerCase()).toContain("httponly");
    const token = cookie.match(new RegExp(`${NOME_COOKIE_SESSAO}=([^;]+)`))?.[1];
    expect(await verificarSessao(token)).toEqual({
      usuarioId: estudante.id,
      nome: estudante.nome,
      perfil: "Estudante",
    });
  });

  it.each(PERFIS)("Caso de teste 12.1: login bem-sucedido do perfil %s leva ao painel do perfil", async (perfil) => {
    const usuario = await criarUsuarioDeTeste(perfil);

    const resposta = await login(requisicaoDeLogin(usuario.email, usuario.senha));

    expect(resposta.status).toBe(200);
    expect((await resposta.json()).destino).toBe(painelDoPerfil(perfil));
  });

  it("AC-001-02: senha incorreta é recusada, sem sessão e com mensagem genérica", async () => {
    const usuario = await criarUsuarioDeTeste("Estudante");

    const senhaErrada = await login(requisicaoDeLogin(usuario.email, "senha-errada"));
    const emailInexistente = await login(requisicaoDeLogin("ninguem@vitest.studytrack.test", "qualquer"));

    expect(senhaErrada.status).toBe(401);
    expect(senhaErrada.headers.get("set-cookie")).toBeNull();
    const erroSenha = await senhaErrada.json();
    const erroEmail = await emailInexistente.json();
    // Mesma resposta nos dois casos: não revela se o e-mail existe.
    expect(emailInexistente.status).toBe(401);
    expect(emailInexistente.headers.get("set-cookie")).toBeNull();
    expect(erroSenha).toEqual(erroEmail);
    expect(erroSenha.erro).not.toMatch(/senha incorreta|não encontrado|nao encontrado/i);
  });

  it("AC-001-04: o valor armazenado no banco é um hash, nunca a senha original", async () => {
    const usuario = await criarUsuarioDeTeste("Professor");

    const registro = await prisma.usuario.findUniqueOrThrow({ where: { id: usuario.id } });

    expect(registro.senhaHash).not.toBe(usuario.senha);
    expect(registro.senhaHash).not.toContain(usuario.senha);
    expect(registro.senhaHash).toMatch(FORMATO_BCRYPT);
  });

  it("INV-001-02: nenhum usuário do banco tem senha em texto puro e a resposta de login não expõe o hash", async () => {
    const usuario = await criarUsuarioDeTeste("Coordenador");

    const todos = await prisma.usuario.findMany({ select: { senhaHash: true } });
    expect(todos.length).toBeGreaterThan(0);
    for (const { senhaHash } of todos) expect(senhaHash).toMatch(FORMATO_BCRYPT);

    const resposta = await login(requisicaoDeLogin(usuario.email, usuario.senha));
    const corpo = JSON.stringify(await resposta.json());
    expect(corpo).not.toContain("senha");
    expect(corpo).not.toContain(usuario.senhaHash);
  });
});
