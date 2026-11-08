// SPEC-027 — redefinição de senha por pedido: regras puras (unitário) e pedido, aprovação e recusa (integração).
import { afterAll, describe, expect, it } from "vitest";
import { MENSAGEM_PEDIDO_SENHA, deveGravarPedido, lerEmailDoPedido, motivoParaNaoResolver } from "@/domain/pedido-senha";
import { POST as esqueciApi } from "@/app/api/auth/esqueci/route";
import { POST as aprovarApi } from "@/app/api/pedidos-senha/[id]/aprovar/route";
import { POST as recusarApi } from "@/app/api/pedidos-senha/[id]/recusar/route";
import { GET as listarApi } from "@/app/api/pedidos-senha/route";
import { POST as loginApi } from "@/app/api/auth/login/route";
import { prisma } from "@/server/dados/prisma";
import { criarUsuarioDeTeste, entrarComo, parametros, removerUsuariosDeTeste, requisicaoComSessao, requisicaoDeLogin, requisicaoJson } from "../apoio";

const API = "http://localhost/api";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const pedir = (email: string) => esqueciApi(requisicaoJson(`${API}/auth/esqueci`, { email }));
const pendentesDe = (usuarioId: string) => prisma.pedidoSenha.count({ where: { usuarioId, status: "Pendente" } });
const resolver = (acao: typeof aprovarApi, id: string, token: string) => acao(requisicaoJson(`${API}/pedidos-senha/${id}`, {}, token), parametros(id));

async function administrador() {
  const admin = await criarUsuarioDeTeste("Administrador");
  return { admin, token: await entrarComo(admin.email, admin.senha) };
}

describe("SPEC-027 — regras puras (sem banco)", () => {
  it("RB-27: só grava para conta ativa sem pedido pendente; e-mail normalizado", () => {
    expect(deveGravarPedido({ ativo: true, temPedidoPendente: false })).toBe(true);
    expect([deveGravarPedido(null), deveGravarPedido({ ativo: false, temPedidoPendente: false }), deveGravarPedido({ ativo: true, temPedidoPendente: true })]).toEqual([false, false, false]);
    expect(lerEmailDoPedido("  Ana@Escola.EDU ")).toBe("ana@escola.edu");
    expect([lerEmailDoPedido("ana"), lerEmailDoPedido(""), lerEmailDoPedido(3)]).toEqual([null, null, null]);
  });

  it("INV-027-05: pedido resolvido não muda; administrador não aprova o próprio", () => {
    expect(motivoParaNaoResolver({ status: "Aprovado", usuarioId: "u" }, "a", "recusar")).toMatch(/já foi resolvido/);
    expect(motivoParaNaoResolver({ status: "Pendente", usuarioId: "a" }, "a", "aprovar")).toMatch(/própria conta/);
    expect(motivoParaNaoResolver({ status: "Pendente", usuarioId: "a" }, "a", "recusar")).toBeNull();
  });
});

describe("SPEC-027 — pedido e resolução (integração)", () => {
  it("AC-027-01 / AC-027-02 / AC-027-03 / INV-027-01: mesma resposta para qualquer e-mail; um pedido pendente por conta", async () => {
    const estudante = await criarUsuarioDeTeste("Estudante");
    const respostas = [await pedir(estudante.email.toUpperCase()), await pedir("ninguem-cadastrado@exemplo.test"), await pedir(estudante.email)];
    for (const r of respostas) {
      expect(r.status).toBe(202);
      expect(await r.json()).toEqual({ mensagem: MENSAGEM_PEDIDO_SENHA });
    }
    expect(await pendentesDe(estudante.id)).toBe(1);

    const desativada = await criarUsuarioDeTeste("Professor");
    await prisma.usuario.update({ where: { id: desativada.id }, data: { ativo: false } });
    expect((await pedir(desativada.email)).status).toBe(202);
    expect(await pendentesDe(desativada.id)).toBe(0);
    expect((await pedir("sem-arroba")).status).toBe(400);
  });

  it("AC-027-04 / AC-027-09 / INV-027-03 / INV-027-04: aprovar troca a senha, obriga a definir outra e não guarda a senha", async () => {
    const { admin, token } = await administrador();
    const estudante = await criarUsuarioDeTeste("Estudante");
    await pedir(estudante.email);
    const pedido = await prisma.pedidoSenha.findFirstOrThrow({ where: { usuarioId: estudante.id } });

    const lista = await (await listarApi(requisicaoComSessao(`${API}/pedidos-senha`, token))).json();
    expect(lista.pendentes.some((p: { id: string }) => p.id === pedido.id)).toBe(true);

    const r = await resolver(aprovarApi, pedido.id, token);
    expect(r.status).toBe(200);
    const { senhaProvisoria } = await r.json();
    expect(senhaProvisoria).toMatch(/^[\w]{4}-[\w]{4}-[\w]{4}$/);

    expect((await loginApi(requisicaoDeLogin(estudante.email, estudante.senha))).status).toBe(401);
    const login = await loginApi(requisicaoDeLogin(estudante.email, senhaProvisoria));
    expect(login.status).toBe(200);
    expect((await login.json()).destino).toBe("/definir-senha");

    const registro = await prisma.registroAuditoria.findFirstOrThrow({ where: { autorId: admin.id, acao: "senha.aprovada" } });
    expect(JSON.stringify(registro)).not.toContain(senhaProvisoria);
    expect(JSON.stringify(await prisma.pedidoSenha.findUniqueOrThrow({ where: { id: pedido.id } }))).not.toContain(senhaProvisoria);

    // AC-027-06: pedido já resolvido.
    expect((await resolver(aprovarApi, pedido.id, token)).status).toBe(409);
  });

  it("AC-027-05: recusar mantém a senha antiga", async () => {
    const { token } = await administrador();
    const professor = await criarUsuarioDeTeste("Professor");
    await pedir(professor.email);
    const pedido = await prisma.pedidoSenha.findFirstOrThrow({ where: { usuarioId: professor.id } });
    expect((await resolver(recusarApi, pedido.id, token)).status).toBe(200);
    expect((await prisma.pedidoSenha.findUniqueOrThrow({ where: { id: pedido.id } })).status).toBe("Recusado");
    expect((await loginApi(requisicaoDeLogin(professor.email, professor.senha))).status).toBe(200);
  });

  it("AC-027-07: administrador não aprova o próprio pedido", async () => {
    const { admin, token } = await administrador();
    await pedir(admin.email);
    const pedido = await prisma.pedidoSenha.findFirstOrThrow({ where: { usuarioId: admin.id } });
    expect((await resolver(aprovarApi, pedido.id, token)).status).toBe(409);
  });

  it("AC-027-08: coordenador não abre os pedidos", async () => {
    const coordenador = await criarUsuarioDeTeste("Coordenador");
    const token = await entrarComo(coordenador.email, coordenador.senha);
    expect((await listarApi(requisicaoComSessao(`${API}/pedidos-senha`, token))).status).toBe(403);
  });
});
