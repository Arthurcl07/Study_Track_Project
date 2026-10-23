// SPEC-011 — senha própria: regra de domínio (unitário) e troca no primeiro acesso pela API (integração).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { MENSAGEM_DEFINIR_SENHA, MENSAGEM_SENHA_ATUAL_INCORRETA, validarTrocaDeSenha } from "@/domain/senha";
import { POST as loginApi } from "@/app/api/auth/login/route";
import { POST as senhaApi } from "@/app/api/auth/senha/route";
import { POST as criarContaApi } from "@/app/api/contas/route";
import { GET as turmasApi } from "@/app/api/turmas/route";
import { POST as cadastrarEstudanteApi } from "@/app/api/turmas/[id]/estudantes/route";
import { prisma } from "@/server/dados/prisma";
import {
  cursoPadraoDeTeste,
  PREFIXO_DISCIPLINA_TESTE, criarUsuarioDeTeste, emailDeTeste, entrarComo, parametros, removerUsuariosDeTeste,
  requisicaoComSessao, requisicaoDeLogin, requisicaoJson,
} from "../apoio";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const URL_TURMAS = "http://localhost/api/turmas";
const URL_SENHA = "http://localhost/api/auth/senha";
const SENHA_INICIAL = "provisoria-123";

async function destinoDoLogin(email: string, senha: string) {
  const resposta = await loginApi(requisicaoDeLogin(email, senha));
  return { status: resposta.status, destino: (await resposta.json()).destino };
}

async function trocar(token: string, corpo: Record<string, unknown>) {
  const resposta = await senhaApi(requisicaoJson(URL_SENHA, corpo, token));
  return { status: resposta.status, corpo: await resposta.json() };
}

// Conta de Estudante criada pelo administrador pela tela (SPEC-010): nasce com senha provisória.
async function contaCriadaPeloAdmin() {
  const admin = await criarUsuarioDeTeste("Administrador");
  const tokenAdmin = await entrarComo(admin.email, admin.senha);
  const email = emailDeTeste("nova");
  await criarContaApi(requisicaoJson("http://localhost/api/contas", { nome: "Nova Pessoa", email, senha: SENHA_INICIAL, perfil: "Estudante", cursoId: await cursoPadraoDeTeste() }, tokenAdmin));
  return { email, token: await entrarComo(email, SENHA_INICIAL) };
}

describe("SPEC-011 — regra de domínio", () => {
  it("RB-15 / INV-011-03: nova senha com 8+ caracteres, diferente da atual e igual à confirmação", () => {
    expect(validarTrocaDeSenha({ senhaAtual: "antiga-123", novaSenha: "nova-senha-1", confirmacao: "nova-senha-1" }))
      .toEqual({ ok: true, dados: { senhaAtual: "antiga-123", novaSenha: "nova-senha-1" } });
    const casos = [
      [{ senhaAtual: "", novaSenha: "nova-senha-1", confirmacao: "nova-senha-1" }, "senhaAtual"],
      [{ senhaAtual: "antiga-123", novaSenha: "curta", confirmacao: "curta" }, "novaSenha"],
      [{ senhaAtual: "antiga-123", novaSenha: "antiga-123", confirmacao: "antiga-123" }, "novaSenha"],
      [{ senhaAtual: "antiga-123", novaSenha: "nova-senha-1", confirmacao: "outra-coisa" }, "confirmacao"],
    ] as const;
    for (const [entrada, campo] of casos) {
      const r = validarTrocaDeSenha(entrada);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.erros[campo]).toBeDefined();
    }
  });
});

