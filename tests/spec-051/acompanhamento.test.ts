// SPEC-051 — acompanhamento dos professores: regras de pendência (unitário); página e escopo (integração).
import { afterAll, describe, expect, it } from "vitest";
import { pendenciasDaTurma, type TurmaParaAcompanhar } from "@/domain/acompanhamento";
import { hojeEmBrasilia } from "@/domain/atividades";
import { somarDias } from "@/domain/evasao";
import { acompanhamentoDosProfessores } from "@/server/academico/acompanhamento";
import { prisma } from "@/server/dados/prisma";
import { criarPeriodoDeTeste, removerUsuariosDeTeste } from "../apoio";
import { turmaComEstudantes } from "../apoio-secretaria";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const hoje = "2026-11-14";
const base: TurmaParaAcompanhar = { inicioAulas: "2026-08-11", fimAulas: "2026-12-12", ultimaAula: "2026-11-12", diario: "Aberto", cursando: 30, avaliacoes: [] };

describe("SPEC-051 — regras puras (sem banco)", () => {
  it("RB-46 / AC-051-01: sem aula há mais de 7 dias, chamada atrasada (só entre o início e o fim das aulas)", () => {
    expect(pendenciasDaTurma({ ...base, ultimaAula: "2026-11-05" }, hoje)).toEqual([{ tipo: "Chamada", texto: "Chamada atrasada há 9 dias" }]);
    expect(pendenciasDaTurma({ ...base, ultimaAula: "2026-11-07" }, hoje)).toEqual([]);
    expect(pendenciasDaTurma({ ...base, ultimaAula: "2026-11-05", fimAulas: "2026-11-10", diario: "Fechado" }, hoje)).toEqual([]);
  });

  it("RB-46 / AC-051-02: prova de mais de 7 dias sem a nota de todos; substitutiva não conta", () => {
    const avaliacoes = [{ nome: "Prova 1", data: "2026-11-04", tipo: "Prova", notas: 18 }, { nome: "Substitutiva", data: "2026-11-01", tipo: "Substitutiva", notas: 0 }, { nome: "Lista", data: "2026-11-10", tipo: "Trabalho", notas: 0 }];
    expect(pendenciasDaTurma({ ...base, avaliacoes }, hoje)).toEqual([{ tipo: "Nota", texto: "Prova 1 de 04/11 sem 12 notas" }]);
  });

  it("RB-46 / AC-051-03 / AC-051-04: aulas terminadas com o diário aberto; turma em dia não tem pendência", () => {
    expect(pendenciasDaTurma({ ...base, fimAulas: "2026-11-10" }, hoje)).toEqual([{ tipo: "Diario", texto: "Diário não fechado (aulas terminaram em 10/11/2026)" }]);
    expect(pendenciasDaTurma(base, hoje)).toEqual([]);
  });
});

describe("SPEC-051 — página (integração)", () => {
  it("AC-051-01 / AC-051-04 / INV-051-02: professor com chamada atrasada e professor em dia, só no curso do coordenador", async () => {
    const periodo = await criarPeriodoDeTeste();
    const atrasada = await turmaComEstudantes(1, periodo.nome);
    const atual = hojeEmBrasilia();
    await prisma.eventoCalendario.create({ data: { periodo: periodo.nome, tipo: "InicioAulas", titulo: "Início", inicio: new Date(`${somarDias(atual, -60)}T00:00:00Z`), fim: new Date(`${somarDias(atual, -60)}T00:00:00Z`) } });
    await prisma.aula.create({ data: { turmaId: atrasada.turma.id, data: new Date(`${somarDias(atual, -9)}T00:00:00Z`) } });
    const r = await acompanhamentoDosProfessores(atrasada.coordenador.usuario.id);
    const professor = r.professores.find((p) => p.id === atrasada.professor.id)!;
    expect(professor.turmas[0].pendencias).toEqual([{ tipo: "Chamada", texto: "Chamada atrasada há 9 dias" }]);
    expect(r.chamadas).toBe(1);
    // Outro curso não aparece.
    const outro = await turmaComEstudantes(1, periodo.nome);
    expect((await acompanhamentoDosProfessores(outro.coordenador.usuario.id)).professores.map((p) => p.id)).toEqual([outro.professor.id]);
  });
});
