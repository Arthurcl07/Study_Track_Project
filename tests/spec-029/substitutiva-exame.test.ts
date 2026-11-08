// SPEC-029 — prova substitutiva e exame final: média, elegibilidade e resultado (unitário) e cadastro, lançamento,
// simulador e boletim (integração).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { resultadoDaTurma } from "@/domain/documentos";
import { validarAvaliacao } from "@/domain/registro-notas";
import { calcularMediaDaTurma, elegivelAoExame, notaFinalComExame } from "@/domain/situacao-academica";
import { POST as notaApi } from "@/app/api/notas/route";
import { POST as avaliacaoApi } from "@/app/api/turmas/[id]/avaliacoes/route";
import { consultarBoletim } from "@/server/academico/documentos";
import { recalcularIndicador } from "@/server/academico/indicador";
import { consultarPainel } from "@/server/academico/painel";
import type { Sessao } from "@/server/auth/token";
import { prisma } from "@/server/dados/prisma";
import { PREFIXO_DISCIPLINA_TESTE, criarPeriodoDeTeste, criarUsuarioDeTeste, cursoPadraoDeTeste, entrarComo, parametros, removerUsuariosDeTeste, requisicaoJson } from "../apoio";

const API = "http://localhost/api";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const p = (valor: number | null, peso = 2) => ({ tipo: "Prova" as const, peso, valor });
const trabalho = (valor: number | null, peso = 1) => ({ tipo: "Trabalho" as const, peso, valor });
const sub = (valor: number | null) => ({ tipo: "Substitutiva" as const, peso: 1, valor });

describe("SPEC-029 — regras puras (sem banco)", () => {
  it("AC-029-01 / RB-28 / INV-029-01: a substitutiva troca a menor prova quando aumenta a média", () => {
    expect(calcularMediaDaTurma([p(3), p(7), trabalho(8)])).toBeCloseTo(5.6, 5);
    expect(calcularMediaDaTurma([p(3), p(7), trabalho(8), sub(9)])).toBeCloseTo(8, 5);
  });

  it("AC-029-02: prova sem nota conta como zero na troca", () => {
    // P2 sem nota: média base (P1 e trabalho) = (6 + 8) / 3; com a substitutiva no lugar da P2 (zero) = (6 + 18 + 8) / 5.
    expect(calcularMediaDaTurma([p(3), p(null), trabalho(8), sub(9)])).toBeCloseTo(6.4, 5);
  });

  it("AC-029-03: substitutiva menor que todas não muda a média; sem prova, é ignorada", () => {
    expect(calcularMediaDaTurma([p(7), p(8), sub(2)])).toBeCloseTo(7.5, 5);
    expect(calcularMediaDaTurma([trabalho(6), sub(10)])).toBe(6);
    expect(calcularMediaDaTurma([{ tipo: "Exame", peso: 1, valor: 10 }, p(4)])).toBe(4);
  });

  it("RB-29 / INV-029-03: elegibilidade e nota final", () => {
    expect([elegivelAoExame(4, 80), elegivelAoExame(6, 80), elegivelAoExame(4, 70), elegivelAoExame(null, 90)]).toEqual([true, false, false, false]);
    expect(notaFinalComExame(4, 7)).toBe(5.5);
  });

  it("RB-24: resultado com exame e com matrícula trancada", () => {
    expect(resultadoDaTurma({ encerrado: true, media: 4, frequencia: 80, exame: 7 })).toBe("AprovadoExame");
    expect(resultadoDaTurma({ encerrado: true, media: 4, frequencia: 80, exame: 5 })).toBe("ReprovadoNota");
    expect(resultadoDaTurma({ encerrado: true, media: 7, frequencia: 80, exame: null })).toBe("Aprovado");
    expect(resultadoDaTurma({ encerrado: false, media: 4, frequencia: 80, exame: 9, matricula: "Trancada" })).toBe("Trancada");
  });

  it("Tipo da avaliação: substitutiva e exame não pedem peso; tipo inválido é recusado", () => {
    const exame = validarAvaliacao({ nome: "Exame", tipo: "Exame", data: "2026-12-10" });
    expect(exame.ok && exame.dados).toMatchObject({ tipo: "Exame", peso: 1 });
    expect(validarAvaliacao({ nome: "P", peso: 2, data: "2026-12-10" }).ok && "ok").toBe("ok");
    expect(validarAvaliacao({ nome: "X", tipo: "Recuperação", data: "2026-12-10" }).ok).toBe(false);
  });
});

