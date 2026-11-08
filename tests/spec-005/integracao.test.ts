// SPEC-005 — frequência, atividades e entregas: rotas reais + banco PostgreSQL local (integração).
// SPEC-018 (OPEN-041): a frequência passou a ser registrada pela chamada (/api/aulas); os critérios da SPEC-005
// sobre frequência continuam valendo e são exercidos por ela.
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it, vi } from "vitest";
import { hojeEmBrasilia } from "@/domain/atividades";
import { POST as chamadaApi } from "@/app/api/aulas/route";
import { POST as atividadeApi } from "@/app/api/turmas/[id]/atividades/route";
import { POST as entregaApi } from "@/app/api/atividades/[id]/entregas/route";
import { DELETE as desfazerApi } from "@/app/api/entregas/[id]/route";
import { GET as consultaApi } from "@/app/api/atividades/route";
import { NOME_COOKIE_SESSAO } from "@/server/auth/token";
import { prisma } from "@/server/dados/prisma";
import {
  PREFIXO_DISCIPLINA_TESTE,
  criarUsuarioDeTeste,
  entrarComo,
  parametros,
  removerUsuariosDeTeste,
  requisicaoComSessao,
  requisicaoJson,
  cursoPadraoDeTeste,
  periodoAbertoDeTeste,
} from "../apoio";

// INV-005-04: permite simular falha no recálculo para provar que frequência e indicador ficam na mesma transação.
const falhaNoRecalculo = vi.hoisted(() => ({ ativa: false }));
vi.mock("@/server/academico/indicador", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/server/academico/indicador")>();
  return {
    ...original,
    recalcularIndicador: async (...args: Parameters<typeof original.recalcularIndicador>) => {
      if (falhaNoRecalculo.ativa) throw new Error("Falha simulada no recálculo do indicador.");
      return original.recalcularIndicador(...args);
    },
  };
});

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const API = "http://localhost/api";

// Soma dias a uma data "AAAA-MM-DD" sem depender de fuso.
function dias(base: string, quantos: number) {
  const data = new Date(`${base}T00:00:00Z`);
  data.setUTCDate(data.getUTCDate() + quantos);
  return data.toISOString().slice(0, 10);
}

function requisicaoDelete(url: string, token?: string) {
  return new Request(url, { method: "DELETE", headers: token ? { cookie: `${NOME_COOKIE_SESSAO}=${token}` } : undefined });
}

// Turma com professor responsável (logado) e dois estudantes matriculados.
async function cenario() {
  const professor = await criarUsuarioDeTeste("Professor");
  const estudanteA = await criarUsuarioDeTeste("Estudante");
  const estudanteB = await criarUsuarioDeTeste("Estudante");
  const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60 } });
  const turma = await prisma.turma.create({
    data: { nome: "T", periodo: await periodoAbertoDeTeste(), disciplinaId: disciplina.id, professorId: professor.id, cursoId: await cursoPadraoDeTeste() },
  });
  await prisma.matricula.createMany({
    data: [estudanteA, estudanteB].map((e) => ({ estudanteId: e.id, turmaId: turma.id })),
  });
  return { professor, estudanteA, estudanteB, turma, token: await entrarComo(professor.email, professor.senha) };
}

async function criarAtividadePelaApi(turmaId: string, token: string, prazo: string, descricao = "Lista") {
  const resposta = await atividadeApi(requisicaoJson(`${API}/turmas/${turmaId}/atividades`, { descricao, prazo }, token), parametros(turmaId));
  return { resposta, atividade: await resposta.json() };
}

function registrarEntrega(atividadeId: string, estudanteId: string, token: string, dataEntrega?: string) {
  return entregaApi(requisicaoJson(`${API}/atividades/${atividadeId}/entregas`, { estudanteId, dataEntrega }, token), parametros(atividadeId));
}

// Chamada de uma aula: estudanteA presente ou não, estudanteB sempre presente.
function chamada(turmaId: string, estudanteA: string, estudanteB: string, data: string, presenteA: boolean, token: string) {
  const presencas = [{ estudanteId: estudanteA, presente: presenteA }, { estudanteId: estudanteB, presente: true }];
  return chamadaApi(requisicaoJson(`${API}/aulas`, { turmaId, data, presencas }, token));
}

