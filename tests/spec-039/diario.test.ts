// SPEC-039 — diário de classe: pendências e transições (unitário) e fechar, devolver, homologar e reabrir (integração).
import { afterAll, describe, expect, it } from "vitest";
import { hojeEmBrasilia } from "@/domain/atividades";
import { pendenciasParaFechar, proximoEstado } from "@/domain/diario";
import { POST as notaApi } from "@/app/api/notas/route";
import { registrarChamada } from "@/server/academico/chamada";
import { mudarDiario } from "@/server/academico/diario";
import { recalcularIndicador } from "@/server/academico/indicador";
import { prisma } from "@/server/dados/prisma";
import { criarPeriodoDeTeste, entrarComo, removerUsuariosDeTeste, requisicaoJson } from "../apoio";
import { turmaComEstudantes } from "../apoio-secretaria";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const API = "http://localhost/api";

describe("SPEC-039 — regras puras (sem banco)", () => {
  it("RB-37 / INV-039-01: prova e trabalho de todos; exame só de quem está em exame; substitutiva não conta", () => {
    const estudantes = [{ id: "a", nome: "Ana", media: 4, frequencia: 80 }, { id: "b", nome: "Bia", media: 7, frequencia: 90 }];
    expect(pendenciasParaFechar([{ nome: "P1", tipo: "Prova", comNota: new Set(["a"]) }], estudantes)).toEqual(["P1: Bia"]);
    expect(pendenciasParaFechar([{ nome: "Sub", tipo: "Substitutiva", comNota: new Set() }], estudantes)).toEqual([]);
    expect(pendenciasParaFechar([{ nome: "Exame", tipo: "Exame", comNota: new Set() }], estudantes)).toEqual(["Exame: Ana"]);
  });

  it("INV-039-03: transições do diário", () => {
    expect([proximoEstado("Aberto", "fechar"), proximoEstado("Fechado", "homologar"), proximoEstado("Fechado", "devolver"), proximoEstado("Homologado", "reabrir")]).toEqual(["Fechado", "Homologado", "Aberto", "Aberto"]);
    expect([proximoEstado("Fechado", "fechar"), proximoEstado("Aberto", "homologar"), proximoEstado("Homologado", "devolver"), proximoEstado("Aberto", "reabrir")]).toEqual([null, null, null, null]);
  });
});

