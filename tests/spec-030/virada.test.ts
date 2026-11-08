// SPEC-030 — virada de semestre: plano da cópia (unitário) e cópia de turmas e estudantes (integração).
import { afterAll, describe, expect, it } from "vitest";
import { planoDaVirada } from "@/domain/secretaria";
import { GET as previaApi, POST as viradaApi } from "@/app/api/virada/route";
import { prisma } from "@/server/dados/prisma";
import { criarPeriodoDeTeste, removerUsuariosDeTeste } from "../apoio";
import { API, entrar, requisicao, turmaComEstudantes } from "../apoio-secretaria";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const copiar = (corpo: Record<string, unknown>, token: string) => viradaApi(requisicao(`${API}/virada`, "POST", token, corpo));

describe("SPEC-030 — regras puras (sem banco)", () => {
  it("INV-030-03: já existe no destino e professor desativado não são copiadas", () => {
    const origem = [
      { id: "1", nome: "Turma A", disciplinaId: "d", cursoId: "c", professorAtivo: true },
      { id: "2", nome: "Turma B", disciplinaId: "d", cursoId: "c", professorAtivo: true },
      { id: "3", nome: "Turma C", disciplinaId: "d", cursoId: "c", professorAtivo: false },
    ];
    expect(planoDaVirada(origem, [{ nome: "turma b", disciplinaId: "d", cursoId: "c" }]).map((p) => p.acao)).toEqual(["copiar", "ja-existe", "professor-desativado"]);
  });
});

describe("SPEC-030 — virada (integração)", () => {
  it("AC-030-01 / AC-030-02 / AC-030-03: copia a turma, leva só os ativos e não duplica", async () => {
    const admin = await entrar("Administrador");
    const origem = await criarPeriodoDeTeste("Encerrado");
    const destino = await criarPeriodoDeTeste("Aberto");
    const { turma, professor, estudantes } = await turmaComEstudantes(3, origem.nome);
    await prisma.fichaEstudante.update({ where: { estudanteId: estudantes[0].id }, data: { situacaoCurso: "Trancado" } });

    const previa = await (await previaApi(requisicao(`${API}/virada?origem=${origem.nome}&destino=${destino.nome}`, "GET", admin.token))).json();
    expect(previa.turmas.find((t: { id: string }) => t.id === turma.id)).toMatchObject({ acao: "copiar", estudantes: 3, estudantesAtivos: 2 });

    const r = await copiar({ origem: origem.nome, destino: destino.nome, turmas: [{ id: turma.id, levarEstudantes: true }] }, admin.token);
    expect(r.status).toBe(201);
    expect(await r.json()).toMatchObject({ matriculas: 2, puladas: [] });
    const nova = await prisma.turma.findFirstOrThrow({ where: { periodo: destino.nome, disciplinaId: turma.disciplinaId }, include: { matriculas: true } });
    expect([nova.nome, nova.professorId, nova.cursoId, nova.matriculas.length]).toEqual([turma.nome, professor.id, turma.cursoId, 2]);
    expect(await prisma.registroAuditoria.count({ where: { acao: "turma.copiada", turmaId: nova.id } })).toBe(1);

    const repetida = await (await copiar({ origem: origem.nome, destino: destino.nome, turmas: [{ id: turma.id }] }, admin.token)).json();
    expect(repetida.puladas).toHaveLength(1);
    expect(await prisma.turma.count({ where: { periodo: destino.nome, disciplinaId: turma.disciplinaId } })).toBe(1);
  });

  it("AC-030-04: professor desativado não é copiado", async () => {
    const admin = await entrar("Administrador");
    const origem = await criarPeriodoDeTeste("Encerrado");
    const destino = await criarPeriodoDeTeste("Aberto");
    const { turma, professor } = await turmaComEstudantes(1, origem.nome);
    await prisma.usuario.update({ where: { id: professor.id }, data: { ativo: false } });
    const r = await (await copiar({ origem: origem.nome, destino: destino.nome, turmas: [{ id: turma.id }] }, admin.token)).json();
    expect(r.criadas).toHaveLength(0);
    expect(r.puladas[0].motivo).toBe("professor desativado");
  });

  it("AC-030-05 / AC-030-06: destino encerrado é recusado; coordenador não vira o semestre", async () => {
    const admin = await entrar("Administrador");
    const origem = await criarPeriodoDeTeste("Aberto");
    const encerrado = await criarPeriodoDeTeste("Encerrado");
    const { turma, coordenador } = await turmaComEstudantes(0, origem.nome);
    expect((await copiar({ origem: origem.nome, destino: encerrado.nome, turmas: [{ id: turma.id }] }, admin.token)).status).toBe(400);
    expect((await copiar({ origem: origem.nome, destino: encerrado.nome, turmas: [{ id: turma.id }] }, coordenador.token)).status).toBe(403);
  });
});