describe("SPEC-005 — frequência (pela chamada, SPEC-018)", () => {
  it("AC-005-01 / INV-005-01: frequência registrada e o indicador recalculado (75% Normal, 60% Risco)", async () => {
    const { turma, estudanteA, estudanteB, token } = await cenario();
    const hoje = hojeEmBrasilia();
    for (const [i, presente] of [true, true, true, false].entries()) {
      expect((await chamada(turma.id, estudanteA.id, estudanteB.id, dias(hoje, -10 + i), presente, token)).status).toBe(200);
    }
    expect(await prisma.indicadorAcademico.findFirst({ where: { estudanteId: estudanteA.id, turmaId: turma.id } })).toMatchObject({ frequenciaAtual: 75, situacao: "Normal" });

    const risco = await chamada(turma.id, estudanteA.id, estudanteB.id, dias(hoje, -5), false, token);
    const corpo = await risco.json();
    expect(corpo.indicadores.find((i: { estudanteId: string }) => i.estudanteId === estudanteA.id)).toMatchObject({ frequenciaAtual: 60, situacao: "Risco" });
    expect(await prisma.frequencia.count({ where: { estudanteId: estudanteA.id, turmaId: turma.id } })).toBe(1);
  });

  it("Contrato Registrar chamada: data futura é recusada e nada muda", async () => {
    const { turma, estudanteA, estudanteB, token } = await cenario();
    const resposta = await chamada(turma.id, estudanteA.id, estudanteB.id, dias(hojeEmBrasilia(), 1), true, token);

    expect(resposta.status).toBe(400);
    expect((await resposta.json()).campos).toHaveProperty("data");
    expect(await prisma.frequencia.count({ where: { estudanteId: estudanteA.id } })).toBe(0);
  });

  it("INV-005-04: se o recálculo falhar, a chamada e a frequência também não são gravadas (mesma transação)", async () => {
    const { turma, estudanteA, estudanteB, token } = await cenario();
    falhaNoRecalculo.ativa = true;
    try {
      await expect(chamada(turma.id, estudanteA.id, estudanteB.id, hojeEmBrasilia(), false, token)).rejects.toThrow();
    } finally {
      falhaNoRecalculo.ativa = false;
    }
    expect(await prisma.frequencia.count({ where: { estudanteId: estudanteA.id } })).toBe(0);
    expect(await prisma.aula.count({ where: { turmaId: turma.id } })).toBe(0);
  });
});

describe("SPEC-005 — atividades e entregas", () => {
  it("AC-005-02: professor responsável cadastra atividade completa", async () => {
    const { turma, token } = await cenario();
    const prazo = dias(hojeEmBrasilia(), 7);
    const { resposta, atividade } = await criarAtividadePelaApi(turma.id, token, prazo, "Diagrama de classes");

    expect(resposta.status).toBe(201);
    expect(atividade).toMatchObject({ turmaId: turma.id, descricao: "Diagrama de classes", prazo });
  });

  it("AC-005-03: atividade sem prazo é impedida e nada é gravado", async () => {
    const { turma, token } = await cenario();
    const resposta = await atividadeApi(requisicaoJson(`${API}/turmas/${turma.id}/atividades`, { descricao: "Sem prazo" }, token), parametros(turma.id));

    expect(resposta.status).toBe(400);
    expect((await resposta.json()).campos).toHaveProperty("prazo");
    expect(await prisma.atividade.count({ where: { turmaId: turma.id } })).toBe(0);
  });

  it("AC-005-04 a AC-005-07: status No prazo, Pendente e Atrasada calculados na consulta, para professor e estudante", async () => {
    const { turma, estudanteA, estudanteB, token } = await cenario();
    const hoje = hojeEmBrasilia();
    const vencida = (await criarAtividadePelaApi(turma.id, token, dias(hoje, -1), "Vencida")).atividade;
    const futura = (await criarAtividadePelaApi(turma.id, token, dias(hoje, 3), "Futura")).atividade;

    expect((await registrarEntrega(vencida.id, estudanteA.id, token, dias(hoje, -2))).status).toBe(201); // antes do prazo
    const tardia = await registrarEntrega(vencida.id, estudanteB.id, token); // hoje, depois do prazo
    expect(await tardia.json()).toMatchObject({ status: "Atrasada" });

    const doProfessor = await (await consultaApi(requisicaoComSessao(`${API}/atividades`, token))).json();
    const status = (atividadeId: string, estudanteId: string) =>
      doProfessor.find((a: { id: string }) => a.id === atividadeId).entregas.find((e: { estudanteId: string }) => e.estudanteId === estudanteId).status;

    expect(status(vencida.id, estudanteA.id)).toBe("NoPrazo"); // AC-005-05
    expect(status(vencida.id, estudanteB.id)).toBe("Atrasada"); // AC-005-06
    expect(status(futura.id, estudanteA.id)).toBe("Pendente"); // AC-005-07

    // AC-005-04: sem entrega e prazo encerrado aparece Atrasada também para o estudante.
    await prisma.entrega.deleteMany({ where: { atividadeId: vencida.id, estudanteId: estudanteB.id } });
    const tokenB = await entrarComo(estudanteB.email, estudanteB.senha);
    const doEstudanteB = await (await consultaApi(requisicaoComSessao(`${API}/atividades`, tokenB))).json();
    expect(doEstudanteB.find((a: { id: string }) => a.id === vencida.id).entregas).toEqual([
      { estudanteId: estudanteB.id, dataEntrega: null, status: "Atrasada" },
    ]);
  });

  it("AC-005-09 / RNF-05: o estudante só vê o próprio status de entrega", async () => {
    const { turma, estudanteA, estudanteB, token } = await cenario();
    const { atividade } = await criarAtividadePelaApi(turma.id, token, dias(hojeEmBrasilia(), 5));
    await registrarEntrega(atividade.id, estudanteB.id, token);

    const tokenA = await entrarComo(estudanteA.email, estudanteA.senha);
    const resposta = await (await consultaApi(requisicaoComSessao(`${API}/atividades`, tokenA))).json();
    const texto = JSON.stringify(resposta);

    expect(resposta).toHaveLength(1);
    expect(resposta[0].entregas).toEqual([{ estudanteId: estudanteA.id, dataEntrega: null, status: "Pendente" }]);
    expect(texto).not.toContain(estudanteB.id);
  });

  it("INV-005-03 / Caso 12.5: segunda entrega do mesmo estudante é recusada; desfazer remove o registro", async () => {
    const { turma, estudanteA, token } = await cenario();
    const { atividade } = await criarAtividadePelaApi(turma.id, token, dias(hojeEmBrasilia(), 5));
    const primeira = await registrarEntrega(atividade.id, estudanteA.id, token);
    const { id: entregaId } = await primeira.json();

    expect((await registrarEntrega(atividade.id, estudanteA.id, token)).status).toBe(409);
    expect(await prisma.entrega.count({ where: { atividadeId: atividade.id } })).toBe(1);

    const desfeita = await desfazerApi(requisicaoDelete(`${API}/entregas/${entregaId}`, token), parametros(entregaId));
    expect(desfeita.status).toBe(200);
    expect(await prisma.entrega.count({ where: { atividadeId: atividade.id } })).toBe(0);
  });

  it("OPEN-003: data de entrega no futuro é recusada", async () => {
    const { turma, estudanteA, token } = await cenario();
    const { atividade } = await criarAtividadePelaApi(turma.id, token, dias(hojeEmBrasilia(), 5));
    const resposta = await registrarEntrega(atividade.id, estudanteA.id, token, dias(hojeEmBrasilia(), 1));

    expect(resposta.status).toBe(400);
    expect((await resposta.json()).campos).toHaveProperty("dataEntrega");
  });
});

