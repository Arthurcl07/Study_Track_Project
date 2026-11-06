// SPEC-025 — mural de comunicados: validação (unitário) e publicação, alcance, notificações e exclusão (integração).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { validarComunicado } from "@/domain/comunicados";
import { DELETE as apagarApi } from "@/app/api/comunicados/[id]/route";
import { GET as muralApi, POST as publicarApi } from "@/app/api/comunicados/route";
import { prisma } from "@/server/dados/prisma";
import {
  PREFIXO_DISCIPLINA_TESTE,
  criarPeriodoDeTeste,
  criarUsuarioDeTeste,
  entrarComo,
  parametros,
  removerUsuariosDeTeste,
  requisicaoComSessao,
  requisicaoJson,
} from "../apoio";
import { NOME_COOKIE_SESSAO } from "@/server/auth/token";

const API = "http://localhost/api";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

async function entrar(perfil: "Estudante" | "Professor" | "Coordenador" | "Administrador", opcoes: { cursoId?: string } = {}) {
  const usuario = await criarUsuarioDeTeste(perfil, opcoes);
  return { usuario, token: await entrarComo(usuario.email, usuario.senha) };
}

// Curso do coordenador com 2 turmas abertas (professores diferentes), 3 estudantes na turma A e 1 na turma B.
async function cenario(periodo = "2026/2") {
  const coordenador = await entrar("Coordenador");
  const professorA = await entrar("Professor");
  const professorB = await entrar("Professor");
  const cursoId = coordenador.usuario.cursoId;
  const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60, cursos: { create: { cursoId } } } });
  const turmaA = await prisma.turma.create({ data: { nome: "A", periodo, disciplinaId: disciplina.id, professorId: professorA.usuario.id, cursoId } });
  const turmaB = await prisma.turma.create({ data: { nome: "B", periodo, disciplinaId: disciplina.id, professorId: professorB.usuario.id, cursoId } });
  const estudantesA = [];
  for (let i = 0; i < 3; i++) {
    const e = await entrar("Estudante", { cursoId });
    await prisma.matricula.create({ data: { estudanteId: e.usuario.id, turmaId: turmaA.id } });
    estudantesA.push(e);
  }
  const estudanteB = await entrar("Estudante", { cursoId });
  await prisma.matricula.create({ data: { estudanteId: estudanteB.usuario.id, turmaId: turmaB.id } });
  return { coordenador, professorA, professorB, turmaA, turmaB, estudantesA, estudanteB, cursoId };
}

const publicar = (token: string, corpo: Record<string, unknown>) => publicarApi(requisicaoJson(`${API}/comunicados`, { titulo: "Prova adiada", texto: "A prova passa para quinta.", ...corpo }, token));
const mural = async (token: string) => (await muralApi(requisicaoComSessao(`${API}/comunicados`, token))).json();
const apagar = (token: string, id: string) => apagarApi(new Request(`${API}/comunicados/${id}`, { method: "DELETE", headers: { cookie: `${NOME_COOKIE_SESSAO}=${token}` } }), parametros(id));
const notificacoesDe = (usuarioId: string) => prisma.notificacao.count({ where: { usuarioId, tipo: "Comunicado" } });

describe("SPEC-025 — validação (sem banco)", () => {
  it("AC-025-05: título e texto obrigatórios e com limite; alcance com a turma ou o curso", () => {
    expect(validarComunicado({ titulo: " Aviso ", texto: " Texto ", turmaId: "t" })).toEqual({ ok: true, dados: { titulo: "Aviso", texto: "Texto", alcance: { tipo: "turma", turmaId: "t" } } });
    expect(validarComunicado({ titulo: "A", texto: "B", alcance: "curso", cursoId: "c" }).ok).toBe(true);
    const falha = validarComunicado({ titulo: "", texto: "x".repeat(2001), alcance: "curso" });
    expect(falha.ok).toBe(false);
    if (!falha.ok) expect(Object.keys(falha.erros).sort()).toEqual(["cursoId", "texto", "titulo"]);
    expect(validarComunicado({ titulo: "x".repeat(121), texto: "ok", turmaId: "t" }).ok).toBe(false);
  });
});

