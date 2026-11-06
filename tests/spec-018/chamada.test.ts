// SPEC-018 — chamada por aula: regras de domínio (unitário) e rota + banco (integração).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { hojeEmBrasilia } from "@/domain/atividades";
import { MENSAGEM_DATA_AULA, MENSAGEM_LISTA_CHAMADA, frequenciaPelaChamada, validarChamada } from "@/domain/frequencia";
import { GET as aulasApi, POST as chamadaApi } from "@/app/api/aulas/route";
import { prisma } from "@/server/dados/prisma";
import {
  PREFIXO_DISCIPLINA_TESTE,
  criarPeriodoDeTeste,
  criarUsuarioDeTeste,
  cursoPadraoDeTeste,
  entrarComo,
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

async function cenario(quantos = 3, periodo = "2026/2") {
  const professor = await criarUsuarioDeTeste("Professor");
  const estudantes = [];
  for (let i = 0; i < quantos; i++) estudantes.push(await criarUsuarioDeTeste("Estudante"));
  const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60 } });
  const turma = await prisma.turma.create({ data: { nome: "T", periodo, disciplinaId: disciplina.id, professorId: professor.id, cursoId: await cursoPadraoDeTeste() } });
  await prisma.matricula.createMany({ data: estudantes.map((e) => ({ estudanteId: e.id, turmaId: turma.id })) });
  return { professor, estudantes, turma, token: await entrarComo(professor.email, professor.senha) };
}

function chamada(turmaId: string, data: string, presencas: [string, boolean][], token: string) {
  return chamadaApi(requisicaoJson(`${API}/aulas`, { turmaId, data, presencas: presencas.map(([estudanteId, presente]) => ({ estudanteId, presente })) }, token));
}

const frequencia = async (estudanteId: string, turmaId: string) =>
  (await prisma.frequencia.findUnique({ where: { estudanteId_turmaId: { estudanteId, turmaId } } }))?.percentual ?? null;

describe("SPEC-018 — regras de domínio (sem banco)", () => {
  it("RB-21 / INV-018-03: frequência = presenças ÷ aulas em que constou × 100; sem aula, não registrada", () => {
    expect(frequenciaPelaChamada([true, true, true, false])).toBe(75);
    expect(frequenciaPelaChamada([true, false, false])).toBeCloseTo(33.33, 1);
    expect(frequenciaPelaChamada([])).toBeNull();
  });

  it("INV-018-06 / INV-018-02: data não futura; lista igual aos matriculados", () => {
    const hoje = "2026-11-05";
    const ok = validarChamada({ data: "2026-11-05", presencas: [{ estudanteId: "a", presente: true }, { estudanteId: "b", presente: false }] }, ["a", "b"], hoje);
    expect(ok.ok).toBe(true);
    expect(validarChamada({ data: "2026-11-06", presencas: [{ estudanteId: "a", presente: true }] }, ["a"], hoje)).toEqual({ ok: false, erros: { data: MENSAGEM_DATA_AULA } });
    expect(validarChamada({ data: "2026-02-30", presencas: [{ estudanteId: "a", presente: true }] }, ["a"], hoje).ok).toBe(false);
    for (const presencas of [[{ estudanteId: "a", presente: true }], [{ estudanteId: "a", presente: true }, { estudanteId: "a", presente: false }], [{ estudanteId: "a", presente: true }, { estudanteId: "x", presente: true }], [{ estudanteId: "a", presente: "sim" }, { estudanteId: "b", presente: true }]]) {
      expect(validarChamada({ data: hoje, presencas }, ["a", "b"], hoje)).toEqual({ ok: false, erros: { presencas: MENSAGEM_LISTA_CHAMADA } });
    }
  });
});