describe("SPEC-005 — escopo", () => {
  it("AC-005-08 / INV-005-05: professor de outra turma não registra frequência, atividade nem entrega", async () => {
    const { turma, estudanteA, token } = await cenario();
    const { atividade } = await criarAtividadePelaApi(turma.id, token, dias(hojeEmBrasilia(), 5));
    const entregaDoDono = await (await registrarEntrega(atividade.id, estudanteA.id, token)).json();
    const intruso = await criarUsuarioDeTeste("Professor");
    const tokenIntruso = await entrarComo(intruso.email, intruso.senha);

    const { estudanteB } = await prisma.matricula.findFirstOrThrow({ where: { turmaId: turma.id, NOT: { estudanteId: estudanteA.id } }, select: { estudanteId: true } }).then((m) => ({ estudanteB: m.estudanteId }));
    const frequencia = await chamada(turma.id, estudanteA.id, estudanteB, hojeEmBrasilia(), false, tokenIntruso);
    const novaAtividade = await atividadeApi(
      requisicaoJson(`${API}/turmas/${turma.id}/atividades`, { descricao: "Intrusa", prazo: dias(hojeEmBrasilia(), 2) }, tokenIntruso),
      parametros(turma.id),
    );
    const entrega = await registrarEntrega(atividade.id, estudanteA.id, tokenIntruso);
    const desfazer = await desfazerApi(requisicaoDelete(`${API}/entregas/${entregaDoDono.id}`, tokenIntruso), parametros(entregaDoDono.id));
    const lista = await (await consultaApi(requisicaoComSessao(`${API}/atividades`, tokenIntruso))).json();

    expect([frequencia.status, novaAtividade.status, entrega.status, desfazer.status]).toEqual([403, 403, 403, 403]);
    expect(await prisma.frequencia.count({ where: { estudanteId: estudanteA.id } })).toBe(0);
    expect(await prisma.atividade.count({ where: { turmaId: turma.id } })).toBe(1);
    expect(await prisma.entrega.count({ where: { atividadeId: atividade.id } })).toBe(1);
    expect(lista).toEqual([]);
  });

  it("RNF-03: estudante e coordenador não registram; coordenador não consulta entregas; sem sessão é 401", async () => {
    const { turma, estudanteA } = await cenario();
    const tokenEstudante = await entrarComo(estudanteA.email, estudanteA.senha);
    const coordenador = await criarUsuarioDeTeste("Coordenador");
    const tokenCoordenador = await entrarComo(coordenador.email, coordenador.senha);
    const corpo = { turmaId: turma.id, data: hojeEmBrasilia(), presencas: [{ estudanteId: estudanteA.id, presente: true }] };

    expect((await chamadaApi(requisicaoJson(`${API}/aulas`, corpo, tokenEstudante))).status).toBe(403);
    expect((await chamadaApi(requisicaoJson(`${API}/aulas`, corpo, tokenCoordenador))).status).toBe(403);
    expect((await consultaApi(requisicaoComSessao(`${API}/atividades`, tokenCoordenador))).status).toBe(403);
    expect((await consultaApi(requisicaoComSessao(`${API}/atividades`))).status).toBe(401);
  });
});
