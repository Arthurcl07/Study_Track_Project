// SPEC-023 — simulador de notas: regras puras (unitário) e números no painel e no dashboard da turma (integração).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { lerNotaHipotetica, mediaSimulada, notaNecessaria, riscoPelaFrequencia, situacaoSimulada, textoNecessaria } from "@/domain/simulador";
import { recalcularIndicador } from "@/server/academico/indicador";
import { consultarPainel } from "@/server/academico/painel";
import { consultarTurmaDoProfessor } from "@/server/academico/planos";
import type { Sessao } from "@/server/auth/token";
import { prisma } from "@/server/dados/prisma";
import { PREFIXO_DISCIPLINA_TESTE, criarUsuarioDeTeste, cursoPadraoDeTeste, removerUsuariosDeTeste } from "../apoio";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

// AC-023-01: Prova 1 (peso 2) = 4,0; Lista (peso 1) = 5,0; Prova 2 (peso 2) sem nota.
const exemplo = [
  { nome: "Prova 1", peso: 2, nota: 4 },
  { nome: "Lista", peso: 1, nota: 5 },
  { nome: "Prova 2", peso: 2, nota: null },
];

describe("SPEC-023 — regras puras (sem banco)", () => {
  it("AC-023-01 / RB-25 / INV-023-01: para 6,0 precisa de 8,5; para 5,0 precisa de 6,0", () => {
    expect(notaNecessaria(exemplo, 6)).toEqual({ tipo: "nota", valor: 8.5 });
    expect(notaNecessaria(exemplo, 5)).toEqual({ tipo: "nota", valor: 6 });
  });

  it("RB-25: arredonda para cima com uma casa", () => {
    // (6 × 3 − 5) ÷ 2 = 6,5 exato; (6 × 4 − 7) ÷ 3 = 5,666… → 5,7.
    expect(notaNecessaria([{ nome: "A", peso: 1, nota: 5 }, { nome: "B", peso: 2, nota: null }], 6)).toEqual({ tipo: "nota", valor: 6.5 });
    expect(notaNecessaria([{ nome: "A", peso: 1, nota: 7 }, { nome: "B", peso: 3, nota: null }], 6)).toEqual({ tipo: "nota", valor: 5.7 });
  });

  it("AC-023-02 / AC-023-03 / AC-023-04: garantida, não alcançável e sem avaliação restante", () => {
    expect(notaNecessaria([{ nome: "A", peso: 3, nota: 10 }, { nome: "B", peso: 1, nota: null }], 6)).toEqual({ tipo: "garantida" });
    expect(notaNecessaria([{ nome: "A", peso: 3, nota: 1 }, { nome: "B", peso: 1, nota: null }], 6).tipo).toBe("inalcancavel");
    expect(notaNecessaria([{ nome: "A", peso: 1, nota: 7 }], 6)).toEqual({ tipo: "sem-restante" });
    expect([{ tipo: "garantida" as const }, { tipo: "inalcancavel" as const, valor: 12 }, { tipo: "sem-restante" as const }, { tipo: "nota" as const, valor: 8.5 }].map(textoNecessaria))
      .toEqual(["garantida", "não alcançável", "sem avaliação restante", "8,5"]);
  });

  it("AC-023-06 / INV-023-02: média e situação simuladas com a regra única", () => {
    const media = mediaSimulada(exemplo, [null, null, 9]);
    expect(media).toBeCloseTo(6.2, 5);
    expect(situacaoSimulada(media, 90)).toBe("Normal");
    expect(mediaSimulada(exemplo, [null, null, null])).toBeCloseTo(13 / 3, 5);
    expect(lerNotaHipotetica("7,5")).toBe(7.5);
    expect([lerNotaHipotetica(""), lerNotaHipotetica("11"), lerNotaHipotetica("abc")]).toEqual([null, null, null]);
  });

  it("AC-023-05 / RB-05: frequência abaixo de 75% mantém o Risco", () => {
    expect(riscoPelaFrequencia(70)).toBe(true);
    expect(riscoPelaFrequencia(75)).toBe(false);
    expect(situacaoSimulada(9, 70)).toBe("Risco");
  });
});

describe("SPEC-023 — painel e dashboard da turma (integração)", () => {
  async function cenario() {
    const professor = await criarUsuarioDeTeste("Professor");
    const estudante = await criarUsuarioDeTeste("Estudante");
    const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60 } });
    const turma = await prisma.turma.create({ data: { nome: "T", periodo: "2026/2", disciplinaId: disciplina.id, professorId: professor.id, cursoId: await cursoPadraoDeTeste() } });
    await prisma.matricula.create({ data: { estudanteId: estudante.id, turmaId: turma.id } });
    for (const [i, a] of exemplo.entries()) {
      const avaliacao = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: a.nome, peso: a.peso, data: new Date(Date.UTC(2026, 8, 1 + i)) } });
      if (a.nota !== null) await prisma.nota.create({ data: { avaliacaoId: avaliacao.id, estudanteId: estudante.id, valor: a.nota } });
    }
    await recalcularIndicador(estudante.id, turma.id);
    return { professor, estudante, turma };
  }

  it("AC-023-01 / INV-023-03 / INV-023-04: o painel do estudante traz a nota necessária e nada é gravado", async () => {
    const { estudante, turma } = await cenario();
    const antes = await prisma.nota.count({ where: { estudanteId: estudante.id } });
    const painel = await consultarPainel({ usuarioId: estudante.id, nome: "E", perfil: "Estudante" } as Sessao);
    const t = painel.turmas.find((x) => x.id === turma.id)!;
    expect(t.necessaria).toEqual({ normal: { tipo: "nota", valor: 8.5 }, saidaDoRisco: { tipo: "nota", valor: 6 } });
    expect(t.avaliacoes.map((a) => a.nota)).toEqual([4, 5, null]);
    expect(await prisma.nota.count({ where: { estudanteId: estudante.id } })).toBe(antes);
  });

  it("AC-023-07: o dashboard da turma do professor traz Precisa (6,0) por estudante", async () => {
    const { professor, estudante, turma } = await cenario();
    const dashboard = await consultarTurmaDoProfessor(professor.id, turma.id);
    expect(dashboard?.estudantes.find((e) => e.id === estudante.id)?.precisa).toEqual({ tipo: "nota", valor: 8.5 });
    const outro = await criarUsuarioDeTeste("Professor");
    expect(await consultarTurmaDoProfessor(outro.id, turma.id)).toBeNull();
  });
});