describe("SPEC-025 — publicação e mural (integração)", () => {
  it("AC-025-01 / INV-025-04: professor publica para a turma; 3 estudantes notificados; auditoria registrada", async () => {
    const c = await cenario();
    const r = await publicar(c.professorA.token, { turmaId: c.turmaA.id });
    expect(r.status).toBe(201);
    expect((await r.json()).notificados).toBe(3);
    for (const e of c.estudantesA) expect(await notificacoesDe(e.usuario.id)).toBe(1);
    expect(await notificacoesDe(c.estudanteB.usuario.id)).toBe(0);
    expect(await prisma.registroAuditoria.count({ where: { turmaId: c.turmaA.id, acao: "comunicado.publicado" } })).toBe(1);
    const visto = await mural(c.estudantesA[0].token);
    expect(visto.map((m: { titulo: string }) => m.titulo)).toEqual(["Prova adiada"]);
  });

  it("AC-025-02: coordenador publica para o curso; estudantes e professores das turmas abertas notificados", async () => {
    const c = await cenario();
    const r = await publicar(c.coordenador.token, { alcance: "curso", cursoId: c.cursoId, titulo: "Semana de recuperação" });
    expect((await r.json()).notificados).toBe(6);
    expect(await notificacoesDe(c.estudanteB.usuario.id)).toBe(1);
    expect(await notificacoesDe(c.professorB.usuario.id)).toBe(1);
    expect((await mural(c.estudanteB.token))[0].alcance).toContain("todas as turmas");
    expect((await mural(c.professorA.token)).some((m: { titulo: string }) => m.titulo === "Semana de recuperação")).toBe(true);
  });

  it("AC-025-03 / INV-025-03: estudante de outra turma e de outro curso não vê o comunicado da turma", async () => {
    const c = await cenario();
    await publicar(c.professorA.token, { turmaId: c.turmaA.id });
    expect(await mural(c.estudanteB.token)).toEqual([]);
    const deFora = await entrar("Estudante");
    expect(await mural(deFora.token)).toEqual([]);
  });

  it("AC-025-04 / INV-025-02: professor de outra turma, coordenador de outro curso e estudante não publicam", async () => {
    const c = await cenario();
    expect((await publicar(c.professorB.token, { turmaId: c.turmaA.id })).status).toBe(403);
    expect((await publicar(c.professorA.token, { alcance: "curso", cursoId: c.cursoId })).status).toBe(403);
    const outro = await entrar("Coordenador");
    expect((await publicar(outro.token, { alcance: "curso", cursoId: c.cursoId })).status).toBe(403);
    expect((await publicar(c.estudantesA[0].token, { turmaId: c.turmaA.id })).status).toBe(403);
    expect(await prisma.comunicado.count({ where: { OR: [{ turmaId: c.turmaA.id }, { cursoId: c.cursoId }] } })).toBe(0);
  });

  it("AC-025-05: campos inválidos recusados com o campo", async () => {
    const c = await cenario();
    const r = await publicar(c.professorA.token, { turmaId: c.turmaA.id, titulo: "", texto: "" });
    expect(r.status).toBe(400);
    expect(Object.keys((await r.json()).campos).sort()).toEqual(["texto", "titulo"]);
  });

  it("AC-025-06 / RB-20: turma de período encerrado não recebe comunicado", async () => {
    const encerrado = await criarPeriodoDeTeste("Encerrado");
    const c = await cenario(encerrado.nome);
    expect((await publicar(c.professorA.token, { turmaId: c.turmaA.id })).status).toBe(409);
    const r = await publicar(c.coordenador.token, { alcance: "curso", cursoId: c.cursoId });
    expect(r.status).toBe(400);
  });

  it("AC-025-07 / AC-025-08 / INV-025-05: só o autor apaga; a auditoria registra", async () => {
    const c = await cenario();
    const { id } = await (await publicar(c.professorA.token, { turmaId: c.turmaA.id })).json();
    expect((await apagar(c.coordenador.token, id)).status).toBe(404);
    expect((await mural(c.estudantesA[0].token))).toHaveLength(1);
    expect((await apagar(c.professorA.token, id)).status).toBe(200);
    expect(await mural(c.estudantesA[0].token)).toEqual([]);
    expect(await prisma.registroAuditoria.count({ where: { turmaId: c.turmaA.id, acao: "comunicado.apagado" } })).toBe(1);
  });

  it("AC-025-09: administrador não abre o mural", async () => {
    const admin = await entrar("Administrador");
    expect((await muralApi(requisicaoComSessao(`${API}/comunicados`, admin.token))).status).toBe(403);
  });

  it("INV-025-01: o banco recusa comunicado sem alcance ou com os dois", async () => {
    const c = await cenario();
    await expect(prisma.comunicado.create({ data: { autorId: c.professorA.usuario.id, titulo: "x", texto: "y" } })).rejects.toThrow();
    await expect(prisma.comunicado.create({ data: { autorId: c.professorA.usuario.id, titulo: "x", texto: "y", turmaId: c.turmaA.id, cursoId: c.cursoId } })).rejects.toThrow();
  });
});
