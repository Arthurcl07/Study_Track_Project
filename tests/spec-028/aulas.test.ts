// SPEC-028 — várias aulas no mesmo dia: validação e frequência (unitário) e chamada com 1 a 4 aulas (integração).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { hojeEmBrasilia } from "@/domain/atividades";
import { MENSAGEM_QUANTIDADE_AULAS, frequenciaPelaChamada, presencasEfetivas, validarChamada } from "@/domain/frequencia";
import { POST as chamadaApi } from "@/app/api/aulas/route";
import { prisma } from "@/server/dados/prisma";
import { PREFIXO_DISCIPLINA_TESTE, criarUsuarioDeTeste, cursoPadraoDeTeste, entrarComo, removerUsuariosDeTeste, requisicaoJson, periodoAbertoDeTeste } from "../apoio";

const API = "http://localhost/api";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

async function cenario() {
  const professor = await criarUsuarioDeTeste("Professor");
  const estudantes = [await criarUsuarioDeTeste("Estudante"), await criarUsuarioDeTeste("Estudante"), await criarUsuarioDeTeste("Estudante")];
  const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60 } });
  const turma = await prisma.turma.create({ data: { nome: "T", periodo: await periodoAbertoDeTeste(), disciplinaId: disciplina.id, professorId: professor.id, cursoId: await cursoPadraoDeTeste() } });
  await prisma.matricula.createMany({ data: estudantes.map((e) => ({ estudanteId: e.id, turmaId: turma.id })) });
  return { estudantes, turma, token: await entrarComo(professor.email, professor.senha) };
}

const lista = (ids: string[], faltas: string[] = []) => ids.map((estudanteId) => ({ estudanteId, presente: !faltas.includes(estudanteId) }));
const frequencia = async (estudanteId: string, turmaId: string) => (await prisma.frequencia.findFirst({ where: { estudanteId, turmaId } }))?.percentual ?? null;

describe("SPEC-028 — regras puras (sem banco)", () => {
  it("INV-028-01: de 1 a 4 aulas; cada aula com todos os matriculados", () => {
    const hoje = "2026-11-06";
    const duas = validarChamada({ data: hoje, aulas: [lista(["a", "b"]), lista(["a", "b"], ["b"])] }, ["a", "b"], hoje);
    expect(duas.ok && duas.dados.aulas.length).toBe(2);
    const cinco = validarChamada({ data: hoje, aulas: Array.from({ length: 5 }, () => lista(["a"])) }, ["a"], hoje);
    expect(cinco).toEqual({ ok: false, erros: { aulas: MENSAGEM_QUANTIDADE_AULAS } });
    expect(validarChamada({ data: hoje, aulas: [] }, ["a"], hoje).ok).toBe(false);
    expect(validarChamada({ data: hoje, aulas: [lista(["a"]), lista(["x"])] }, ["a"], hoje).ok).toBe(false);
  });

  it("INV-028-02 / RB-21: cada aula conta na frequência; falta abonada conta como presença", () => {
    expect(frequenciaPelaChamada([true, false])).toBe(50);
    const registros = [{ data: "2026-11-03", presente: false }, { data: "2026-11-04", presente: false }, { data: "2026-11-05", presente: true }];
    expect(presencasEfetivas(registros, [{ inicio: "2026-11-04", fim: "2026-11-06" }])).toEqual([false, true, true]);
  });
});

describe("SPEC-028 — chamada com várias aulas (integração)", () => {
  it("AC-028-01: 2 aulas na data; falta só na 2ª dá 50% naquela data", async () => {
    const { estudantes: [a, b, c], turma, token } = await cenario();
    const ids = [a.id, b.id, c.id];
    const r = await chamadaApi(requisicaoJson(`${API}/aulas`, { turmaId: turma.id, data: hojeEmBrasilia(), aulas: [lista(ids), lista(ids, [a.id])] }, token));
    expect(r.status).toBe(200);
    expect((await r.json()).quantidade).toBe(2);
    expect(await prisma.aula.findMany({ where: { turmaId: turma.id }, select: { numero: true }, orderBy: { numero: "asc" } })).toEqual([{ numero: 1 }, { numero: 2 }]);
    expect([await frequencia(a.id, turma.id), await frequencia(b.id, turma.id)]).toEqual([50, 100]);
  });

  it("AC-028-02 / AC-028-03 / AC-028-04: acrescentar até 4 e corrigir; a 5ª é recusada", async () => {
    const { estudantes: [a, b, c], turma, token } = await cenario();
    const ids = [a.id, b.id, c.id];
    const hoje = hojeEmBrasilia();
    const enviar = (aulas: ReturnType<typeof lista>[]) => chamadaApi(requisicaoJson(`${API}/aulas`, { turmaId: turma.id, data: hoje, aulas }, token));
    await enviar([lista(ids), lista(ids)]);
    // Correção das 2 primeiras (a falta na 1ª) e mais 2 aulas.
    const r = await enviar([lista(ids, [a.id]), lista(ids), lista(ids), lista(ids)]);
    expect(r.status).toBe(200);
    expect(await prisma.aula.count({ where: { turmaId: turma.id } })).toBe(4);
    expect(await frequencia(a.id, turma.id)).toBe(75);
    expect((await enviar(Array.from({ length: 5 }, () => lista(ids)))).status).toBe(400);
    expect(await prisma.aula.count({ where: { turmaId: turma.id } })).toBe(4);
  });

  it("AC-028-05: o formato antigo (uma lista) continua sendo a 1ª aula da data", async () => {
    const { estudantes: [a, b, c], turma, token } = await cenario();
    const r = await chamadaApi(requisicaoJson(`${API}/aulas`, { turmaId: turma.id, data: hojeEmBrasilia(), presencas: lista([a.id, b.id, c.id], [c.id]) }, token));
    expect(r.status).toBe(200);
    expect((await prisma.aula.findFirstOrThrow({ where: { turmaId: turma.id } })).numero).toBe(1);
    expect(await frequencia(c.id, turma.id)).toBe(0);
  });
});
