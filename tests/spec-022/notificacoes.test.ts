// SPEC-022 — notificações: regras de domínio (unitário) e eventos, deduplicação e leitura com rotas + banco.
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { hojeEmBrasilia } from "@/domain/atividades";
import { chavePrazo, entrouEmRisco, notificacaoNota, notificacaoPrazo, prazoPedeAviso } from "@/domain/notificacoes";
import { POST as marcarLidaApi } from "@/app/api/notificacoes/[id]/lida/route";
import { POST as marcarTodasApi } from "@/app/api/notificacoes/lidas/route";
import { GET as notificacoesApi } from "@/app/api/notificacoes/route";
import { PATCH as alterarNotaApi } from "@/app/api/notas/[id]/route";
import { POST as registrarNotaApi } from "@/app/api/notas/route";
import { POST as criarPlanoApi } from "@/app/api/planos/route";
import { prisma } from "@/server/dados/prisma";
import {
  PREFIXO_DISCIPLINA_TESTE,
  criarUsuarioDeTeste,
  cursoPadraoDeTeste,
  entrarComo,
  parametros,
  removerUsuariosDeTeste,
  requisicaoComSessao,
  requisicaoJson,
} from "../apoio";

const API = "http://localhost/api";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

function dias(base: string, quantos: number) {
  const data = new Date(`${base}T00:00:00Z`);
  data.setUTCDate(data.getUTCDate() + quantos);
  return data.toISOString().slice(0, 10);
}

