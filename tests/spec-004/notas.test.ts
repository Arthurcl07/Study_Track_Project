// SPEC-004 — registro de avaliações, notas e médias: domínio (unitário, sem banco) e rotas (integração).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it, vi } from "vitest";
import { MENSAGEM_NOTA_INVALIDA, validarAvaliacao, validarValorNota } from "@/domain/registro-notas";
import { calcularMedia, classificarSituacao } from "@/domain/situacao-academica";
import { POST as registrarNotaApi } from "@/app/api/notas/route";
import { PATCH as alterarNotaApi } from "@/app/api/notas/[id]/route";
import { POST as cadastrarAvaliacaoApi } from "@/app/api/turmas/[id]/avaliacoes/route";
import { prisma } from "@/server/dados/prisma";
import {
  PREFIXO_DISCIPLINA_TESTE,
  criarUsuarioDeTeste,
  entrarComo,
  parametros,
  removerUsuariosDeTeste,
  requisicaoJson,
} from "../apoio";

// INV-004-03: permite simular uma falha no recálculo para provar que nota e indicador estão na mesma transação.
const falhaNoRecalculo = vi.hoisted(() => ({ ativa: false }));
vi.mock("@/server/academico/indicador", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/server/academico/indicador")>();
  return {
    ...original,
    recalcularIndicador: async (...args: Parameters<typeof original.recalcularIndicador>) => {
      if (falhaNoRecalculo.ativa) throw new Error("Falha simulada no recálculo do indicador.");
      return original.recalcularIndicador(...args);
    },
  };
});

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const URL_NOTAS = "http://localhost/api/notas";

// Turma com professor responsável, um estudante matriculado e uma avaliação de peso 1.
async function cenario() {
  const coordenador = await criarUsuarioDeTeste("Coordenador");
  const professor = await criarUsuarioDeTeste("Professor");
  const estudante = await criarUsuarioDeTeste("Estudante");
  const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60 } });
  const turma = await prisma.turma.create({
    data: { nome: "T", periodo: "2026/2", disciplinaId: disciplina.id, professorId: professor.id, coordenadorId: coordenador.id },
  });
  await prisma.matricula.create({ data: { estudanteId: estudante.id, turmaId: turma.id } });
  const avaliacao = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "P1", peso: 1, data: new Date() } });
  const tokenProfessor = await entrarComo(professor.email, professor.senha);
  return { coordenador, professor, estudante, turma, avaliacao, tokenProfessor };
}

type Cenario = Awaited<ReturnType<typeof cenario>>;

function lancar(c: Cenario, valor: unknown, token = c.tokenProfessor, avaliacaoId = c.avaliacao.id) {
  return registrarNotaApi(
    requisicaoJson(URL_NOTAS, { turmaId: c.turma.id, avaliacaoId, estudanteId: c.estudante.id, valor }, token),
  );
}

function alterar(notaId: string, valor: unknown, token: string) {
  return alterarNotaApi(requisicaoJson(`${URL_NOTAS}/${notaId}`, { valor }, token, "PATCH"), parametros(notaId));
}

function notasDoEstudante(estudanteId: string) {
  return prisma.nota.findMany({ where: { estudanteId } });
}

function indicador(estudanteId: string, turmaId: string) {
  return prisma.indicadorAcademico.findUnique({ where: { estudanteId_turmaId: { estudanteId, turmaId } } });
}

