// SPEC-038 — rematrícula: janela, choque e motivo (unitário) e matrícula, vaga, cancelamento e janela (integração).
import { afterAll, describe, expect, it } from "vitest";
import { choqueDeHorario, janelaAberta, motivoParaNaoRematricular, validarJanela, vagasRestantes } from "@/domain/rematricula";
import { PUT as janelaApi } from "@/app/api/periodos/[id]/rematricula/route";
import { salvarLinhaDaMatriz } from "@/server/academico/matriz";
import { cancelarRematricula, consultarRematricula, rematricular } from "@/server/academico/rematricula";
import { prisma } from "@/server/dados/prisma";
import { criarPeriodoDeTeste, criarUsuarioDeTeste, removerUsuariosDeTeste } from "../apoio";
import { aprovarEm, disciplinaNoCurso, janelaDeRematricula, salaDeTeste, sessao, turmaNoPeriodo } from "../apoio-n3";
import { API, contexto, entrar, requisicao } from "../apoio-secretaria";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const situacao = { matriculado: false, vagas: null, ocupadas: 0, aprovado: false, requisitosFaltando: [], choque: null };

describe("SPEC-038 — regras puras (sem banco)", () => {
  it("RB-36: a primeira razão que impede a matrícula", () => {
    expect(motivoParaNaoRematricular(situacao)).toBeNull();
    expect(motivoParaNaoRematricular({ ...situacao, aprovado: true })).toMatch(/já foi aprovado/);
    expect(motivoParaNaoRematricular({ ...situacao, requisitosFaltando: ["Algoritmos"] })).toBe("Falta pré-requisito: Algoritmos.");
    expect(motivoParaNaoRematricular({ ...situacao, vagas: 30, ocupadas: 30 })).toBe("Sem vaga.");
    expect(motivoParaNaoRematricular({ ...situacao, choque: "Choque com T1" })).toBe("Choque com T1.");
    expect([vagasRestantes(30, 28), vagasRestantes(30, 31), vagasRestantes(null, 5)]).toEqual([2, 0, null]);
  });

  it("INV-038-02 / AC-038-08: choque de horário e janela válida", () => {
    const seg = { diaSemana: 1, inicio: "19:00", fim: "20:40" };
    expect(choqueDeHorario([seg], [{ diaSemana: 1, inicio: "20:00", fim: "21:00", turma: "T2" }])).toMatch(/Choque com T2/);
    expect(choqueDeHorario([seg], [{ diaSemana: 1, inicio: "20:40", fim: "22:00", turma: "T2" }])).toBeNull();
    expect([janelaAberta("2026-11-10", "2026-11-01", "2026-11-30"), janelaAberta("2026-12-01", "2026-11-01", "2026-11-30"), janelaAberta("2026-11-10", null, null)]).toEqual([true, false, false]);
    expect(validarJanela({ inicio: "2026-11-10", fim: "2026-11-01" })).toMatchObject({ ok: false, erros: { fim: expect.any(String) } });
    expect(validarJanela({ inicio: "", fim: "" })).toEqual({ ok: true, dados: { inicio: null, fim: null } });
  });
});

