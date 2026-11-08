// SPEC-020 — boletim e histórico escolar: regras de domínio (unitário) e consultas + banco (integração).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { podeAcessar, RECURSOS } from "@/domain/autorizacao";
import { periodoPadrao, resultadoDaTurma, resumoDoHistorico } from "@/domain/documentos";
import { consultarBoletim, consultarHistorico } from "@/server/academico/documentos";
import { recalcularIndicador } from "@/server/academico/indicador";
import type { Sessao } from "@/server/auth/token";
import { prisma } from "@/server/dados/prisma";
import { PREFIXO_DISCIPLINA_TESTE, criarPeriodoDeTeste, criarUsuarioDeTeste, removerUsuariosDeTeste } from "../apoio";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const sessao = (u: { id: string; nome: string }, perfil: Sessao["perfil"]): Sessao => ({ usuarioId: u.id, nome: u.nome, perfil });

// Turma do curso do coordenador no período, com a média (uma avaliação) e a frequência do estudante.
async function turmaCom(coordenador: { cursoId: string }, estudanteId: string, periodo: string, media: number | null, frequencia: number | null, cargaHoraria = 60) {
  const professor = await criarUsuarioDeTeste("Professor");
  const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria, cursos: { create: { cursoId: coordenador.cursoId } } } });
  const turma = await prisma.turma.create({ data: { nome: "T", periodo, disciplinaId: disciplina.id, professorId: professor.id, cursoId: coordenador.cursoId } });
  await prisma.matricula.create({ data: { estudanteId, turmaId: turma.id } });
  if (media !== null) {
    const avaliacao = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "P1", peso: 1, data: new Date() } });
    await prisma.nota.create({ data: { avaliacaoId: avaliacao.id, estudanteId, valor: media } });
  }
  if (frequencia !== null) await prisma.frequencia.create({ data: { estudanteId, turmaId: turma.id, percentual: frequencia } });
  await recalcularIndicador(estudanteId, turma.id);
  return turma;
}

async function cenario() {
  const coordenador = await criarUsuarioDeTeste("Coordenador");
  const estudante = await criarUsuarioDeTeste("Estudante", { cursoId: coordenador.cursoId });
  return { coordenador, estudante };
}

describe("SPEC-020 — regras de domínio (sem banco)", () => {
  it("RB-24 / AC-020-01 / AC-020-02 / INV-020-02: resultado da turma de período encerrado", () => {
    const fechado = (media: number | null, frequencia: number | null) => resultadoDaTurma({ encerrado: true, media, frequencia });
    expect(fechado(7, 80)).toBe("Aprovado");
    expect(fechado(6, 75)).toBe("Aprovado");
    expect(fechado(5.5, 90)).toBe("ReprovadoNota");
    expect(fechado(7, 70)).toBe("ReprovadoFrequencia");
    expect(fechado(4, 60)).toBe("ReprovadoNotaFrequencia");
  });

  it("AC-020-03 / AC-020-04: período aberto é Em curso; encerrado sem média ou frequência é Sem registro", () => {
    expect(resultadoDaTurma({ encerrado: false, media: 3, frequencia: 50 })).toBe("EmCurso");
    expect(resultadoDaTurma({ encerrado: true, media: null, frequencia: 90 })).toBe("SemRegistro");
    expect(resultadoDaTurma({ encerrado: true, media: 8, frequencia: null })).toBe("SemRegistro");
  });

  it("INV-020-04: carga horária aprovada soma só as aprovadas", () => {
    expect(resumoDoHistorico([{ cargaHoraria: 80, resultado: "Aprovado" }, { cargaHoraria: 60, resultado: "Aprovado" }, { cargaHoraria: 60, resultado: "ReprovadoNota" }, { cargaHoraria: 40, resultado: "EmCurso" }])).toEqual({ disciplinasAprovadas: 2, cargaHorariaAprovada: 140 });
  });

  it("boletim padrão: período aberto mais recente; sem aberto, o mais recente", () => {
    expect(periodoPadrao([{ nome: "2026/1", status: "Encerrado" }, { nome: "2026/2", status: "Aberto" }, { nome: "2027/1", status: "Encerrado" }])).toBe("2026/2");
    expect(periodoPadrao([{ nome: "2026/1", status: "Encerrado" }, { nome: "2025/2", status: "Encerrado" }])).toBe("2026/1");
    expect(periodoPadrao([])).toBeNull();
  });

  // SPEC-035 (OPEN-057, 2026-11-06): a secretaria (Administrador) passou a emitir documentos (AC-035-01).
  it("INV-020-05 / AC-020-08 / AC-035-01: professor não emite documentos; a secretaria emite", () => {
    expect(podeAcessar("Estudante", RECURSOS.documentos)).toBe(true);
    expect(podeAcessar("Coordenador", RECURSOS.documentos)).toBe(true);
    expect(podeAcessar("Professor", RECURSOS.documentos)).toBe(false);
    expect(podeAcessar("Administrador", RECURSOS.documentos)).toBe(true);
  });
});