describe("SPEC-004 — validação e média (funções puras, sem banco)", () => {
  it("RB-09 / OPEN-002: validarValorNota aceita de 0 a 10, limites incluídos, e vírgula decimal", () => {
    for (const valor of [0, 5, 5.95, 10, "7,5", " 8 "]) expect(validarValorNota(valor).ok).toBe(true);
    expect(validarValorNota("7,5")).toEqual({ ok: true, dados: 7.5 });
  });

  it("RB-09 / OPEN-002: valor fora de 0 a 10, vazio ou não numérico é recusado com mensagem de correção", () => {
    for (const valor of [-0.01, 10.01, "", "abc", null, undefined, Number.NaN, Number.POSITIVE_INFINITY, {}]) {
      expect(validarValorNota(valor)).toEqual({ ok: false, erros: { valor: MENSAGEM_NOTA_INVALIDA } });
    }
  });

  it("RB-06 / RB-07 / RB-09: a média é ponderada pelos pesos das avaliações com nota e classifica sem arredondar", () => {
    const media = calcularMedia([{ valor: 4, peso: 1 }, { valor: 7, peso: 2 }]);
    expect(media).toBeCloseTo(6, 10);
    expect(calcularMedia([{ valor: 5.95, peso: 1 }])).toBe(5.95);
    expect(classificarSituacao(calcularMedia([{ valor: 5.95, peso: 1 }]), null)).toBe("Atencao"); // RB-06
    expect(classificarSituacao(calcularMedia([{ valor: 4.9, peso: 3 }]), null)).toBe("Risco"); // RB-07
    expect(calcularMedia([])).toBeNull(); // OPEN-002: sem nota, média vazia
  });

  it("OPEN-002 / OPEN-017: avaliação exige nome, peso maior que zero e data válida", () => {
    expect(validarAvaliacao({ nome: "P1", peso: "2", data: "2026-10-13" }).ok).toBe(true);
    const invalida = validarAvaliacao({ nome: " ", peso: 0, data: "ontem" });
    expect(invalida.ok).toBe(false);
    if (!invalida.ok) expect(Object.keys(invalida.erros).sort()).toEqual(["data", "nome", "peso"]);
    expect(validarAvaliacao({ nome: "P1", peso: -1, data: "2026-10-13" }).ok).toBe(false);
  });
});

