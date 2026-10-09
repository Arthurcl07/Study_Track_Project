// SPEC-003 — classificação acadêmica (unitário, sem banco) e indicador persistido (integração).
import { randomUUID } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  DadosAcademicosInvalidos,
  SITUACOES,
  calcularMedia,
  classificarSituacao,
} from "@/domain/situacao-academica";
import { GET as indicadoresApi } from "@/app/api/indicadores/route";
import { EstudanteNaoMatriculado, recalcularIndicador } from "@/server/academico/indicador";
import { prisma } from "@/server/dados/prisma";
import {
  PREFIXO_DISCIPLINA_TESTE,
  criarUsuarioDeTeste,
  entrarComo,
  removerUsuariosDeTeste,
  requisicaoComSessao,
} from "../apoio";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

// Turma com professor, coordenador e um estudante matriculado.
async function cenario() {
  const coordenador = await criarUsuarioDeTeste("Coordenador");
  const professor = await criarUsuarioDeTeste("Professor");
  const estudante = await criarUsuarioDeTeste("Estudante");
  const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60 } });
  const turma = await prisma.turma.create({
    data: { nome: "T", periodo: "2026/2", disciplinaId: disciplina.id, professorId: professor.id, coordenadorId: coordenador.id },
  });
  await prisma.matricula.create({ data: { estudanteId: estudante.id, turmaId: turma.id } });
  return { coordenador, professor, estudante, turma };
}

function avaliacao(turmaId: string, peso: number) {
  return prisma.avaliacao.create({ data: { turmaId, nome: `Avaliação ${peso}`, peso, data: new Date() } });
}

describe("SPEC-003 — classificação (função pura, sem banco)", () => {
  it.each([
    ["AC-003-01", 6.0, 75, "Normal"],
    ["AC-003-02", 5.0, 80, "Atencao"],
    ["AC-003-03", 5.95, 80, "Atencao"],
    ["AC-003-04", 4.9, 90, "Risco"],
    ["AC-003-05", 8.0, 74.9, "Risco"],
    ["AC-003-06", 5.0, 75, "Atencao"],
  ] as const)("%s: média %s e frequência %s%% classifica %s", (_id, media, frequencia, esperado) => {
    expect(classificarSituacao(media, frequencia)).toBe(esperado);
  });

  it("Caso de teste 12.1: tabela de limites 4,99 / 5,0 / 5,95 / 6,0 e 74,9% / 75%", () => {
    expect(classificarSituacao(4.99, 100)).toBe("Risco");
    expect(classificarSituacao(5.0, 100)).toBe("Atencao");
    expect(classificarSituacao(5.95, 100)).toBe("Atencao");
    expect(classificarSituacao(6.0, 100)).toBe("Normal");
    expect(classificarSituacao(10, 74.9)).toBe("Risco");
    expect(classificarSituacao(10, 75)).toBe("Normal");
  });

  it("INV-003-01: frequência abaixo de 75% é Risco independentemente da média", () => {
    for (const media of [0, 5, 6, 10]) expect(classificarSituacao(media, 74.99)).toBe("Risco");
  });

  it("INV-003-02 / INV-003-03: média abaixo de 5 é Risco; de 5 até antes de 6 é Atenção", () => {
    expect(classificarSituacao(4.999, 90)).toBe("Risco");
    expect(classificarSituacao(5, 90)).toBe("Atencao");
    expect(classificarSituacao(5.999, 90)).toBe("Atencao");
  });

  it("INV-003-04: o resultado é sempre exatamente uma das três situações", () => {
    for (let media = 0; media <= 10; media += 0.25) {
      for (const frequencia of [0, 50, 74.9, 75, 100, null]) {
        expect(SITUACOES).toContain(classificarSituacao(media, frequencia));
      }
    }
  });

  it("OPEN-002: dados ausentes — só o dado presente classifica; sem nenhum, Normal", () => {
    expect(classificarSituacao(null, null)).toBe("Normal");
    expect(classificarSituacao(null, 60)).toBe("Risco");
    expect(classificarSituacao(null, 90)).toBe("Normal");
    expect(classificarSituacao(4, null)).toBe("Risco");
    expect(classificarSituacao(5.5, null)).toBe("Atencao");
  });

  it("OPEN-002: média ponderada pelos pesos; sem nota a média é vazia", () => {
    expect(calcularMedia([])).toBeNull();
    expect(calcularMedia([{ valor: 4, peso: 1 }, { valor: 7, peso: 2 }])).toBeCloseTo(6, 10);
    expect(calcularMedia([{ valor: 5.95, peso: 1 }])).toBe(5.95);
  });

  it("Contrato Classificar: dados fora da faixa são recusados", () => {
    expect(() => classificarSituacao(10.5, 80)).toThrow(DadosAcademicosInvalidos);
    expect(() => classificarSituacao(-1, 80)).toThrow(DadosAcademicosInvalidos);
    expect(() => classificarSituacao(7, 101)).toThrow(DadosAcademicosInvalidos);
    expect(() => calcularMedia([{ valor: 7, peso: 0 }])).toThrow(DadosAcademicosInvalidos);
    expect(() => calcularMedia([{ valor: 11, peso: 1 }])).toThrow(DadosAcademicosInvalidos);
  });

  it("INV-003-06: a regra de classificação existe só em src/domain/situacao-academica.ts", () => {
    const raiz = path.resolve(__dirname, "../../src");
    const arquivos: string[] = [];
    const varrer = (pasta: string) => {
      for (const nome of readdirSync(pasta)) {
        const caminho = path.join(pasta, nome);
        if (statSync(caminho).isDirectory()) varrer(caminho);
        else if (/\.(ts|tsx)$/.test(nome)) arquivos.push(caminho);
      }
    };
    varrer(raiz);
    const comRegra = arquivos.filter((arquivo) => {
      const texto = readFileSync(arquivo, "utf-8");
      return /FREQUENCIA_MINIMA\s*=|MEDIA_RISCO\s*=|MEDIA_NORMAL\s*=|function classificarSituacao/.test(texto);
    });
    expect(comRegra.map((a) => path.relative(raiz, a).replaceAll("\\", "/"))).toEqual(["domain/situacao-academica.ts"]);
  });
});