describe("SPEC-038 — rematrícula (integração)", () => {
  const HOJE = "2026-11-10";
  async function cenario(vagas?: number) {
    const periodo = await criarPeriodoDeTeste();
    await janelaDeRematricula(periodo.id, "2026-11-01", "2026-11-30");
    const coordenador = await criarUsuarioDeTeste("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    const cursoId = coordenador.cursoId;
    const disciplina = await disciplinaNoCurso(cursoId);
    const turma = await turmaNoPeriodo({ periodo: periodo.nome, disciplinaId: disciplina.id, professorId: professor.id, cursoId, vagas });
    const estudante = await criarUsuarioDeTeste("Estudante", { cursoId });
    return { periodo, coordenador, professor, cursoId, disciplina, turma, estudante };
  }
  const daTurma = async (estudanteId: string, periodo: string, turmaId: string) =>
    (await consultarRematricula(sessao(estudanteId, "Estudante"), HOJE))!.periodos.find((p) => p.nome === periodo)!.turmas.find((t) => t.id === turmaId)!;

  it("AC-038-01 / AC-038-06: matricula na janela (vaga −1) e cancela sem registros", async () => {
    const { periodo, turma, estudante } = await cenario(2);
    expect((await daTurma(estudante.id, periodo.nome, turma.id)).restantes).toBe(2);
    expect((await rematricular(sessao(estudante.id, "Estudante"), turma.id, HOJE)).ok).toBe(true);
    expect((await prisma.matricula.findUniqueOrThrow({ where: { estudanteId_turmaId: { estudanteId: estudante.id, turmaId: turma.id } } })).situacao).toBe("Cursando");
    const depois = await daTurma(estudante.id, periodo.nome, turma.id);
    expect([depois.restantes, depois.matriculado]).toEqual([1, true]);
    expect(await prisma.registroAuditoria.count({ where: { acao: "rematricula.feita", turmaId: turma.id } })).toBe(1);

    expect((await cancelarRematricula(sessao(estudante.id, "Estudante"), turma.id, HOJE)).ok).toBe(true);
    expect(await prisma.matricula.count({ where: { estudanteId: estudante.id, turmaId: turma.id } })).toBe(0);
  });

  it("AC-038-02 / INV-038-01: dois pedidos pela última vaga — só um entra", async () => {
    const { cursoId, turma } = await cenario(1);
    const outro = await criarUsuarioDeTeste("Estudante", { cursoId });
    const primeiro = await criarUsuarioDeTeste("Estudante", { cursoId });
    const resultados = await Promise.all([rematricular(sessao(primeiro.id, "Estudante"), turma.id, HOJE), rematricular(sessao(outro.id, "Estudante"), turma.id, HOJE)]);
    expect(resultados.filter((r) => r.ok)).toHaveLength(1);
    expect(resultados.find((r) => !r.ok)).toMatchObject({ falha: { tipo: "conflito", erro: "Sem vaga." } });
    expect(await prisma.matricula.count({ where: { turmaId: turma.id } })).toBe(1);
  });

  it("AC-038-03 / AC-038-07: pré-requisito pendente é 409; disciplina já aprovada aparece marcada", async () => {
    const { periodo, coordenador, professor, cursoId, disciplina, turma, estudante } = await cenario();
    const avancada = await disciplinaNoCurso(cursoId);
    await salvarLinhaDaMatriz(cursoId, avancada.id, { semestre: 2, obrigatoria: true, requisitos: [disciplina.id] }, coordenador.id);
    const turmaAvancada = await turmaNoPeriodo({ periodo: periodo.nome, disciplinaId: avancada.id, professorId: professor.id, cursoId });
    const recusada = await rematricular(sessao(estudante.id, "Estudante"), turmaAvancada.id, HOJE);
    expect(recusada).toMatchObject({ ok: false, falha: { tipo: "conflito", erro: expect.stringMatching(/pré-requisito/) } });

    await aprovarEm(estudante.id, disciplina.id, cursoId);
    expect((await daTurma(estudante.id, periodo.nome, turma.id)).motivo).toMatch(/já foi aprovado/);
    expect((await daTurma(estudante.id, periodo.nome, turmaAvancada.id)).motivo).toBeNull();
  });

  it("AC-038-04: choque com outra turma do estudante é 409", async () => {
    const { periodo, professor, cursoId, turma, estudante } = await cenario();
    const outraTurma = await turmaNoPeriodo({ periodo: periodo.nome, disciplinaId: (await disciplinaNoCurso(cursoId)).id, professorId: (await criarUsuarioDeTeste("Professor")).id, cursoId });
    const [s1, s2] = [await salaDeTeste(), await salaDeTeste()];
    await prisma.horarioTurma.createMany({ data: [{ turmaId: turma.id, diaSemana: 1, inicio: "19:00", fim: "20:40", salaId: s1.id }, { turmaId: outraTurma.id, diaSemana: 1, inicio: "20:00", fim: "21:00", salaId: s2.id }] });
    expect(professor.id).toBeTruthy();
    expect((await rematricular(sessao(estudante.id, "Estudante"), turma.id, HOJE)).ok).toBe(true);
    expect(await rematricular(sessao(estudante.id, "Estudante"), outraTurma.id, HOJE)).toMatchObject({ ok: false, falha: { erro: expect.stringMatching(/^Choque com/) } });
  });

  it("AC-038-05 / AC-038-08 / INV-038-03: fora da janela é 409; janela com fim antes do início é 400; só Ativo e só o próprio curso", async () => {
    const { periodo, turma, estudante } = await cenario();
    const deOutroCurso = await criarUsuarioDeTeste("Estudante");
    expect(await rematricular(sessao(deOutroCurso.id, "Estudante"), turma.id, HOJE)).toMatchObject({ ok: false, falha: { tipo: "nao-encontrado" } });
    expect(await rematricular(sessao(estudante.id, "Estudante"), turma.id, "2026-12-15")).toMatchObject({ ok: false, falha: { tipo: "conflito" } });
    expect(await cancelarRematricula(sessao(estudante.id, "Estudante"), turma.id, "2026-12-15")).toMatchObject({ ok: false, falha: { tipo: "conflito" } });

    const admin = await entrar("Administrador");
    const janela = (corpo: Record<string, unknown>, token = admin.token) => janelaApi(requisicao(`${API}/periodos/${periodo.id}/rematricula`, "PUT", token, corpo), contexto({ id: periodo.id }));
    expect((await janela({ inicio: "2026-11-20", fim: "2026-11-10" })).status).toBe(400);
    expect((await janela({ inicio: "2026-11-05", fim: "2026-11-25" })).status).toBe(200);
    expect((await janela({ inicio: "2026-11-05", fim: "2026-11-25" }, (await entrar("Coordenador")).token)).status).toBe(403);

    await prisma.fichaEstudante.update({ where: { estudanteId: estudante.id }, data: { situacaoCurso: "Trancado" } });
    expect(await rematricular(sessao(estudante.id, "Estudante"), turma.id, HOJE)).toMatchObject({ ok: false, falha: { erro: expect.stringMatching(/Ativo/) } });
  });
});