describe("SPEC-039 — diário (integração)", () => {
  async function cenario(quantos = 2) {
    const periodo = await criarPeriodoDeTeste();
    const base = await turmaComEstudantes(quantos, periodo.nome);
    const token = await entrarComo(base.professor.email, base.professor.senha);
    const prova = await prisma.avaliacao.create({ data: { turmaId: base.turma.id, nome: "P1", peso: 1, data: new Date(), tipo: "Prova" } });
    const doProfessor = { usuarioId: base.professor.id, perfil: "Professor" };
    const daCoordenacao = { usuarioId: base.coordenador.usuario.id, perfil: "Coordenador" };
    return { ...base, token, prova, doProfessor, daCoordenacao };
  }
  const lancar = (token: string, turmaId: string, avaliacaoId: string, estudanteId: string, valor: number) => notaApi(requisicaoJson(`${API}/notas`, { turmaId, avaliacaoId, estudanteId, valor }, token));

  it("AC-039-01 / AC-039-02 / AC-039-06: conteúdo na chamada; só fecha completo; fechado recusa nota e chamada", async () => {
    const { turma, estudantes, token, prova, professor, doProfessor } = await cenario();
    const hoje = hojeEmBrasilia();
    const chamada = { turmaId: turma.id, data: hoje, conteudo: "Escalonamento: FIFO e Round Robin", aulas: [estudantes.map((e) => ({ estudanteId: e.id, presente: true }))] };
    expect((await registrarChamada(chamada, professor.id, hoje)).ok).toBe(true);
    expect((await prisma.aula.findFirstOrThrow({ where: { turmaId: turma.id } })).conteudo).toBe("Escalonamento: FIFO e Round Robin");

    await lancar(token, turma.id, prova.id, estudantes[0].id, 7);
    const incompleto = await mudarDiario(turma.id, { acao: "fechar" }, doProfessor);
    expect(incompleto).toMatchObject({ ok: false, falha: { tipo: "conflito", erro: expect.stringContaining("P1") } });

    await lancar(token, turma.id, prova.id, estudantes[1].id, 8);
    expect(await mudarDiario(turma.id, { acao: "fechar" }, doProfessor)).toMatchObject({ ok: true, valor: { diario: "Fechado" } });
    expect((await lancar(token, turma.id, prova.id, estudantes[1].id, 9)).status).toBe(409);
    expect(await registrarChamada(chamada, professor.id, hoje)).toMatchObject({ ok: false, falha: { tipo: "conflito" } });
  });

  it("AC-039-03 / AC-039-04 / AC-039-05: devolve com observação (professor avisado), homologa e reabre", async () => {
    const { turma, estudantes, token, prova, professor, doProfessor, daCoordenacao } = await cenario(1);
    await lancar(token, turma.id, prova.id, estudantes[0].id, 7);
    await mudarDiario(turma.id, { acao: "fechar" }, doProfessor);
    expect(await mudarDiario(turma.id, { acao: "devolver" }, daCoordenacao)).toMatchObject({ ok: false, falha: { tipo: "invalido" } });
    expect(await mudarDiario(turma.id, { acao: "devolver", observacao: "Confira a P1" }, daCoordenacao)).toMatchObject({ ok: true, valor: { diario: "Aberto" } });
    expect(await prisma.notificacao.count({ where: { usuarioId: professor.id, tipo: "Diario" } })).toBe(1);

    await mudarDiario(turma.id, { acao: "fechar" }, doProfessor);
    // O professor não homologa; a coordenação não fecha.
    expect((await mudarDiario(turma.id, { acao: "homologar" }, doProfessor)).ok).toBe(false);
    expect((await mudarDiario(turma.id, { acao: "fechar" }, daCoordenacao)).ok).toBe(false);
    expect(await mudarDiario(turma.id, { acao: "homologar" }, daCoordenacao)).toMatchObject({ ok: true, valor: { diario: "Homologado" } });
    expect(await prisma.registroAuditoria.count({ where: { acao: "diario.homologado", turmaId: turma.id } })).toBe(1);
    expect((await lancar(token, turma.id, prova.id, estudantes[0].id, 9)).status).toBe(409);

    expect(await mudarDiario(turma.id, { acao: "reabrir" }, daCoordenacao)).toMatchObject({ ok: true, valor: { diario: "Aberto" } });
    const outra = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "P2", peso: 1, data: new Date(), tipo: "Prova" } });
    expect((await lancar(token, turma.id, outra.id, estudantes[0].id, 9)).status).toBe(201);
  });

  it("AC-039-07: estudante em exame sem nota de exame impede o fechamento; coordenador de outro curso não mexe", async () => {
    const { turma, estudantes, token, prova, doProfessor } = await cenario(1);
    const [e] = estudantes;
    await lancar(token, turma.id, prova.id, e.id, 4);
    await prisma.frequencia.create({ data: { estudanteId: e.id, turmaId: turma.id, percentual: 80 } });
    await recalcularIndicador(e.id, turma.id);
    await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "Exame final", peso: 1, data: new Date(), tipo: "Exame" } });
    expect(await mudarDiario(turma.id, { acao: "fechar" }, doProfessor)).toMatchObject({ ok: false, falha: { tipo: "conflito", erro: expect.stringContaining("Exame final") } });

    const outro = await turmaComEstudantes(0);
    expect(await mudarDiario(turma.id, { acao: "reabrir" }, { usuarioId: outro.coordenador.usuario.id, perfil: "Coordenador" })).toMatchObject({ ok: false, falha: { tipo: "nao-encontrado" } });
  });
});
