// SPEC-008 — dashboard da turma e plano de recuperação: regras de domínio (unitário) e API com escopo (integração).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { MAXIMO_ITENS_PLANO, MENSAGEM_FORA_DE_RISCO, podeReceberPlano, progressoDoPlano, validarItensPlano } from "@/domain/plano";
import { POST as encerrarApi } from "@/app/api/planos/[id]/encerrar/route";
import { PATCH as marcarItemApi } from "@/app/api/planos/itens/[id]/route";
import { POST as criarPlanoApi } from "@/app/api/planos/route";
import { GET as dashboardApi } from "@/app/api/turmas/[id]/dashboard/route";
import { recalcularIndicador } from "@/server/academico/indicador";
import { prisma } from "@/server/dados/prisma";
import { PREFIXO_DISCIPLINA_TESTE, criarUsuarioDeTeste, entrarComo, parametros, removerUsuariosDeTeste, requisicaoComSessao, requisicaoJson } from "../apoio";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const URL_PLANOS = "http://localhost/api/planos";
const ITENS = ["Refazer a lista 1", "Plantão de dúvidas", "Resumo do capítulo 3", "Simulado"];

// Turma com três estudantes: Normal (8 / 90%), Atenção (5,5 / 90%) e Risco (4 / 90%).
async function cenario() {
  const professor = await criarUsuarioDeTeste("Professor");
  const [normal, atencao, risco] = [await criarUsuarioDeTeste("Estudante"), await criarUsuarioDeTeste("Estudante"), await criarUsuarioDeTeste("Estudante")];
  const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60 } });
  const turma = await prisma.turma.create({ data: { nome: "T", periodo: "2026/2", disciplinaId: disciplina.id, professorId: professor.id } });
  const avaliacao = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "Prova 1", peso: 1, data: new Date("2026-09-15") } });
  for (const [estudante, nota] of [[normal, 8], [atencao, 5.5], [risco, 4]] as const) {
    await prisma.matricula.create({ data: { estudanteId: estudante.id, turmaId: turma.id } });
    await prisma.nota.create({ data: { avaliacaoId: avaliacao.id, estudanteId: estudante.id, valor: nota } });
    await prisma.frequencia.create({ data: { estudanteId: estudante.id, turmaId: turma.id, percentual: 90 } });
    await recalcularIndicador(estudante.id, turma.id);
  }
  const token = await entrarComo(professor.email, professor.senha);
  return { professor, normal, atencao, risco, turma, avaliacao, token };
}

async function criar(token: string, corpo: unknown) {
  const resposta = await criarPlanoApi(requisicaoJson(URL_PLANOS, corpo, token));
  return { status: resposta.status, corpo: await resposta.json() };
}

const itensDe = (planoId: string) => prisma.itemPlano.findMany({ where: { planoId }, orderBy: { ordem: "asc" } });

async function marcar(token: string, itemId: string, concluido: boolean) {
  const resposta = await marcarItemApi(requisicaoJson(`${URL_PLANOS}/itens/${itemId}`, { concluido }, token, "PATCH"), parametros(itemId));
  return { status: resposta.status, corpo: await resposta.json() };
}

describe("SPEC-008 — regras de domínio", () => {
  it("INV-008-01 / RB-11: só estudante em Risco pode receber plano", () => {
    expect(podeReceberPlano("Risco")).toBe(true);
    expect(podeReceberPlano("Atencao")).toBe(false);
    expect(podeReceberPlano("Normal")).toBe(false);
    expect(podeReceberPlano(null)).toBe(false);
  });

  it("RB-12 / INV-008-03: progresso = concluídos ÷ previstos", () => {
    const itens = (n: number) => ITENS.map((_, i) => ({ concluido: i < n }));
    expect(progressoDoPlano(itens(0))).toEqual({ concluidos: 0, total: 4, percentual: 0 });
    expect(progressoDoPlano(itens(1))).toEqual({ concluidos: 1, total: 4, percentual: 25 });
    expect(progressoDoPlano(itens(4))).toEqual({ concluidos: 4, total: 4, percentual: 100 });
    expect(progressoDoPlano([{ concluido: true }, { concluido: false }, { concluido: false }]).percentual).toBe(33);
  });

  it("OPEN-021 / INV-008-03: itens um por linha, de 1 a 20, ignorando linhas vazias", () => {
    expect(validarItensPlano("  Lista 1 \n\n Plantão \r\n")).toEqual({ ok: true, dados: ["Lista 1", "Plantão"] });
    expect(validarItensPlano(["A", " ", "B"])).toEqual({ ok: true, dados: ["A", "B"] });
    expect(validarItensPlano("\n  \n").ok).toBe(false);
    expect(validarItensPlano(undefined).ok).toBe(false);
    expect(validarItensPlano(Array.from({ length: MAXIMO_ITENS_PLANO }, (_, i) => `Item ${i}`)).ok).toBe(true);
    expect(validarItensPlano(Array.from({ length: MAXIMO_ITENS_PLANO + 1 }, (_, i) => `Item ${i}`)).ok).toBe(false);
  });
});