describe("SPEC-020 — boletim e histórico (integração)", () => {
  it("AC-020-05 / INV-020-01: histórico com dois períodos, resultados e carga horária aprovada", async () => {
    const { coordenador, estudante } = await cenario();
    const antigo = await criarPeriodoDeTeste("Encerrado");
    await turmaCom(coordenador, estudante.id, antigo.nome, 7, 80, 80);
    await turmaCom(coordenador, estudante.id, antigo.nome, 4, 90, 60);
    await turmaCom(coordenador, estudante.id, "2026/2", 8, 100, 60);

    const historico = (await consultarHistorico(sessao(estudante, "Estudante"), {}))!;
    expect(historico.periodos.map((p) => p.nome)).toEqual([antigo.nome, "2026/2"]);
    expect(historico.periodos[0].linhas.map((l) => l.resultado).sort()).toEqual(["Aprovado", "ReprovadoNota"]);
    expect(historico.periodos[1].linhas[0].resultado).toBe("EmCurso");
    expect(historico.resumo).toEqual({ disciplinasAprovadas: 1, cargaHorariaAprovada: 80 });
  });

  it("AC-020-03 / INV-020-03: boletim do período aberto (padrão) com média, frequência e situação do indicador", async () => {
    const { coordenador, estudante } = await cenario();
    const antigo = await criarPeriodoDeTeste("Encerrado");
    await turmaCom(coordenador, estudante.id, antigo.nome, 9, 90);
    const atual = await turmaCom(coordenador, estudante.id, "2026/2", 5.5, 80);

    const boletim = (await consultarBoletim(sessao(estudante, "Estudante"), {}))!;
    expect(boletim.periodo?.nome).toBe("2026/2");
    expect(boletim.turmas).toHaveLength(1);
    expect(boletim.turmas[0]).toMatchObject({ id: atual.id, media: 5.5, frequencia: 80, situacao: "Atencao", resultado: "EmCurso" });
    const doAntigo = (await consultarBoletim(sessao(estudante, "Estudante"), { periodo: antigo.nome }))!;
    expect(doAntigo.turmas[0].resultado).toBe("Aprovado");
  });

  it("AC-020-06 / RB-02: estudante que pede o documento de outro recebe o próprio", async () => {
    const { coordenador, estudante } = await cenario();
    const outro = await criarUsuarioDeTeste("Estudante", { cursoId: coordenador.cursoId });
    await turmaCom(coordenador, outro.id, "2026/2", 3, 50);
    const historico = (await consultarHistorico(sessao(estudante, "Estudante"), { estudante: outro.id }))!;
    expect(historico.estudante.id).toBe(estudante.id);
    expect(historico.periodos).toEqual([]);
  });

  it("AC-020-07 / RB-04: coordenador emite para estudante do próprio curso, não de outro curso", async () => {
    const { coordenador, estudante } = await cenario();
    await turmaCom(coordenador, estudante.id, "2026/2", 7, 90);
    const outroCoordenador = await criarUsuarioDeTeste("Coordenador");
    expect((await consultarHistorico(sessao(coordenador, "Coordenador"), { estudante: estudante.id }))?.estudante.id).toBe(estudante.id);
    expect(await consultarHistorico(sessao(outroCoordenador, "Coordenador"), { estudante: estudante.id })).toBeNull();
    expect(await consultarBoletim(sessao(outroCoordenador, "Coordenador"), { estudante: estudante.id })).toBeNull();
  });

  it("INV-020-05: professor não obtém documento nem pelo caso de uso", async () => {
    const { estudante } = await cenario();
    const professor = await criarUsuarioDeTeste("Professor");
    expect(await consultarHistorico(sessao(professor, "Professor"), { estudante: estudante.id })).toBeNull();
  });
});
