// SPEC-007 — painel acadêmico do estudante: evolução (unitário) e consulta com escopo (integração).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { ordenarEvolucao } from "@/domain/alertas";
import { hojeEmBrasilia } from "@/domain/atividades";
import { GET as painelApi } from "@/app/api/painel/route";
import { recalcularIndicador } from "@/server/academico/indicador";
import { paraData } from "@/server/dados/atividades";
import { prisma } from "@/server/dados/prisma";
import { PREFIXO_DISCIPLINA_TESTE, criarUsuarioDeTeste, entrarComo, removerUsuariosDeTeste, requisicaoComSessao } from "../apoio";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const URL_PAINEL = "http://localhost/api/painel";

function dias(base: string, quantos: number) {
  const data = paraData(base);
  data.setUTCDate(data.getUTCDate() + quantos);
  return data.toISOString().slice(0, 10);
}

// Turma com três avaliações criadas FORA de ordem de data, notas do estudante A, frequência e atividades.
async function cenario() {
  const professor = await criarUsuarioDeTeste("Professor");
  const a = await criarUsuarioDeTeste("Estudante");
  const b = await criarUsuarioDeTeste("Estudante");
  const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60 } });
  const turma = await prisma.turma.create({ data: { nome: "T", periodo: "2026/2", disciplinaId: disciplina.id, professorId: professor.id } });
  await prisma.matricula.createMany({ data: [a, b].map((e) => ({ estudanteId: e.id, turmaId: turma.id })) });

  const avaliacoes = [["Trabalho", "2026-10-30", 6], ["Prova 1", "2026-09-15", 4], ["Prova 2", "2026-10-10", 5.5]] as const;
  for (const [nome, data, valor] of avaliacoes) {
    const av = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome, peso: 1, data: new Date(`${data}T00:00:00Z`) } });
    await prisma.nota.create({ data: { avaliacaoId: av.id, estudanteId: a.id, valor } });
  }
  await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "Sem nota ainda", peso: 1, data: new Date("2026-11-20T00:00:00Z") } });
  await prisma.frequencia.create({ data: { estudanteId: a.id, turmaId: turma.id, percentual: 85 } });
  await recalcularIndicador(a.id, turma.id);

  const hoje = hojeEmBrasilia();
  await prisma.atividade.create({ data: { turmaId: turma.id, descricao: "Vencida", prazo: paraData(dias(hoje, -2)) } });
  await prisma.atividade.create({ data: { turmaId: turma.id, descricao: "Futura", prazo: paraData(dias(hoje, 5)) } });
  return { professor, a, b, turma };
}

async function painelDe(usuario: { email: string; senha: string }) {
  const resposta = await painelApi(requisicaoComSessao(URL_PAINEL, await entrarComo(usuario.email, usuario.senha)));
  return { status: resposta.status, corpo: await resposta.json() };
}

describe("SPEC-007 — evolução (sem banco)", () => {
  it("INV-007-04: notas ordenadas pela data da avaliação; empate pelo nome", () => {
    const ordenada = ordenarEvolucao([
      { avaliacao: "Trabalho", data: "2026-10-30", nota: 6 },
      { avaliacao: "Prova B", data: "2026-09-15", nota: 4 },
      { avaliacao: "Prova A", data: "2026-09-15", nota: 7 },
    ]);
    expect(ordenada.map((p) => p.avaliacao)).toEqual(["Prova A", "Prova B", "Trabalho"]);
  });
});

describe("SPEC-007 — painel do estudante", () => {
  it("AC-007-01 / AC-007-07: painel traz média, frequência, situação, notas e evolução em ordem de data", async () => {
    const { a, turma } = await cenario();
    const { status, corpo } = await painelDe(a);

    expect(status).toBe(200);
    expect(corpo.turmas).toHaveLength(1);
    const t = corpo.turmas[0];
    expect(t).toMatchObject({ id: turma.id, frequencia: 85, situacao: "Atencao", avaliacoesComNota: 3 });
    expect(t.media).toBeCloseTo((6 + 4 + 5.5) / 3, 10);
    expect(t.evolucao.map((p: { avaliacao: string }) => p.avaliacao)).toEqual(["Prova 1", "Prova 2", "Trabalho"]);
    expect(t.evolucao.map((p: { nota: number }) => p.nota)).toEqual([4, 5.5, 6]);
  });

  it("AC-007-02: situação Atenção destaca a turma e traz o alerta", async () => {
    const { a, turma } = await cenario();
    const { corpo } = await painelDe(a);

    expect(corpo.turmas[0].alerta).toBe("Atencao");
    expect(corpo.alertas).toEqual([expect.objectContaining({ nivel: "Atencao", turma: expect.objectContaining({ id: turma.id }) })]);
  });

  it("AC-007-03: atividade sem entrega após o prazo aparece como atrasada (e a futura como pendente)", async () => {
    const { a } = await cenario();
    const { corpo } = await painelDe(a);

    expect(corpo.atividadesEmAtencao.map((x: { descricao: string; status: string }) => [x.descricao, x.status])).toEqual([
      ["Vencida", "Atrasada"],
      ["Futura", "Pendente"],
    ]);
  });

  it("AC-007-04: estudante sem turmas recebe painel vazio", async () => {
    const sozinho = await criarUsuarioDeTeste("Estudante");
    const { corpo } = await painelDe(sozinho);
    // A SPEC-012 acrescentou a lista de planos ao painel; sem turmas, também vem vazia.
    expect(corpo).toEqual({ turmas: [], alertas: [], planos: [], atividadesEmAtencao: [] });
  });

  it("AC-007-05 / INV-007-01 / INV-007-03: cada estudante vê só os próprios dados", async () => {
    const { a, b } = await cenario();
    const { corpo } = await painelDe(b);
    const texto = JSON.stringify(corpo);

    expect(corpo.turmas[0]).toMatchObject({ media: null, frequencia: null, situacao: null, evolucao: [] });
    expect(corpo.alertas).toEqual([]);
    expect(texto).not.toContain(a.id);
  });

  it("INV-007-02 / RB-10: depois de uma frequência nova, o painel mostra a situação do indicador recalculado", async () => {
    const { a, turma } = await cenario();
    expect((await painelDe(a)).corpo.turmas[0].situacao).toBe("Atencao");

    await prisma.frequencia.update({ where: { estudanteId_turmaId: { estudanteId: a.id, turmaId: turma.id } }, data: { percentual: 60 } });
    await recalcularIndicador(a.id, turma.id);

    expect((await painelDe(a)).corpo.turmas[0]).toMatchObject({ frequencia: 60, situacao: "Risco" });
  });

  it("AC-007-06 / RNF-01: o painel responde em menos de 3 s com dados de amostra", async () => {
    const { a } = await cenario();
    const token = await entrarComo(a.email, a.senha);
    const inicio = performance.now();
    const resposta = await painelApi(requisicaoComSessao(URL_PAINEL, token));
    await resposta.json();
    expect(performance.now() - inicio).toBeLessThan(3000);
  });

  it("RNF-03: só o perfil Estudante acessa o painel; sem sessão é 401", async () => {
    const { professor } = await cenario();
    expect((await painelDe(professor)).status).toBe(403);
    expect((await painelApi(requisicaoComSessao(URL_PAINEL))).status).toBe(401);
  });
});