describe("SPEC-029 — cadastro, lançamento e documentos (integração)", () => {
  async function cenario(periodo = "2026/2") {
    const professor = await criarUsuarioDeTeste("Professor");
    const estudante = await criarUsuarioDeTeste("Estudante");
    const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60 } });
    const turma = await prisma.turma.create({ data: { nome: "T", periodo, disciplinaId: disciplina.id, professorId: professor.id, cursoId: await cursoPadraoDeTeste() } });
    await prisma.matricula.create({ data: { estudanteId: estudante.id, turmaId: turma.id } });
    const token = await entrarComo(professor.email, professor.senha);
    return { professor, estudante, turma, token };
  }
  const cadastrar = (turmaId: string, corpo: Record<string, unknown>, token: string) =>
    avaliacaoApi(requisicaoJson(`${API}/turmas/${turmaId}/avaliacoes`, { data: "2026-11-20", ...corpo }, token), parametros(turmaId));
  const lancar = (turmaId: string, avaliacaoId: string, estudanteId: string, valor: number, token: string) =>
    notaApi(requisicaoJson(`${API}/notas`, { turmaId, avaliacaoId, estudanteId, valor }, token));

  it("AC-029-01 / AC-029-06: substitutiva cadastrada uma vez; a nota dela recalcula a média", async () => {
    const { estudante, turma, token } = await cenario();
    const p1 = await (await cadastrar(turma.id, { nome: "P1", tipo: "Prova", peso: 2 }, token)).json();
    const p2 = await (await cadastrar(turma.id, { nome: "P2", tipo: "Prova", peso: 2 }, token)).json();
    const t1 = await (await cadastrar(turma.id, { nome: "Trabalho", tipo: "Trabalho", peso: 1 }, token)).json();
    for (const [a, v] of [[p1, 3], [p2, 7], [t1, 8]] as const) await lancar(turma.id, a.id, estudante.id, v, token);
    const s = await cadastrar(turma.id, { nome: "Substitutiva", tipo: "Substitutiva" }, token);
    expect(s.status).toBe(201);
    expect((await cadastrar(turma.id, { nome: "Outra", tipo: "Substitutiva" }, token)).status).toBe(409);
    const r = await lancar(turma.id, (await s.json()).id, estudante.id, 9, token);
    expect((await r.json()).indicador.media).toBeCloseTo(8, 5);
  });

  it("AC-029-04 / AC-029-05 / AC-029-07: exame só para quem está em exame; a situação continua a da média", async () => {
    const { estudante, turma, token } = await cenario();
    const p1 = await (await cadastrar(turma.id, { nome: "P1", tipo: "Prova", peso: 1 }, token)).json();
    await lancar(turma.id, p1.id, estudante.id, 4, token);
    await prisma.frequencia.create({ data: { estudanteId: estudante.id, turmaId: turma.id, percentual: 80 } });
    await recalcularIndicador(estudante.id, turma.id);
    const exame = await (await cadastrar(turma.id, { nome: "Exame final", tipo: "Exame" }, token)).json();
    const r = await lancar(turma.id, exame.id, estudante.id, 7, token);
    expect(r.status).toBe(201);
    const indicador = await prisma.indicadorAcademico.findFirstOrThrow({ where: { estudanteId: estudante.id, turmaId: turma.id } });
    expect([indicador.media, indicador.situacao]).toEqual([4, "Risco"]);

    // Outro estudante com média 6,5 não faz exame.
    const bom = await criarUsuarioDeTeste("Estudante");
    await prisma.matricula.create({ data: { estudanteId: bom.id, turmaId: turma.id } });
    await lancar(turma.id, p1.id, bom.id, 6.5, token);
    const recusada = await lancar(turma.id, exame.id, bom.id, 8, token);
    expect(recusada.status).toBe(400);
    expect((await recusada.json()).campos.valor).toMatch(/não está em exame/);
  });

  it("AC-029-04 / RB-24: no boletim do período encerrado, nota final e Aprovado no exame", async () => {
    const encerrado = await criarPeriodoDeTeste("Encerrado");
    const { estudante, turma } = await cenario(encerrado.nome);
    const p1 = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "P1", peso: 1, data: new Date(), tipo: "Prova" } });
    const exame = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "Exame", peso: 1, data: new Date(), tipo: "Exame" } });
    await prisma.nota.createMany({ data: [{ avaliacaoId: p1.id, estudanteId: estudante.id, valor: 4 }, { avaliacaoId: exame.id, estudanteId: estudante.id, valor: 7 }] });
    await prisma.frequencia.create({ data: { estudanteId: estudante.id, turmaId: turma.id, percentual: 85 } });
    await recalcularIndicador(estudante.id, turma.id);
    const boletim = await consultarBoletim({ usuarioId: estudante.id, nome: "E", perfil: "Estudante" } as Sessao, { periodo: encerrado.nome });
    const linha = boletim!.turmas.find((t) => t.id === turma.id)!;
    expect([linha.exame, linha.notaFinal, linha.resultado]).toEqual([7, 5.5, "AprovadoExame"]);
  });

  it("AC-029-08 / RB-25: o simulador ignora substitutiva e exame", async () => {
    const { estudante, turma, token } = await cenario();
    const p1 = await (await cadastrar(turma.id, { nome: "P1", tipo: "Prova", peso: 1 }, token)).json();
    await cadastrar(turma.id, { nome: "P2", tipo: "Prova", peso: 1 }, token);
    await cadastrar(turma.id, { nome: "Substitutiva", tipo: "Substitutiva" }, token);
    await lancar(turma.id, p1.id, estudante.id, 5, token);
    const painel = await consultarPainel({ usuarioId: estudante.id, nome: "E", perfil: "Estudante" } as Sessao);
    const t = painel.turmas.find((x) => x.id === turma.id)!;
    expect(t.avaliacoes.map((a) => a.nome)).toEqual(["P1", "P2"]);
    expect(t.necessaria.normal).toEqual({ tipo: "nota", valor: 7 });
  });
});