describe("SPEC-004 — registro e alteração de nota (integração)", () => {
  it("AC-004-01: professor responsável lança nota válida; nota associada ao estudante e à avaliação, média e indicador atualizados", async () => {
    const c = await cenario();
    const resposta = await lancar(c, 7.5);
    expect(resposta.status).toBe(201);
    const corpo = await resposta.json();
    expect(corpo.nota).toMatchObject({ valor: 7.5, avaliacaoId: c.avaliacao.id, estudanteId: c.estudante.id });
    expect(corpo.indicador).toEqual({ media: 7.5, situacao: "Normal" });

    const [nota] = await notasDoEstudante(c.estudante.id);
    expect(nota).toMatchObject({ valor: 7.5, avaliacaoId: c.avaliacao.id });
    expect(await indicador(c.estudante.id, c.turma.id)).toMatchObject({ media: 7.5, situacao: "Normal" });
  });

  it("AC-004-02: nota inválida é rejeitada e a correção é solicitada", async () => {
    const c = await cenario();
    const resposta = await lancar(c, 11);
    expect(resposta.status).toBe(400);
    expect((await resposta.json()).campos).toEqual({ valor: MENSAGEM_NOTA_INVALIDA });
    expect(await notasDoEstudante(c.estudante.id)).toHaveLength(0);
  });

  it("AC-004-03: alterar nota já lançada sobrescreve o valor e recalcula a média", async () => {
    const c = await cenario();
    const p2 = await prisma.avaliacao.create({ data: { turmaId: c.turma.id, nome: "P2", peso: 3, data: new Date() } });
    const { nota } = await (await lancar(c, 8)).json();
    await lancar(c, 6, c.tokenProfessor, p2.id); // média (8·1 + 6·3) / 4 = 6,5
    expect((await indicador(c.estudante.id, c.turma.id))?.media).toBeCloseTo(6.5, 10);

    const resposta = await alterar(nota.id, 4, c.tokenProfessor); // (4·1 + 6·3) / 4 = 5,5
    expect(resposta.status).toBe(200);
    expect((await resposta.json()).indicador.situacao).toBe("Atencao");
    expect((await prisma.nota.findUnique({ where: { id: nota.id } }))?.valor).toBe(4);
    const atual = await indicador(c.estudante.id, c.turma.id);
    expect(atual?.media).toBeCloseTo(5.5, 10);
    expect(atual?.situacao).toBe("Atencao");
  });

  it("AC-004-04: professor de outra turma tenta lançar ou alterar nota e tem o acesso negado", async () => {
    const c = await cenario();
    const outro = await criarUsuarioDeTeste("Professor");
    const tokenOutro = await entrarComo(outro.email, outro.senha);

    expect((await lancar(c, 9, tokenOutro)).status).toBe(403);
    expect(await notasDoEstudante(c.estudante.id)).toHaveLength(0);

    const { nota } = await (await lancar(c, 7)).json();
    expect((await alterar(nota.id, 2, tokenOutro)).status).toBe(403);
    expect((await prisma.nota.findUnique({ where: { id: nota.id } }))?.valor).toBe(7);
  });

  it("AC-004-05: estudante autenticado tenta lançar nota e tem o acesso negado", async () => {
    const c = await cenario();
    const tokenEstudante = await entrarComo(c.estudante.email, c.estudante.senha);
    const resposta = await lancar(c, 10, tokenEstudante);
    expect(resposta.status).toBe(403);
    expect(await notasDoEstudante(c.estudante.id)).toHaveLength(0);
  });

  it("AC-004-06: professor responsável cria avaliação (turma, peso, data) com peso maior que zero", async () => {
    const c = await cenario();
    const url = `http://localhost/api/turmas/${c.turma.id}/avaliacoes`;
    const criada = await cadastrarAvaliacaoApi(requisicaoJson(url, { nome: "Trabalho", peso: "2,5", data: "2026-11-20" }, c.tokenProfessor), parametros(c.turma.id));
    expect(criada.status).toBe(201);
    expect(await criada.json()).toMatchObject({ turmaId: c.turma.id, nome: "Trabalho", peso: 2.5 });

    const pesoZero = await cadastrarAvaliacaoApi(requisicaoJson(url, { nome: "X", peso: 0, data: "2026-11-20" }, c.tokenProfessor), parametros(c.turma.id));
    expect(pesoZero.status).toBe(400);
    expect((await pesoZero.json()).campos.peso).toBeDefined();
    expect(await prisma.avaliacao.count({ where: { turmaId: c.turma.id } })).toBe(2); // P1 do cenário + Trabalho
  });

  it("AC-004-07: professor de outra turma e estudante não cadastram avaliação (acesso negado)", async () => {
    const c = await cenario();
    const outro = await criarUsuarioDeTeste("Professor");
    const tokenOutro = await entrarComo(outro.email, outro.senha);
    const tokenEstudante = await entrarComo(c.estudante.email, c.estudante.senha);
    const url = `http://localhost/api/turmas/${c.turma.id}/avaliacoes`;
    const corpo = { nome: "Indevida", peso: 1, data: "2026-11-20" };

    expect((await cadastrarAvaliacaoApi(requisicaoJson(url, corpo, tokenOutro), parametros(c.turma.id))).status).toBe(403);
    expect((await cadastrarAvaliacaoApi(requisicaoJson(url, corpo, tokenEstudante), parametros(c.turma.id))).status).toBe(403);
    expect((await cadastrarAvaliacaoApi(requisicaoJson(url, corpo), parametros(c.turma.id))).status).toBe(401);
    expect(await prisma.avaliacao.count({ where: { turmaId: c.turma.id } })).toBe(1);
  });

  it("INV-004-01: cada nota pertence a exatamente 1 avaliação e 1 estudante (sem segunda nota no mesmo par)", async () => {
    const c = await cenario();
    expect((await lancar(c, 6)).status).toBe(201);
    expect((await lancar(c, 9)).status).toBe(409);
    const notas = await notasDoEstudante(c.estudante.id);
    expect(notas).toHaveLength(1);
    expect(notas[0]).toMatchObject({ avaliacaoId: c.avaliacao.id, estudanteId: c.estudante.id, valor: 6 });
    // O banco também recusa o par duplicado e a nota sem avaliação existente (FK).
    await expect(prisma.nota.create({ data: { avaliacaoId: c.avaliacao.id, estudanteId: c.estudante.id, valor: 1 } })).rejects.toThrow();
    await expect(prisma.nota.create({ data: { avaliacaoId: randomUUID(), estudanteId: c.estudante.id, valor: 1 } })).rejects.toThrow();
  });

  it("INV-004-02: só o professor responsável lança nota da turma; avaliação de outra turma, estudante não matriculado e pedido sem sessão são recusados", async () => {
    const c = await cenario();
    const outra = await cenario(); // outra turma, de outro professor
    const naoMatriculado = await criarUsuarioDeTeste("Estudante");

    // Avaliação de uma turma que o professor não leciona, mesmo informando a própria turma.
    expect((await lancar(c, 7, c.tokenProfessor, outra.avaliacao.id)).status).toBe(403);
    // Estudante que não está matriculado na turma.
    const semMatricula = await registrarNotaApi(
      requisicaoJson(URL_NOTAS, { turmaId: c.turma.id, avaliacaoId: c.avaliacao.id, estudanteId: naoMatriculado.id, valor: 7 }, c.tokenProfessor),
    );
    expect(semMatricula.status).toBe(403);
    // Sem sessão.
    expect((await lancar(c, 7, "")).status).toBe(401);
    expect(await prisma.nota.count({ where: { estudanteId: { in: [c.estudante.id, naoMatriculado.id, outra.estudante.id] } } })).toBe(0);
  });

  it("INV-004-03: a escrita da nota e o recálculo do indicador estão na mesma transação (falha no recálculo desfaz a escrita)", async () => {
    const c = await cenario();
    const { nota } = await (await lancar(c, 8)).json();
    const antes = await indicador(c.estudante.id, c.turma.id);
    expect(antes?.media).toBe(8);

    const p2 = await prisma.avaliacao.create({ data: { turmaId: c.turma.id, nome: "P2", peso: 1, data: new Date() } });

    falhaNoRecalculo.ativa = true;
    try {
      await expect(alterar(nota.id, 3, c.tokenProfessor)).rejects.toThrow("Falha simulada");
      await expect(lancar(c, 5, c.tokenProfessor, p2.id)).rejects.toThrow("Falha simulada");
    } finally {
      falhaNoRecalculo.ativa = false;
    }

    // Pós-condição de falha: nota anterior preservada, nenhuma nota nova e indicador inalterado.
    expect((await prisma.nota.findUnique({ where: { id: nota.id } }))?.valor).toBe(8);
    expect(await notasDoEstudante(c.estudante.id)).toHaveLength(1);
    expect(await indicador(c.estudante.id, c.turma.id)).toMatchObject({ media: 8, atualizadoEm: antes?.atualizadoEm });
  });

  it("INV-004-04: valor inválido nunca é persistido, no registro nem na alteração (e o banco também recusa)", async () => {
    const c = await cenario();
    for (const valor of [-1, 10.5, "abc", "", null]) {
      const resposta = await lancar(c, valor);
      expect(resposta.status).toBe(400);
      expect((await resposta.json()).campos.valor).toBe(MENSAGEM_NOTA_INVALIDA);
    }
    expect(await notasDoEstudante(c.estudante.id)).toHaveLength(0);

    const { nota } = await (await lancar(c, 7)).json();
    for (const valor of [-1, 10.5, "abc"]) expect((await alterar(nota.id, valor, c.tokenProfessor)).status).toBe(400);
    expect((await prisma.nota.findUnique({ where: { id: nota.id } }))?.valor).toBe(7);
    expect((await indicador(c.estudante.id, c.turma.id))?.media).toBe(7);

    // CHECK da migração spec_003_indicador (OPEN-016): o banco recusa nota fora de 0 a 10.
    await expect(prisma.nota.update({ where: { id: nota.id }, data: { valor: 11 } })).rejects.toThrow();
  });
});
