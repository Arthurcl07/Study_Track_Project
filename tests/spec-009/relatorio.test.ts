// SPEC-009 — relatório acadêmico: consolidação e CSV (unitário) e API com escopo e filtros (integração).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { consolidarTurma, ehSituacaoRelatorio, gerarCsv, type LinhaEstudante } from "@/domain/relatorio";
import { GET as relatorioApi } from "@/app/api/relatorios/route";
import { recalcularIndicador } from "@/server/academico/indicador";
import { prisma } from "@/server/dados/prisma";
import { PREFIXO_DISCIPLINA_TESTE, criarUsuarioDeTeste, entrarComo, removerUsuariosDeTeste, requisicaoComSessao } from "../apoio";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const linha = (parcial: Partial<LinhaEstudante>): LinhaEstudante => ({
  turmaId: "t1", turma: "Turma A · Modelagem", estudante: "Ana", media: 7, frequencia: 90, situacao: "Normal", entregasAtrasadas: 0, ...parcial,
});

// Turma com três estudantes (Normal, Atenção, Risco) e uma atividade vencida entregue só pelo primeiro.
async function cenario(coordenadorId?: string) {
  const professor = await criarUsuarioDeTeste("Professor");
  // Nomes distintos para identificar as linhas do relatório.
  const estudantes = [];
  for (const nome of ["Ana", "Bruno", "Carla"]) {
    const criado = await criarUsuarioDeTeste("Estudante");
    await prisma.usuario.update({ where: { id: criado.id }, data: { nome } });
    estudantes.push({ ...criado, nome });
  }
  const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60 } });
  const turma = await prisma.turma.create({ data: { nome: "T", periodo: "2026/2", disciplinaId: disciplina.id, professorId: professor.id, coordenadorId } });
  const avaliacao = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "Prova 1", peso: 1, data: new Date("2026-09-15") } });
  const atividade = await prisma.atividade.create({ data: { turmaId: turma.id, descricao: "Lista 1", prazo: new Date("2026-01-10") } });
  for (const [i, [nota, freq]] of ([[8, 90], [5.5, 90], [8, 70]] as const).entries()) {
    const estudante = estudantes[i];
    await prisma.matricula.create({ data: { estudanteId: estudante.id, turmaId: turma.id } });
    await prisma.nota.create({ data: { avaliacaoId: avaliacao.id, estudanteId: estudante.id, valor: nota } });
    await prisma.frequencia.create({ data: { estudanteId: estudante.id, turmaId: turma.id, percentual: freq } });
    await recalcularIndicador(estudante.id, turma.id);
  }
  await prisma.entrega.create({ data: { atividadeId: atividade.id, estudanteId: estudantes[0].id, dataEntrega: new Date("2026-01-09") } });
  return { professor, estudantes, turma, avaliacao };
}

async function relatorio(usuario: { email: string; senha: string }, consulta = "") {
  const token = await entrarComo(usuario.email, usuario.senha);
  const resposta = await relatorioApi(requisicaoComSessao(`http://localhost/api/relatorios${consulta}`, token));
  const tipo = resposta.headers.get("content-type") ?? "";
  // O CSV é lido sem descartar o BOM, para comparar byte a byte com gerarCsv.
  const corpo = tipo.includes("json") ? await resposta.json() : new TextDecoder("utf-8", { ignoreBOM: true }).decode(await resposta.arrayBuffer());
  return { status: resposta.status, tipo, corpo };
}

describe("SPEC-009 — consolidação e CSV", () => {
  it("Resumo por turma: médias simples sem contar quem não tem dado, contagem por situação e total de atrasadas", () => {
    const resumo = consolidarTurma([
      linha({ media: 8, frequencia: 90, situacao: "Normal", entregasAtrasadas: 1 }),
      linha({ media: 5, frequencia: 80, situacao: "Atencao", entregasAtrasadas: 2 }),
      linha({ media: null, frequencia: null, situacao: "SemDados" }),
    ]);
    expect(resumo).toEqual({
      estudantes: 3,
      mediaTurma: 6.5,
      frequenciaMedia: 85,
      contagem: { Normal: 1, Atencao: 1, Risco: 0, SemDados: 1 },
      entregasAtrasadas: 3,
    });
    expect(consolidarTurma([])).toMatchObject({ estudantes: 0, mediaTurma: null, frequenciaMedia: null });
  });

  it("OPEN-005: CSV com BOM, separador ';', vírgula decimal, rótulos em português e campos escapados", () => {
    const csv = gerarCsv([
      linha({ media: 6.25, frequencia: 72.5, situacao: "Atencao" }),
      linha({ estudante: 'Bruno "B"; Costa', media: null, frequencia: null, situacao: "SemDados", entregasAtrasadas: 2 }),
    ]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv.slice(1).split("\r\n")).toEqual([
      "Turma;Estudante;Média;Frequência (%);Situação;Entregas atrasadas",
      "Turma A · Modelagem;Ana;6,25;72,5;Atenção;0",
      'Turma A · Modelagem;"Bruno ""B""; Costa";;;Sem dados;2',
      "",
    ]);
  });

  it("Filtro de situação só aceita os valores conhecidos", () => {
    expect(["Normal", "Atencao", "Risco", "SemDados"].every(ehSituacaoRelatorio)).toBe(true);
    expect(ehSituacaoRelatorio("Atenção")).toBe(false);
    expect(ehSituacaoRelatorio(null)).toBe(false);
  });
});