describe("SPEC-008 — dashboard da turma e plano de recuperação", () => {
  it("AC-008-01: professor vê só os estudantes da própria turma, com a contagem por situação", async () => {
    const { turma, token, normal, atencao, risco } = await cenario();
    const outra = await cenario();

    const resposta = await dashboardApi(requisicaoComSessao(`http://localhost/api/turmas/${turma.id}/dashboard`, token), parametros(turma.id));
    const corpo = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(corpo.contagem).toEqual({ Normal: 1, Atencao: 1, Risco: 1, SemDados: 0 });
    expect(corpo.estudantes.map((e: { id: string }) => e.id).sort()).toEqual([normal.id, atencao.id, risco.id].sort());
    expect(JSON.stringify(corpo)).not.toContain(outra.risco.id);
  });

  it("AC-008-02 / INV-008-02: plano para estudante em Risco fica com o professor da turma e começa em 0%", async () => {
    const { professor, risco, turma, token } = await cenario();

    const { status, corpo } = await criar(token, { turmaId: turma.id, estudanteId: risco.id, itens: ITENS.join("\n") });

    expect(status).toBe(201);
    expect(corpo.progresso).toEqual({ concluidos: 0, total: 4, percentual: 0 });
    const salvo = await prisma.planoRecuperacao.findUniqueOrThrow({ where: { id: corpo.id }, include: { itens: { orderBy: { ordem: "asc" } } } });
    expect(salvo).toMatchObject({ estudanteId: risco.id, turmaId: turma.id, professorId: professor.id, status: "Ativo" });
    expect(salvo.itens.map((i) => i.descricao)).toEqual(ITENS);
  });

  it("AC-008-03: estudante em Normal ou Atenção não recebe plano, com mensagem explicativa", async () => {
    const { normal, atencao, turma, token } = await cenario();

    for (const estudante of [normal, atencao]) {
      const { status, corpo } = await criar(token, { turmaId: turma.id, estudanteId: estudante.id, itens: "Item" });
      expect(status).toBe(400);
      expect(corpo.campos.selecao).toBe(MENSAGEM_FORA_DE_RISCO);
    }
    expect(await prisma.planoRecuperacao.count({ where: { turmaId: turma.id } })).toBe(0);
  });

  it("Sem itens o plano não é criado", async () => {
    const { risco, turma, token } = await cenario();
    const { status, corpo } = await criar(token, { turmaId: turma.id, estudanteId: risco.id, itens: "  \n " });
    expect(status).toBe(400);
    expect(corpo.campos.itens).toBeDefined();
  });

  it("AC-008-04: com 4 itens previstos, concluir 1 deixa o progresso em 25%; desmarcar volta a 0%", async () => {
    const { risco, turma, token } = await cenario();
    const plano = (await criar(token, { turmaId: turma.id, estudanteId: risco.id, itens: ITENS })).corpo;
    const [primeiro] = await itensDe(plano.id);

    const marcado = await marcar(token, primeiro.id, true);
    expect(marcado.status).toBe(200);
    expect(marcado.corpo.progresso).toEqual({ concluidos: 1, total: 4, percentual: 25 });
    expect(marcado.corpo.item.concluidoEm).not.toBeNull();

    const desmarcado = await marcar(token, primeiro.id, false);
    expect(desmarcado.corpo.progresso.percentual).toBe(0);
    expect(desmarcado.corpo.item.concluidoEm).toBeNull();
  });

  it("RB-03 / AC-008-05 / INV-008-04: professor de outra turma não acessa a turma, nem cria, marca ou encerra plano", async () => {
    const { risco, turma, token } = await cenario();
    const plano = (await criar(token, { turmaId: turma.id, estudanteId: risco.id, itens: ITENS })).corpo;
    const intruso = await criarUsuarioDeTeste("Professor");
    const tokenIntruso = await entrarComo(intruso.email, intruso.senha);

    const dashboard = await dashboardApi(requisicaoComSessao(`http://localhost/api/turmas/${turma.id}/dashboard`, tokenIntruso), parametros(turma.id));
    expect(dashboard.status).toBe(403);
    expect((await criar(tokenIntruso, { turmaId: turma.id, estudanteId: risco.id, itens: ITENS })).status).toBe(403);
    const [item] = await itensDe(plano.id);
    expect((await marcar(tokenIntruso, item.id, true)).status).toBe(403);
    const encerrar = await encerrarApi(requisicaoJson(`${URL_PLANOS}/${plano.id}/encerrar`, {}, tokenIntruso), parametros(plano.id));
    expect(encerrar.status).toBe(403);
    expect((await prisma.planoRecuperacao.findUniqueOrThrow({ where: { id: plano.id } })).status).toBe("Ativo");
  });

  it("Estudante e Coordenador não usam a API de planos (RBAC)", async () => {
    const { risco, turma } = await cenario();
    for (const perfil of ["Estudante", "Coordenador"] as const) {
      const usuario = await criarUsuarioDeTeste(perfil);
      const token = await entrarComo(usuario.email, usuario.senha);
      expect((await criar(token, { turmaId: turma.id, estudanteId: risco.id, itens: ITENS })).status).toBe(403);
    }
  });

  it("AC-008-06 / INV-008-05: estudante com plano ativo não recebe outro; depois de encerrado, pode receber novo", async () => {
    const { risco, turma, token } = await cenario();
    const primeiro = (await criar(token, { turmaId: turma.id, estudanteId: risco.id, itens: ITENS })).corpo;

    const repetido = await criar(token, { turmaId: turma.id, estudanteId: risco.id, itens: ITENS });
    expect(repetido.status).toBe(409);
    expect(repetido.corpo.erro).toMatch(/já tem um plano ativo/);

    await encerrarApi(requisicaoJson(`${URL_PLANOS}/${primeiro.id}/encerrar`, {}, token), parametros(primeiro.id));
    expect((await criar(token, { turmaId: turma.id, estudanteId: risco.id, itens: ITENS })).status).toBe(201);
  });

  it("INV-008-05 no banco: o índice parcial impede dois planos ativos mesmo fora do caso de uso", async () => {
    const { professor, risco, turma } = await cenario();
    const dados = { estudanteId: risco.id, turmaId: turma.id, professorId: professor.id };
    await prisma.planoRecuperacao.create({ data: dados });
    await expect(prisma.planoRecuperacao.create({ data: dados })).rejects.toMatchObject({ code: "P2002" });
    await prisma.planoRecuperacao.create({ data: { ...dados, status: "Encerrado", encerradoEm: new Date() } });
  });

  it("AC-008-07 / INV-008-06 / OPEN-012: plano de quem saiu do Risco continua ativo até o professor encerrar; encerrado não aceita alteração", async () => {
    const { risco, turma, avaliacao, token } = await cenario();
    const plano = (await criar(token, { turmaId: turma.id, estudanteId: risco.id, itens: ITENS })).corpo;

    await prisma.nota.update({ where: { avaliacaoId_estudanteId: { avaliacaoId: avaliacao.id, estudanteId: risco.id } }, data: { valor: 9 } });
    await recalcularIndicador(risco.id, turma.id);
    expect((await prisma.planoRecuperacao.findUniqueOrThrow({ where: { id: plano.id } })).status).toBe("Ativo");

    const encerrado = await encerrarApi(requisicaoJson(`${URL_PLANOS}/${plano.id}/encerrar`, {}, token), parametros(plano.id));
    expect(encerrado.status).toBe(200);
    expect(await encerrado.json()).toMatchObject({ status: "Encerrado", encerradoEm: expect.any(String) });

    const [item] = await itensDe(plano.id);
    const alteracao = await marcar(token, item.id, true);
    expect(alteracao.status).toBe(409);
    expect((await prisma.itemPlano.findUniqueOrThrow({ where: { id: item.id } })).concluido).toBe(false);

    const deNovo = await encerrarApi(requisicaoJson(`${URL_PLANOS}/${plano.id}/encerrar`, {}, token), parametros(plano.id));
    expect(deNovo.status).toBe(409);
  });
});