describe("SPEC-003 — indicador persistido (banco)", () => {
  it("AC-003-07 / Caso 12.2: alterar nota recalcula o indicador e renova o instante de atualização", async () => {
    const { estudante, turma } = await cenario();
    const prova = await avaliacao(turma.id, 1);
    const nota = await prisma.nota.create({ data: { avaliacaoId: prova.id, estudanteId: estudante.id, valor: 8 } });
    await prisma.frequencia.create({ data: { estudanteId: estudante.id, turmaId: turma.id, percentual: 90 } });

    const antes = await recalcularIndicador(estudante.id, turma.id);
    expect(antes).toMatchObject({ media: 8, frequenciaAtual: 90, situacao: "Normal" });

    await new Promise((r) => setTimeout(r, 20));
    await prisma.nota.update({ where: { id: nota.id }, data: { valor: 4.5 } });
    const depois = await recalcularIndicador(estudante.id, turma.id);

    expect(depois).toMatchObject({ media: 4.5, situacao: "Risco" });
    expect(depois.atualizadoEm.getTime()).toBeGreaterThan(antes.atualizadoEm.getTime());
  });

  it("Caso 12.2: alterar frequência recalcula o indicador (RB-05, RB-10)", async () => {
    const { estudante, turma } = await cenario();
    const prova = await avaliacao(turma.id, 1);
    await prisma.nota.create({ data: { avaliacaoId: prova.id, estudanteId: estudante.id, valor: 9 } });
    await prisma.frequencia.create({ data: { estudanteId: estudante.id, turmaId: turma.id, percentual: 80 } });
    expect((await recalcularIndicador(estudante.id, turma.id)).situacao).toBe("Normal");

    await prisma.frequencia.update({
      where: { estudanteId_turmaId: { estudanteId: estudante.id, turmaId: turma.id } },
      data: { percentual: 70 },
    });

    expect(await recalcularIndicador(estudante.id, turma.id)).toMatchObject({ frequenciaAtual: 70, situacao: "Risco" });
  });

  it("OPEN-002: avaliação ainda sem nota não entra na média ponderada", async () => {
    const { estudante, turma } = await cenario();
    const p1 = await avaliacao(turma.id, 1);
    const p2 = await avaliacao(turma.id, 2);
    await avaliacao(turma.id, 3); // ainda sem nota
    await prisma.nota.createMany({
      data: [
        { avaliacaoId: p1.id, estudanteId: estudante.id, valor: 4 },
        { avaliacaoId: p2.id, estudanteId: estudante.id, valor: 7 },
      ],
    });

    expect((await recalcularIndicador(estudante.id, turma.id)).media).toBeCloseTo(6, 10);
  });

  it("INV-003-05 / Caso 12.3: existe exatamente 1 indicador vigente por estudante e turma", async () => {
    const { estudante, turma } = await cenario();
    await recalcularIndicador(estudante.id, turma.id);
    await recalcularIndicador(estudante.id, turma.id);

    expect(await prisma.indicadorAcademico.count({ where: { estudanteId: estudante.id, turmaId: turma.id } })).toBe(1);
    await expect(
      prisma.indicadorAcademico.create({
        data: { estudanteId: estudante.id, turmaId: turma.id, situacao: "Normal", atualizadoEm: new Date() },
      }),
    ).rejects.toThrow();
  });

  it("Contrato Recalcular: estudante não matriculado é recusado e nada é gravado", async () => {
    const { turma } = await cenario();
    const forasteiro = await criarUsuarioDeTeste("Estudante");

    await expect(recalcularIndicador(forasteiro.id, turma.id)).rejects.toThrow(EstudanteNaoMatriculado);
    expect(await prisma.indicadorAcademico.count({ where: { estudanteId: forasteiro.id } })).toBe(0);
  });

  it("OPEN-002: o banco recusa nota fora de 0–10, frequência fora de 0–100% e peso zero", async () => {
    const { estudante, turma } = await cenario();
    const prova = await avaliacao(turma.id, 1);
    await expect(prisma.nota.create({ data: { avaliacaoId: prova.id, estudanteId: estudante.id, valor: 10.5 } })).rejects.toThrow();
    await expect(prisma.frequencia.create({ data: { estudanteId: estudante.id, turmaId: turma.id, percentual: 120 } })).rejects.toThrow();
    await expect(avaliacao(turma.id, 0)).rejects.toThrow();
  });

  it("RNF-03 / RNF-05: cada perfil só lê os indicadores do seu escopo, no servidor", async () => {
    const a = await cenario();
    const b = await cenario();
    await recalcularIndicador(a.estudante.id, a.turma.id);
    await recalcularIndicador(b.estudante.id, b.turma.id);

    const turmasVistas = async (email: string, senha: string) => {
      const token = await entrarComo(email, senha);
      const lista = await (await indicadoresApi(requisicaoComSessao("http://localhost/api/indicadores", token))).json();
      return lista.map((i: { turma: { id: string }; estudante: { id: string } }) => `${i.turma.id}:${i.estudante.id}`);
    };
    const esperadoA = [`${a.turma.id}:${a.estudante.id}`];

    expect(await turmasVistas(a.estudante.email, a.estudante.senha)).toEqual(esperadoA);
    expect(await turmasVistas(a.professor.email, a.professor.senha)).toEqual(esperadoA);
    expect(await turmasVistas(a.coordenador.email, a.coordenador.senha)).toEqual(esperadoA);
    expect((await indicadoresApi(requisicaoComSessao("http://localhost/api/indicadores"))).status).toBe(401);
  });
});
