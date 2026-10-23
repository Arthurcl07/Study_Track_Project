// SPEC-013 — histórico de notas: registro na mesma transação e consulta com escopo (integração).
import { randomUUID } from "node:crypto";
import { readdirSync } from "node:fs";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { GET as historicoApi } from "@/app/api/historico-notas/route";
import { PATCH as alterarNotaApi } from "@/app/api/notas/[id]/route";
import { POST as registrarNotaApi } from "@/app/api/notas/route";
import * as rotaHistorico from "@/app/api/historico-notas/route";
import { prisma } from "@/server/dados/prisma";
import {
  PREFIXO_DISCIPLINA_TESTE, criarUsuarioDeTeste, entrarComo, parametros, removerUsuariosDeTeste, requisicaoComSessao, requisicaoJson,
} from "../apoio";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const URL_NOTAS = "http://localhost/api/notas";

async function cenario() {
  const professor = await criarUsuarioDeTeste("Professor");
  const coordenador = await criarUsuarioDeTeste("Coordenador");
  const estudante = await criarUsuarioDeTeste("Estudante");
  const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60 } });
  const turma = await prisma.turma.create({ data: { nome: "T", periodo: "2026/2", disciplinaId: disciplina.id, professorId: professor.id, cursoId: coordenador.cursoId } });
  await prisma.matricula.create({ data: { estudanteId: estudante.id, turmaId: turma.id } });
  const avaliacao = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "Prova 1", peso: 1, data: new Date("2026-09-15") } });
  return { professor, coordenador, estudante, turma, avaliacao, tokenProfessor: await entrarComo(professor.email, professor.senha) };
}

async function historicoDe(usuario: { email: string; senha: string }, turmaId: string) {
  const token = await entrarComo(usuario.email, usuario.senha);
  const resposta = await historicoApi(requisicaoComSessao(`http://localhost/api/historico-notas?turma=${turmaId}`, token));
  return { status: resposta.status, corpo: await resposta.json() };
}

describe("SPEC-013 — histórico de notas", () => {
  it("AC-013-01 / INV-013-01: lançar 6 e alterar para 8 gera 2 registros, com autor e data, do mais recente para o mais antigo", async () => {
    const c = await cenario();
    const lancada = await registrarNotaApi(requisicaoJson(URL_NOTAS, { turmaId: c.turma.id, avaliacaoId: c.avaliacao.id, estudanteId: c.estudante.id, valor: 6 }, c.tokenProfessor));
    const notaId = (await lancada.json()).nota.id;
    await alterarNotaApi(requisicaoJson(`${URL_NOTAS}/${notaId}`, { valor: 8 }, c.tokenProfessor, "PATCH"), parametros(notaId));

    const { status, corpo } = await historicoDe(c.coordenador, c.turma.id);

    expect(status).toBe(200);
    expect(corpo.registros.map((r: { valorAnterior: number | null; valorNovo: number }) => [r.valorAnterior, r.valorNovo])).toEqual([[6, 8], [null, 6]]);
    expect(corpo.registros[0]).toMatchObject({ avaliacao: "Prova 1", estudante: c.estudante.nome, autor: c.professor.nome, registradoEm: expect.any(String) });
  });

  it("AC-013-02 / INV-013-01: nota inválida não grava nota nem histórico", async () => {
    const c = await cenario();
    const resposta = await registrarNotaApi(requisicaoJson(URL_NOTAS, { turmaId: c.turma.id, avaliacaoId: c.avaliacao.id, estudanteId: c.estudante.id, valor: 11 }, c.tokenProfessor));
    expect(resposta.status).toBe(400);
    expect(await prisma.historicoNota.count({ where: { avaliacaoId: c.avaliacao.id } })).toBe(0);
  });

  it("AC-013-03 / AC-013-04 / INV-013-03: coordenador de outra turma é bloqueado; professor responsável vê", async () => {
    const c = await cenario();
    await registrarNotaApi(requisicaoJson(URL_NOTAS, { turmaId: c.turma.id, avaliacaoId: c.avaliacao.id, estudanteId: c.estudante.id, valor: 7 }, c.tokenProfessor));
    const outroCoordenador = await criarUsuarioDeTeste("Coordenador");
    const outroProfessor = await criarUsuarioDeTeste("Professor");

    expect((await historicoDe(outroCoordenador, c.turma.id)).status).toBe(403);
    expect((await historicoDe(outroProfessor, c.turma.id)).status).toBe(403);
    expect((await historicoDe(c.professor, c.turma.id)).corpo.registros).toHaveLength(1);
  });

  it("AC-013-05: estudante e administrador não consultam o histórico", async () => {
    const c = await cenario();
    const admin = await criarUsuarioDeTeste("Administrador");
    expect((await historicoDe(c.estudante, c.turma.id)).status).toBe(403);
    expect((await historicoDe(admin, c.turma.id)).status).toBe(403);
  });

  it("INV-013-02 / RB-16: não existe rota para editar nem apagar registros do histórico", () => {
    expect(Object.keys(rotaHistorico).sort()).toEqual(["GET"]);
    const pasta = path.resolve(__dirname, "../../src/app/api/historico-notas");
    expect(readdirSync(pasta)).toEqual(["route.ts"]);
  });
});
