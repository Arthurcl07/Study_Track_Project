// SPEC-045 — termos, privacidade e dados do titular (LGPD): versão e pacote (unitário); guarda, aceite e download
// (integração).
import { afterAll, describe, expect, it } from "vitest";
import { nomeDoArquivoDeDados, pacoteDeDados, precisaAceitar, VERSAO_TERMOS } from "@/domain/lgpd";
import { GET as meusDadosApi } from "@/app/api/meus-dados/route";
import { POST as aceiteApi } from "@/app/api/termos/aceite/route";
import { GET as turmasApi } from "@/app/api/turmas/route";
import { POST as loginApi } from "@/app/api/auth/login/route";
import { prisma } from "@/server/dados/prisma";
import { criarUsuarioDeTeste, entrarComo, removerUsuariosDeTeste, requisicaoComSessao, requisicaoDeLogin, requisicaoJson } from "../apoio";
import { turmaComEstudantes } from "../apoio-secretaria";

const API = "http://localhost/api";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

describe("SPEC-045 — regras puras (sem banco)", () => {
  it("RB-43 / AC-045-03: sem o aceite da versão vigente, precisa aceitar; versão nova pede de novo", () => {
    expect(precisaAceitar([])).toBe(true);
    expect(precisaAceitar([VERSAO_TERMOS])).toBe(false);
    expect(precisaAceitar([VERSAO_TERMOS], "2.0")).toBe(true);
  });

  it("INV-045-03: o pacote de dados nunca leva senha, hash ou token, em nenhum nível", () => {
    const pacote = pacoteDeDados({ conta: { nome: "Ana", senhaHash: "x", token: "y" }, notas: [{ valor: 7, senha: "z" }] }, new Date("2026-11-14T12:00:00Z"));
    expect(JSON.stringify(pacote)).not.toMatch(/senha|token/);
    expect(pacote).toMatchObject({ sistema: "StudyTrack", versaoDosTermos: VERSAO_TERMOS, conta: { nome: "Ana" }, notas: [{ valor: 7 }] });
    expect(nomeDoArquivoDeDados("João Pereira", new Date("2026-11-14T12:00:00Z"))).toBe("meus-dados-joao-pereira-2026-11-14.json");
  });
});

describe("SPEC-045 — aceite e dados do titular (integração)", () => {
  it("AC-045-01 / INV-045-01: sem aceite, o login leva ao aceite e as APIs respondem 403", async () => {
    const u = await criarUsuarioDeTeste("Estudante", { semAceite: true });
    const login = await loginApi(requisicaoDeLogin(u.email, u.senha));
    expect((await login.json()).destino).toBe("/termos/aceite");
    const token = await entrarComo(u.email, u.senha);
    const resposta = await turmasApi(requisicaoComSessao(`${API}/turmas`, token));
    expect(resposta.status).toBe(403);
    expect((await resposta.json()).aceitarTermos).toBe(true);
  });

  it("AC-045-02: aceitar a versão vigente grava o aceite, libera o sistema e audita; versão errada é recusada", async () => {
    const u = await criarUsuarioDeTeste("Estudante", { semAceite: true });
    const token = await entrarComo(u.email, u.senha);
    expect((await aceiteApi(requisicaoJson(`${API}/termos/aceite`, { versao: "0.9" }, token))).status).toBe(400);
    const r = await aceiteApi(requisicaoJson(`${API}/termos/aceite`, { versao: VERSAO_TERMOS }, token));
    expect(r.status).toBe(200);
    expect((await r.json()).destino).toBe("/estudante");
    expect(await prisma.aceiteTermos.count({ where: { usuarioId: u.id, versao: VERSAO_TERMOS } })).toBe(1);
    expect(await prisma.registroAuditoria.count({ where: { autorId: u.id, acao: "termos.aceitos" } })).toBe(1);
    expect((await turmasApi(requisicaoComSessao(`${API}/turmas`, token))).status).toBe(200);
    // Aceitar de novo não duplica.
    await aceiteApi(requisicaoJson(`${API}/termos/aceite`, { versao: VERSAO_TERMOS }, token));
    expect(await prisma.aceiteTermos.count({ where: { usuarioId: u.id } })).toBe(1);
  });

  it("AC-045-04 / AC-045-05 / INV-045-02: o estudante baixa só os próprios dados, sem senha; o download fica na auditoria", async () => {
    const { turma, estudantes } = await turmaComEstudantes(2);
    const [eu, outro] = estudantes;
    const prova = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "P1", peso: 1, data: new Date(), tipo: "Prova" } });
    await prisma.nota.createMany({ data: [{ avaliacaoId: prova.id, estudanteId: eu.id, valor: 7.5 }, { avaliacaoId: prova.id, estudanteId: outro.id, valor: 3.25 }] });
    const token = await entrarComo(eu.email, eu.senha);
    const resposta = await meusDadosApi(requisicaoComSessao(`${API}/meus-dados`, token));
    expect(resposta.status).toBe(200);
    expect(resposta.headers.get("content-disposition")).toMatch(/attachment; filename="meus-dados-/);
    const texto = await resposta.text();
    const pacote = JSON.parse(texto);
    expect(pacote.conta.email).toBe(eu.email);
    expect(pacote.ficha.numeroMatricula).toMatch(/^\d{8}$/);
    expect(pacote.notas.map((n: { valor: number }) => n.valor)).toEqual([7.5]);
    expect(texto).not.toContain(outro.email);
    expect(texto).not.toContain("3.25");
    expect(texto).not.toMatch(/senhaHash|\$2[aby]\$/);
    expect(await prisma.registroAuditoria.count({ where: { autorId: eu.id, acao: "dados.baixados" } })).toBe(1);
  });
});