describe("SPEC-009 — relatório com escopo", () => {
  it("RB-03 / AC-009-01 / INV-009-01: professor obtém o relatório consolidado só das turmas que leciona", async () => {
    const { professor, turma, estudantes } = await cenario();
    const outra = await cenario();

    const { status, corpo } = await relatorio(professor);

    expect(status).toBe(200);
    expect(corpo.turmasDisponiveis.map((t: { id: string }) => t.id)).toEqual([turma.id]);
    expect(corpo.resumo).toEqual([
      expect.objectContaining({ id: turma.id, estudantes: 3, contagem: { Normal: 1, Atencao: 1, Risco: 1, SemDados: 0 }, entregasAtrasadas: 2 }),
    ]);
    expect(corpo.resumo[0].mediaTurma).toBeCloseTo(7.1667, 3);
    expect(corpo.resumo[0].frequenciaMedia).toBeCloseTo(83.333, 2);
    const atrasadas = Object.fromEntries(corpo.linhas.map((l: LinhaEstudante) => [l.estudante, l.entregasAtrasadas]));
    expect(atrasadas).toEqual({ [estudantes[0].nome]: 0, [estudantes[1].nome]: 1, [estudantes[2].nome]: 1 });
    expect(JSON.stringify(corpo)).not.toContain(outra.turma.id);
  });

  it("RB-04 / AC-009-02 / INV-009-02: coordenador obtém só as turmas sob sua responsabilidade", async () => {
    const coordenador = await criarUsuarioDeTeste("Coordenador");
    const minha = await cenario(coordenador.id);
    const alheia = await cenario();

    const { status, corpo } = await relatorio(coordenador);

    expect(status).toBe(200);
    expect(corpo.resumo.map((r: { id: string }) => r.id)).toEqual([minha.turma.id]);
    expect(corpo.linhas).toHaveLength(3);
    expect(JSON.stringify(corpo)).not.toContain(alheia.turma.id);
  });

  it("AC-009-03: turma alheia é bloqueada com mensagem de negação, também no CSV", async () => {
    const { professor } = await cenario();
    const alheia = await cenario();

    const json = await relatorio(professor, `?turma=${alheia.turma.id}`);
    const csv = await relatorio(professor, `?turma=${alheia.turma.id}&formato=csv`);

    expect(json.status).toBe(403);
    expect(json.corpo.erro).toBe("Acesso negado: esta turma não está no seu escopo.");
    expect(csv.status).toBe(403);
  });

  it("AC-009-04 / INV-009-03: estudante não solicita relatório; sem sessão é 401", async () => {
    const { estudantes } = await cenario();
    expect((await relatorio(estudantes[0])).status).toBe(403);
    expect((await relatorioApi(requisicaoComSessao("http://localhost/api/relatorios"))).status).toBe(401);
  });

  it("AC-009-05 / INV-009-04: relatório gerado depois de alterar a nota reflete o indicador atual", async () => {
    const { professor, turma, avaliacao, estudantes } = await cenario();
    const alvo = estudantes[1];
    const situacaoDe = async () => (await relatorio(professor)).corpo.linhas.find((l: LinhaEstudante) => l.estudante === alvo.nome);

    expect(await situacaoDe()).toMatchObject({ media: 5.5, situacao: "Atencao" });

    await prisma.nota.update({ where: { avaliacaoId_estudanteId: { avaliacaoId: avaliacao.id, estudanteId: alvo.id } }, data: { valor: 3 } });
    await recalcularIndicador(alvo.id, turma.id);

    expect(await situacaoDe()).toMatchObject({ media: 3, situacao: "Risco" });
  });

  it("AC-009-06: filtro por Risco recorta o detalhe, mas o resumo continua com a turma inteira", async () => {
    const { professor, estudantes } = await cenario();

    const { corpo } = await relatorio(professor, "?situacao=Risco");

    expect(corpo.linhas).toEqual([expect.objectContaining({ estudante: estudantes[2].nome, situacao: "Risco" })]);
    expect(corpo.resumo[0].estudantes).toBe(3);
  });

  it("AC-009-07 / INV-009-05: o CSV traz exatamente as mesmas linhas da tela para os mesmos filtros", async () => {
    const { professor, turma } = await cenario();
    const filtros = `?turma=${turma.id}&situacao=Atencao`;

    const tela = await relatorio(professor, filtros);
    const csv = await relatorio(professor, `${filtros}&formato=csv`);

    expect(csv.status).toBe(200);
    expect(csv.tipo).toContain("text/csv");
    expect(csv.corpo).toBe(gerarCsv(tela.corpo.linhas));
    expect(csv.corpo.trim().split("\r\n")).toHaveLength(1 + tela.corpo.linhas.length);
  });
});
