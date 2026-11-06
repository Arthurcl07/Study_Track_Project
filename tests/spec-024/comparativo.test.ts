// SPEC-024 — comparativo entre semestres: regras puras (unitário) e consultas + banco (integração).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { mediaPorDisciplina, resumoPorPeriodo, tendencia, type LinhaComparativo } from "@/domain/comparativo";
import { consultarDocumentosDoEstudante } from "@/server/academico/documentos";
import { recalcularIndicador } from "@/server/academico/indicador";
import { consultarPainelCoordenador } from "@/server/academico/painel-coordenador";
import type { Sessao } from "@/server/auth/token";
import { prisma } from "@/server/dados/prisma";
import { PREFIXO_DISCIPLINA_TESTE, criarCursoDeTeste, criarPeriodoDeTeste, criarUsuarioDeTeste, removerUsuariosDeTeste } from "../apoio";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const linha = (periodo: string, encerrado: boolean, media: number | null, frequencia: number | null, situacao: LinhaComparativo["situacao"], disciplina = "D"): LinhaComparativo =>
  ({ periodo, encerrado, disciplina, media, frequencia, situacao });

describe("SPEC-024 — regras puras (sem banco)", () => {
  it("INV-024-01 / INV-024-02 / AC-024-02: médias simples, % em Risco e % de aprovação só no encerrado", () => {
    const resumo = resumoPorPeriodo([
      linha("2026/1", true, 7, 80, "Normal"),
      linha("2026/1", true, 4, 90, "Risco"),
      linha("2026/2", false, 6, 70, "Risco"),
      linha("2026/2", false, null, null, null),
    ]);
    expect(resumo).toEqual([
      { periodo: "2026/1", encerrado: true, matriculas: 2, media: 5.5, frequencia: 85, percentualRisco: 50, percentualAprovacao: 50 },
      { periodo: "2026/2", encerrado: false, matriculas: 2, media: 6, frequencia: 70, percentualRisco: 100, percentualAprovacao: null },
    ]);
  });

  it("RB-24: 'Sem registro' não entra na aprovação", () => {
    const [p] = resumoPorPeriodo([linha("2026/1", true, 8, 90, "Normal"), linha("2026/1", true, null, 90, "Normal")]);
    expect(p.percentualAprovacao).toBe(100);
  });

  it("média por disciplina e tendência", () => {
    const d = mediaPorDisciplina([linha("2026/1", true, 6, 80, "Normal", "Cálculo"), linha("2026/2", false, 5, 80, "Atencao", "Cálculo"), linha("2026/2", false, 8, 80, "Normal", "Álgebra")]);
    expect(d).toEqual({ periodos: ["2026/1", "2026/2"], linhas: [{ disciplina: "Álgebra", medias: [null, 8] }, { disciplina: "Cálculo", medias: [6, 5] }] });
    expect([tendencia(6, 5), tendencia(5, 6), tendencia(6, 6.01), tendencia(null, 5)]).toEqual(["desce", "sobe", "igual", null]);
  });
});

describe("SPEC-024 — comparativo (integração)", () => {
  async function turma(cursoId: string, professorId: string, periodo: string, estudanteId: string, media: number, frequencia: number) {
    const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60, cursos: { create: { cursoId } } } });
    const t = await prisma.turma.create({ data: { nome: "T", periodo, disciplinaId: disciplina.id, professorId, cursoId } });
    await prisma.matricula.create({ data: { estudanteId, turmaId: t.id } });
    const avaliacao = await prisma.avaliacao.create({ data: { turmaId: t.id, nome: "P1", peso: 1, data: new Date() } });
    await prisma.nota.create({ data: { avaliacaoId: avaliacao.id, estudanteId, valor: media } });
    await prisma.frequencia.create({ data: { estudanteId, turmaId: t.id, percentual: frequencia } });
    await recalcularIndicador(estudanteId, t.id);
    return t;
  }

  it("AC-024-01 / AC-024-03 / AC-024-04 / INV-024-03: por período, só os cursos do coordenador e o curso filtrado", async () => {
    const coordenador = await criarUsuarioDeTeste("Coordenador");
    const segundoCurso = await criarCursoDeTeste(coordenador.id);
    const professor = await criarUsuarioDeTeste("Professor");
    const a = await criarUsuarioDeTeste("Estudante", { cursoId: coordenador.cursoId });
    const b = await criarUsuarioDeTeste("Estudante", { cursoId: segundoCurso });
    const antigo = await criarPeriodoDeTeste("Encerrado");
    await turma(coordenador.cursoId, professor.id, antigo.nome, a.id, 7, 90);
    await turma(coordenador.cursoId, professor.id, "2026/2", a.id, 5, 80);
    await turma(segundoCurso, professor.id, "2026/2", b.id, 9, 100);
    // Turma de outro coordenador no mesmo período: não entra.
    const outro = await criarUsuarioDeTeste("Coordenador");
    const c = await criarUsuarioDeTeste("Estudante", { cursoId: outro.cursoId });
    await turma(outro.cursoId, professor.id, "2026/2", c.id, 1, 10);

    const sessao = { usuarioId: coordenador.id, nome: "C", perfil: "Coordenador" } as Sessao;
    const todos = (await consultarPainelCoordenador(sessao)).comparativo.periodos;
    expect(todos.map((p) => [p.periodo, p.matriculas, p.media])).toEqual([[antigo.nome, 1, 7], ["2026/2", 2, 7]]);
    expect(todos[0].percentualAprovacao).toBe(100);
    expect(todos[1].percentualAprovacao).toBeNull();

    const filtrado = (await consultarPainelCoordenador(sessao, coordenador.cursoId)).comparativo.periodos;
    expect(filtrado.map((p) => [p.periodo, p.media])).toEqual([[antigo.nome, 7], ["2026/2", 5]]);
  });

  it("AC-024-05: estudante vê média e frequência de cada semestre em Documentos", async () => {
    const coordenador = await criarUsuarioDeTeste("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    const estudante = await criarUsuarioDeTeste("Estudante", { cursoId: coordenador.cursoId });
    const antigo = await criarPeriodoDeTeste("Encerrado");
    await turma(coordenador.cursoId, professor.id, antigo.nome, estudante.id, 8, 90);
    await turma(coordenador.cursoId, professor.id, "2026/2", estudante.id, 6, 80);
    const documentos = await consultarDocumentosDoEstudante({ usuarioId: estudante.id, nome: "E", perfil: "Estudante" } as Sessao);
    expect(documentos?.semestres.map((s) => [s.periodo, s.media, s.frequencia])).toEqual([[antigo.nome, 8, 90], ["2026/2", 6, 80]]);
  });
});