async function cenario() {
  const professor = await criarUsuarioDeTeste("Professor");
  const estudante = await criarUsuarioDeTeste("Estudante");
  const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}Calculo-${randomUUID().slice(0, 4)}`, cargaHoraria: 60 } });
  const turma = await prisma.turma.create({ data: { nome: "T", periodo: "2026/2", disciplinaId: disciplina.id, professorId: professor.id, cursoId: await cursoPadraoDeTeste() } });
  await prisma.matricula.create({ data: { estudanteId: estudante.id, turmaId: turma.id } });
  const avaliacao = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "Prova 1", peso: 1, data: new Date() } });
  return {
    professor,
    estudante,
    disciplina,
    turma,
    avaliacao,
    tokenProfessor: await entrarComo(professor.email, professor.senha),
    tokenEstudante: await entrarComo(estudante.email, estudante.senha),
  };
}

const lancar = (c: Awaited<ReturnType<typeof cenario>>, valor: number) =>
  registrarNotaApi(requisicaoJson(`${API}/notas`, { turmaId: c.turma.id, avaliacaoId: c.avaliacao.id, estudanteId: c.estudante.id, valor }, c.tokenProfessor));
const doUsuario = (usuarioId: string, tipo?: "Risco" | "Nota" | "Plano" | "Prazo") => prisma.notificacao.findMany({ where: { usuarioId, ...(tipo ? { tipo } : {}) }, orderBy: { criadaEm: "asc" } });

describe("SPEC-022 — regras de domínio (sem banco)", () => {
  it("INV-022-02: entrou em Risco só quando antes não era Risco", () => {
    expect(entrouEmRisco(undefined, "Risco")).toBe(true);
    expect(entrouEmRisco("Normal", "Risco")).toBe(true);
    expect(entrouEmRisco("Atencao", "Risco")).toBe(true);
    expect(entrouEmRisco("Risco", "Risco")).toBe(false);
    expect(entrouEmRisco("Normal", "Atencao")).toBe(false);
  });

  it("RF-31: aviso de prazo de hoje até 2 dias, sem entrega", () => {
    const hoje = "2026-11-05";
    expect(prazoPedeAviso("2026-11-05", hoje, false)).toBe(true);
    expect(prazoPedeAviso("2026-11-07", hoje, false)).toBe(true);
    expect(prazoPedeAviso("2026-11-08", hoje, false)).toBe(false);
    expect(prazoPedeAviso("2026-11-04", hoje, false)).toBe(false);
    expect(prazoPedeAviso("2026-11-06", hoje, true)).toBe(false);
    expect(notificacaoPrazo("a", "e", "Lista", "Cálculo", "2026-11-06", hoje)).toMatchObject({ titulo: "Prazo amanhã: Lista", chave: chavePrazo("a", "e") });
  });

  it("textos com valores no formato brasileiro", () => {
    expect(notificacaoNota("Prova 1", "Cálculo", 6.5, 5, 6.2)).toMatchObject({ titulo: "Nota alterada em Prova 1 — Cálculo", texto: "Sua nota: 6,5 (antes 5,0). Média atual: 6,2." });
  });
});

describe("SPEC-022 — eventos (integração)", () => {
  it("AC-022-01 / AC-022-03: nota que leva a Risco notifica o estudante (nota e Risco) e o professor (Risco)", async () => {
    const c = await cenario();
    expect((await lancar(c, 3)).status).toBe(201);
    const doEstudante = await doUsuario(c.estudante.id);
    expect(doEstudante.map((n) => n.tipo).sort()).toEqual(["Nota", "Risco"]);
    expect(doEstudante.find((n) => n.tipo === "Risco")?.titulo).toContain(c.disciplina.nome);
    const doProfessor = await doUsuario(c.professor.id, "Risco");
    expect(doProfessor).toHaveLength(1);
    expect(doProfessor[0].link).toBe(`/professor/turmas/${c.turma.id}`);
  });

  it("AC-022-02 / INV-022-02: estudante já em Risco que recebe nova nota não ganha outro aviso de Risco", async () => {
    const c = await cenario();
    const nota = await (await lancar(c, 3)).json();
    await alterarNotaApi(requisicaoJson(`${API}/notas/${nota.nota.id}`, { valor: 2 }, c.tokenProfessor, "PATCH"), parametros(nota.nota.id));
    expect(await doUsuario(c.estudante.id, "Risco")).toHaveLength(1);
    expect(await doUsuario(c.estudante.id, "Nota")).toHaveLength(2);
  });

  it("AC-022-04: plano criado notifica o estudante", async () => {
    const c = await cenario();
    await lancar(c, 3);
    const r = await criarPlanoApi(requisicaoJson(`${API}/planos`, { turmaId: c.turma.id, estudanteId: c.estudante.id, itens: ["Lista extra", "Monitoria"] }, c.tokenProfessor));
    expect(r.status).toBe(201);
    const [plano] = await doUsuario(c.estudante.id, "Plano");
    expect(plano.texto).toContain("2 item(ns)");
  });

  it("INV-022-04: nota recusada não gera notificação", async () => {
    const c = await cenario();
    expect((await lancar(c, 11)).status).toBe(400);
    expect(await doUsuario(c.estudante.id)).toHaveLength(0);
  });

  it("AC-022-05 / INV-022-03: prazo amanhã sem entrega gera uma única notificação, mesmo entrando duas vezes", async () => {
    const c = await cenario();
    await prisma.atividade.create({ data: { turmaId: c.turma.id, descricao: "Lista 3", prazo: new Date(`${dias(hojeEmBrasilia(), 1)}T00:00:00Z`) } });
    await prisma.atividade.create({ data: { turmaId: c.turma.id, descricao: "Longe", prazo: new Date(`${dias(hojeEmBrasilia(), 6)}T00:00:00Z`) } });
    await notificacoesApi(requisicaoComSessao(`${API}/notificacoes`, c.tokenEstudante));
    const segunda = await (await notificacoesApi(requisicaoComSessao(`${API}/notificacoes`, c.tokenEstudante))).json();
    const prazos = segunda.notificacoes.filter((n: { tipo: string }) => n.tipo === "Prazo");
    expect(prazos).toHaveLength(1);
    expect(prazos[0].titulo).toBe("Prazo amanhã: Lista 3");
  });
});

describe("SPEC-022 — leitura e escopo (integração)", () => {
  it("AC-022-06 / INV-022-01: um estudante não vê nem marca notificação de outro", async () => {
    const c = await cenario();
    await lancar(c, 8);
    const [nota] = await doUsuario(c.estudante.id, "Nota");
    const outro = await criarUsuarioDeTeste("Estudante");
    const tokenOutro = await entrarComo(outro.email, outro.senha);
    const lista = await (await notificacoesApi(requisicaoComSessao(`${API}/notificacoes`, tokenOutro))).json();
    expect(lista.notificacoes.some((n: { id: string }) => n.id === nota.id)).toBe(false);
    expect((await marcarLidaApi(requisicaoJson(`${API}/notificacoes/${nota.id}/lida`, {}, tokenOutro), parametros(nota.id))).status).toBe(404);
    expect((await prisma.notificacao.findUnique({ where: { id: nota.id } }))?.lidaEm).toBeNull();
  });

  it("AC-022-07: marcar uma e depois todas como lidas zera o contador", async () => {
    const c = await cenario();
    await lancar(c, 3);
    const antes = await (await notificacoesApi(requisicaoComSessao(`${API}/notificacoes`, c.tokenEstudante))).json();
    expect(antes.naoLidas).toBe(2);
    const primeira = antes.notificacoes[0];
    const lida = await marcarLidaApi(requisicaoJson(`${API}/notificacoes/${primeira.id}/lida`, {}, c.tokenEstudante), parametros(primeira.id));
    expect((await lida.json()).link).toBe(primeira.link);
    expect((await (await notificacoesApi(requisicaoComSessao(`${API}/notificacoes`, c.tokenEstudante))).json()).naoLidas).toBe(1);
    await marcarTodasApi(requisicaoJson(`${API}/notificacoes/lidas`, {}, c.tokenEstudante));
    expect((await (await notificacoesApi(requisicaoComSessao(`${API}/notificacoes`, c.tokenEstudante))).json()).naoLidas).toBe(0);
  });

  it("AC-022-08 / INV-022-05: coordenador e administrador não têm notificações", async () => {
    for (const perfil of ["Coordenador", "Administrador"] as const) {
      const u = await criarUsuarioDeTeste(perfil);
      const token = await entrarComo(u.email, u.senha);
      expect((await notificacoesApi(requisicaoComSessao(`${API}/notificacoes`, token))).status).toBe(403);
    }
  });
});