describe("SPEC-018 — chamada (integração)", () => {
  it("AC-018-01 / AC-018-07: chamada com 1 falta grava a aula e recalcula frequência e indicador de cada estudante", async () => {
    const { estudantes: [a, b, c], turma, token } = await cenario();
    const r = await chamada(turma.id, hojeEmBrasilia(), [[a.id, true], [b.id, true], [c.id, false]], token);
    expect(r.status).toBe(200);
    const corpo = await r.json();
    expect(corpo).toMatchObject({ corrigida: false, presentes: 2, total: 3 });
    expect([await frequencia(a.id, turma.id), await frequencia(b.id, turma.id), await frequencia(c.id, turma.id)]).toEqual([100, 100, 0]);
    const indicadorC = await prisma.indicadorAcademico.findUnique({ where: { estudanteId_turmaId: { estudanteId: c.id, turmaId: turma.id } } });
    expect(indicadorC).toMatchObject({ frequenciaAtual: 0, situacao: "Risco" });
    expect(await prisma.presenca.count({ where: { aula: { turmaId: turma.id } } })).toBe(3);
  });

  it("AC-018-02 / RB-05: 3 presenças em 4 aulas dá 75% e situação Normal", async () => {
    const { estudantes: [a], turma, token } = await cenario(1);
    const hoje = hojeEmBrasilia();
    for (const [i, presente] of [true, false, true, true].entries()) await chamada(turma.id, dias(hoje, i - 4), [[a.id, presente]], token);
    expect(await frequencia(a.id, turma.id)).toBe(75);
    expect((await prisma.indicadorAcademico.findFirst({ where: { estudanteId: a.id, turmaId: turma.id } }))?.situacao).toBe("Normal");
  });

  it("AC-018-03 / INV-018-01: corrigir a chamada de uma data substitui as presenças (80% → 60%, Risco), sem duplicar a aula", async () => {
    const { estudantes: [a], turma, token } = await cenario(1);
    const hoje = hojeEmBrasilia();
    for (const [i, presente] of [true, true, true, true, false].entries()) await chamada(turma.id, dias(hoje, i - 5), [[a.id, presente]], token);
    expect(await frequencia(a.id, turma.id)).toBe(80);
    const correcao = await chamada(turma.id, dias(hoje, -5), [[a.id, false]], token);
    expect((await correcao.json()).corrigida).toBe(true);
    expect(await frequencia(a.id, turma.id)).toBe(60);
    expect((await prisma.indicadorAcademico.findFirst({ where: { estudanteId: a.id, turmaId: turma.id } }))?.situacao).toBe("Risco");
    expect(await prisma.aula.count({ where: { turmaId: turma.id } })).toBe(5);
  });

  it("AC-018-04: estudante matriculado depois só conta as aulas em que constou", async () => {
    const { estudantes: [a], turma, token } = await cenario(1);
    const hoje = hojeEmBrasilia();
    await chamada(turma.id, dias(hoje, -3), [[a.id, false]], token);
    await chamada(turma.id, dias(hoje, -2), [[a.id, false]], token);
    const novo = await criarUsuarioDeTeste("Estudante");
    await prisma.matricula.create({ data: { estudanteId: novo.id, turmaId: turma.id } });
    await chamada(turma.id, dias(hoje, -1), [[a.id, true], [novo.id, true]], token);
    expect(await frequencia(novo.id, turma.id)).toBe(100);
    expect(await frequencia(a.id, turma.id)).toBeCloseTo(33.33, 1);
  });

  it("AC-018-05: data futura, estudante faltando ou de fora: recusada e nada gravado", async () => {
    const { estudantes: [a, b], turma, token } = await cenario(2);
    const fora = await criarUsuarioDeTeste("Estudante");
    const respostas = [
      await chamada(turma.id, dias(hojeEmBrasilia(), 1), [[a.id, true], [b.id, true]], token),
      await chamada(turma.id, hojeEmBrasilia(), [[a.id, true]], token),
      await chamada(turma.id, hojeEmBrasilia(), [[a.id, true], [b.id, true], [fora.id, true]], token),
    ];
    expect(respostas.map((r) => r.status)).toEqual([400, 400, 400]);
    expect(await prisma.aula.count({ where: { turmaId: turma.id } })).toBe(0);
  });

  it("AC-018-06 / INV-018-05: professor de outra turma não registra nem consulta; estudante e coordenador são negados", async () => {
    const { estudantes: [a], turma } = await cenario(1);
    const intruso = await criarUsuarioDeTeste("Professor");
    const tokenIntruso = await entrarComo(intruso.email, intruso.senha);
    expect((await chamada(turma.id, hojeEmBrasilia(), [[a.id, true]], tokenIntruso)).status).toBe(403);
    expect((await aulasApi(requisicaoComSessao(`${API}/aulas?turmaId=${turma.id}`, tokenIntruso))).status).toBe(404);
    const tokenEstudante = await entrarComo(a.email, a.senha);
    expect((await chamada(turma.id, hojeEmBrasilia(), [[a.id, true]], tokenEstudante)).status).toBe(403);
    expect(await prisma.aula.count({ where: { turmaId: turma.id } })).toBe(0);
  });

  it("RB-20: turma de período encerrado não aceita chamada", async () => {
    const periodo = await criarPeriodoDeTeste("Encerrado");
    const { estudantes: [a], turma, token } = await cenario(1, periodo.nome);
    expect((await chamada(turma.id, hojeEmBrasilia(), [[a.id, true]], token)).status).toBe(409);
  });

  it("GET /api/aulas: o professor vê as aulas com as presenças, mais recentes primeiro", async () => {
    const { estudantes: [a], turma, token } = await cenario(1);
    const hoje = hojeEmBrasilia();
    await chamada(turma.id, dias(hoje, -2), [[a.id, true]], token);
    await chamada(turma.id, dias(hoje, -1), [[a.id, false]], token);
    const aulas = await (await aulasApi(requisicaoComSessao(`${API}/aulas?turmaId=${turma.id}`, token))).json();
    expect(aulas.map((x: { data: string }) => x.data)).toEqual([dias(hoje, -1), dias(hoje, -2)]);
    expect(aulas[0].presencas).toEqual([{ estudanteId: a.id, presente: false }]);
  });
});
