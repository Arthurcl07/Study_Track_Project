// SPEC-012 — plano de recuperação visível ao estudante (integração, só leitura).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { GET as painelApi } from "@/app/api/painel/route";
import { PATCH as marcarItemApi } from "@/app/api/planos/itens/[id]/route";
import { prisma } from "@/server/dados/prisma";
import {
  PREFIXO_DISCIPLINA_TESTE, criarUsuarioDeTeste, entrarComo, parametros, removerUsuariosDeTeste, requisicaoComSessao, requisicaoJson,
} from "../apoio";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

// Turma com dois estudantes; o primeiro tem um plano ativo (4 itens, 1 concluído) e um encerrado.
async function cenario() {
  const professor = await criarUsuarioDeTeste("Professor");
  const [a, b] = [await criarUsuarioDeTeste("Estudante"), await criarUsuarioDeTeste("Estudante")];
  const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60 } });
  const turma = await prisma.turma.create({ data: { nome: "T", periodo: "2026/2", disciplinaId: disciplina.id, professorId: professor.id } });
  await prisma.matricula.createMany({ data: [a, b].map((e) => ({ estudanteId: e.id, turmaId: turma.id })) });
  const ativo = await prisma.planoRecuperacao.create({
    data: {
      estudanteId: a.id, turmaId: turma.id, professorId: professor.id,
      itens: { create: ["Lista 1", "Plantão", "Resumo", "Simulado"].map((descricao, ordem) => ({ descricao, ordem, concluido: ordem === 0, concluidoEm: ordem === 0 ? new Date() : null })) },
    },
    include: { itens: { orderBy: { ordem: "asc" } } },
  });
  await prisma.planoRecuperacao.create({
    data: { estudanteId: a.id, turmaId: turma.id, professorId: professor.id, status: "Encerrado", encerradoEm: new Date(), criadoEm: new Date("2026-09-01"), itens: { create: [{ descricao: "Antigo", ordem: 0, concluido: true }] } },
  });
  return { a, b, ativo, disciplina };
}

async function painelDe(usuario: { email: string; senha: string }) {
  const resposta = await painelApi(requisicaoComSessao("http://localhost/api/painel", await entrarComo(usuario.email, usuario.senha)));
  return (await resposta.json()).planos;
}

describe("SPEC-012 — plano visível ao estudante", () => {
  it("AC-012-01 / INV-012-02: estudante vê os itens do plano ativo e o progresso de 25% (mesma regra do professor)", async () => {
    const { a, disciplina } = await cenario();
    const planos = await painelDe(a);
    const ativo = planos.find((p: { status: string }) => p.status === "Ativo");

    expect(ativo).toMatchObject({ disciplina: disciplina.nome, progresso: { concluidos: 1, total: 4, percentual: 25 } });
    expect(ativo.itens.map((i: { descricao: string; concluido: boolean }) => [i.descricao, i.concluido])).toEqual([
      ["Lista 1", true], ["Plantão", false], ["Resumo", false], ["Simulado", false],
    ]);
  });

  it("AC-012-02: plano encerrado aparece no histórico, com a data de encerramento", async () => {
    const { a } = await cenario();
    const encerrado = (await painelDe(a)).find((p: { status: string }) => p.status === "Encerrado");
    expect(encerrado).toMatchObject({ encerradoEm: expect.any(String), progresso: { percentual: 100 } });
  });

  it("AC-012-03 / INV-012-01: outro estudante da turma não vê o plano do colega", async () => {
    const { b, ativo } = await cenario();
    const planos = await painelDe(b);
    expect(planos).toEqual([]);
    expect(JSON.stringify(planos)).not.toContain(ativo.id);
  });

  it("AC-012-04 / INV-012-03: estudante não marca item do próprio plano", async () => {
    const { a, ativo } = await cenario();
    const token = await entrarComo(a.email, a.senha);
    const item = ativo.itens[1];

    const resposta = await marcarItemApi(requisicaoJson(`http://localhost/api/planos/itens/${item.id}`, { concluido: true }, token, "PATCH"), parametros(item.id));

    expect(resposta.status).toBe(403);
    expect((await prisma.itemPlano.findUniqueOrThrow({ where: { id: item.id } })).concluido).toBe(false);
  });
});
