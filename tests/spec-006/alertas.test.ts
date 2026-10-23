// SPEC-006 — alertas de atenção e risco: regra de domínio (unitário) e consulta com escopo (integração).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { nivelDoAlerta } from "@/domain/alertas";
import { GET as alertasApi } from "@/app/api/alertas/route";
import { recalcularIndicador } from "@/server/academico/indicador";
import { prisma } from "@/server/dados/prisma";
import { PREFIXO_DISCIPLINA_TESTE, criarUsuarioDeTeste, entrarComo, removerUsuariosDeTeste, requisicaoComSessao, cursoPadraoDeTeste } from "../apoio";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const URL_ALERTAS = "http://localhost/api/alertas";

// Turma com professor e dois estudantes; cada estudante recebe uma nota e uma frequência.
async function cenario(notaA: number, freqA: number, notaB = 8, freqB = 90) {
  const professor = await criarUsuarioDeTeste("Professor");
  const a = await criarUsuarioDeTeste("Estudante");
  const b = await criarUsuarioDeTeste("Estudante");
  const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60 } });
  const turma = await prisma.turma.create({ data: { nome: "T", periodo: "2026/2", disciplinaId: disciplina.id, professorId: professor.id, cursoId: await cursoPadraoDeTeste() } });
  const avaliacao = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "Prova 1", peso: 1, data: new Date("2026-09-15") } });
  for (const [estudante, nota, freq] of [[a, notaA, freqA], [b, notaB, freqB]] as const) {
    await prisma.matricula.create({ data: { estudanteId: estudante.id, turmaId: turma.id } });
    await prisma.nota.create({ data: { avaliacaoId: avaliacao.id, estudanteId: estudante.id, valor: nota } });
    await prisma.frequencia.create({ data: { estudanteId: estudante.id, turmaId: turma.id, percentual: freq } });
    await recalcularIndicador(estudante.id, turma.id);
  }
  return { professor, a, b, turma, avaliacao };
}

async function alertasDe(usuario: { email: string; senha: string }) {
  const resposta = await alertasApi(requisicaoComSessao(URL_ALERTAS, await entrarComo(usuario.email, usuario.senha)));
  return { status: resposta.status, corpo: await resposta.json() };
}

describe("SPEC-006 — regra de domínio", () => {
  it("INV-006-01: só Atenção e Risco geram alerta", () => {
    expect(nivelDoAlerta("Normal")).toBeNull();
    expect(nivelDoAlerta(null)).toBeNull();
    expect(nivelDoAlerta(undefined)).toBeNull();
    expect(nivelDoAlerta("Atencao")).toBe("Atencao");
    expect(nivelDoAlerta("Risco")).toBe("Risco");
  });
});

describe("SPEC-006 — consulta de alertas", () => {
  it("AC-006-01: indicador em Atenção gera alerta visível ao estudante e ao professor responsável", async () => {
    const { professor, a, turma } = await cenario(5.5, 90);

    const doEstudante = (await alertasDe(a)).corpo;
    const doProfessor = (await alertasDe(professor)).corpo;

    expect(doEstudante).toEqual([expect.objectContaining({ nivel: "Atencao", media: 5.5, frequencia: 90, estudante: expect.objectContaining({ id: a.id }) })]);
    expect(doProfessor).toEqual([expect.objectContaining({ nivel: "Atencao", turma: expect.objectContaining({ id: turma.id }) })]);
  });

  it("AC-006-02: indicador em Risco gera alerta de Risco para ambos", async () => {
    const { professor, a } = await cenario(8, 70);

    expect((await alertasDe(a)).corpo).toEqual([expect.objectContaining({ nivel: "Risco", frequencia: 70 })]);
    expect((await alertasDe(professor)).corpo.map((x: { nivel: string }) => x.nivel)).toEqual(["Risco"]);
  });

  it("AC-006-03: indicador Normal não gera alerta", async () => {
    const { a } = await cenario(8, 90);
    expect((await alertasDe(a)).corpo).toEqual([]);
  });

  it("AC-006-04 / INV-006-03: outro estudante não vê o alerta do colega", async () => {
    const { a, b } = await cenario(4, 90);
    const deB = await alertasDe(b);

    expect(deB.corpo).toEqual([]);
    expect(JSON.stringify(deB.corpo)).not.toContain(a.id);
  });

  it("AC-006-05 / INV-006-02: quando a situação melhora, o alerta deixa de ser exibido", async () => {
    const { a, turma, avaliacao } = await cenario(4, 90);
    expect((await alertasDe(a)).corpo).toHaveLength(1);

    await prisma.nota.update({ where: { avaliacaoId_estudanteId: { avaliacaoId: avaliacao.id, estudanteId: a.id } }, data: { valor: 9 } });
    await recalcularIndicador(a.id, turma.id);

    expect((await alertasDe(a)).corpo).toEqual([]);
  });

  it("AC-006-06: professor de outra turma não recebe o alerta; Coordenador não consulta; sem sessão é 401", async () => {
    await cenario(4, 60);
    const outroProfessor = await criarUsuarioDeTeste("Professor");
    const coordenador = await criarUsuarioDeTeste("Coordenador");

    expect((await alertasDe(outroProfessor)).corpo).toEqual([]);
    expect((await alertasDe(coordenador)).status).toBe(403);
    expect((await alertasApi(requisicaoComSessao(URL_ALERTAS))).status).toBe(401);
  });

  it("Ordenação: para o professor, alertas de Risco vêm antes dos de Atenção", async () => {
    const { professor } = await cenario(5.5, 90, 3, 90);
    const niveis = (await alertasDe(professor)).corpo.map((x: { nivel: string }) => x.nivel);
    expect(niveis).toEqual(["Risco", "Atencao"]);
  });
});