describe("SPEC-011 — senha provisória e troca", () => {
  it("AC-011-01 / INV-011-01 / INV-011-02: conta criada pelo administrador vai para 'Defina sua senha' e as APIs ficam bloqueadas", async () => {
    const { email, token } = await contaCriadaPeloAdmin();

    expect((await prisma.usuario.findUniqueOrThrow({ where: { email } })).trocarSenha).toBe(true);
    expect((await destinoDoLogin(email, SENHA_INICIAL)).destino).toBe("/definir-senha");
    const bloqueada = await turmasApi(requisicaoComSessao(URL_TURMAS, token));
    expect(bloqueada.status).toBe(403);
    expect(await bloqueada.json()).toMatchObject({ erro: MENSAGEM_DEFINIR_SENHA, trocarSenha: true });
  });

  it("INV-011-01: estudante cadastrado pelo coordenador também nasce com senha provisória", async () => {
    const coordenador = await criarUsuarioDeTeste("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60 } });
    const turma = await prisma.turma.create({ data: { nome: "T", periodo: "2026/2", disciplinaId: disciplina.id, professorId: professor.id, cursoId: coordenador.cursoId } });
    const token = await entrarComo(coordenador.email, coordenador.senha);
    const email = emailDeTeste("matriculado");

    const resposta = await cadastrarEstudanteApi(requisicaoJson(`${URL_TURMAS}/${turma.id}/estudantes`, { nome: "Aluno", email, senha: SENHA_INICIAL }, token), parametros(turma.id));

    expect(resposta.status).toBe(201);
    expect((await prisma.usuario.findUniqueOrThrow({ where: { email } })).trocarSenha).toBe(true);
  });

  it("AC-011-02 / INV-011-04: definir senha nova libera o sistema; a provisória deixa de funcionar", async () => {
    const { email, token } = await contaCriadaPeloAdmin();
    const hashAntes = (await prisma.usuario.findUniqueOrThrow({ where: { email } })).senhaHash;

    const { status, corpo } = await trocar(token, { senhaAtual: SENHA_INICIAL, novaSenha: "minha-senha-1", confirmacao: "minha-senha-1" });

    expect(status).toBe(200);
    expect(corpo.destino).toBe("/estudante");
    const depois = await prisma.usuario.findUniqueOrThrow({ where: { email } });
    expect(depois.trocarSenha).toBe(false);
    expect(depois.senhaHash).not.toBe(hashAntes);
    expect(depois.senhaHash).not.toBe("minha-senha-1");
    expect((await turmasApi(requisicaoComSessao(URL_TURMAS, token))).status).toBe(200);
    expect((await destinoDoLogin(email, SENHA_INICIAL)).status).toBe(401);
    expect(await destinoDoLogin(email, "minha-senha-1")).toEqual({ status: 200, destino: "/estudante" });
  });

  it("AC-011-03: senha atual errada impede a troca e indica o campo", async () => {
    const usuario = await criarUsuarioDeTeste("Professor");
    const token = await entrarComo(usuario.email, usuario.senha);

    const { status, corpo } = await trocar(token, { senhaAtual: "errada-123", novaSenha: "minha-senha-1", confirmacao: "minha-senha-1" });

    expect(status).toBe(400);
    expect(corpo.campos.senhaAtual).toBe(MENSAGEM_SENHA_ATUAL_INCORRETA);
  });

  it("AC-011-04: senha nova curta, igual à atual ou com confirmação diferente é recusada", async () => {
    const usuario = await criarUsuarioDeTeste("Coordenador");
    const token = await entrarComo(usuario.email, usuario.senha);
    const base = { senhaAtual: usuario.senha };

    expect((await trocar(token, { ...base, novaSenha: "curta", confirmacao: "curta" })).corpo.campos.novaSenha).toBeDefined();
    expect((await trocar(token, { ...base, novaSenha: usuario.senha, confirmacao: usuario.senha })).corpo.campos.novaSenha).toMatch(/diferente/);
    expect((await trocar(token, { ...base, novaSenha: "minha-senha-1", confirmacao: "outra" })).corpo.campos.confirmacao).toBeDefined();
    expect((await trocar("token-invalido", { ...base, novaSenha: "minha-senha-1", confirmacao: "minha-senha-1" })).status).toBe(401);
  });

  it("AC-011-05: conta do seed (sem senha provisória) entra direto no painel e pode alterar a senha", async () => {
    const usuario = await criarUsuarioDeTeste("Coordenador");
    expect(await destinoDoLogin(usuario.email, usuario.senha)).toEqual({ status: 200, destino: "/coordenador" });

    const token = await entrarComo(usuario.email, usuario.senha);
    expect((await trocar(token, { senhaAtual: usuario.senha, novaSenha: "minha-senha-1", confirmacao: "minha-senha-1" })).status).toBe(200);
    expect((await destinoDoLogin(usuario.email, "minha-senha-1")).status).toBe(200);
  });
});
