// SPEC-048 — documentos oficiais da turma: montagem da ata e do diário (unitário); escopo e condições (integração).
import { afterAll, describe, expect, it } from "vitest";
import { ataLiberada, emBlocos, linhasDaAta, marcaDaPresenca } from "@/domain/documentos-turma";
import { REGRA_PADRAO } from "@/domain/situacao-academica";
import { ataDeResultados, diarioDeClasse, listaDePresenca } from "@/server/academico/documentos-turma";
import { prisma } from "@/server/dados/prisma";
import { criarPeriodoDeTeste, criarUsuarioDeTeste, removerUsuariosDeTeste } from "../apoio";
import { sessao } from "../apoio-n3";
import { turmaComEstudantes } from "../apoio-secretaria";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

describe("SPEC-048 — regras puras (sem banco)", () => {
  it("INV-048-01: a ata só sai com o diário homologado ou o período encerrado", () => {
    expect([ataLiberada("Aberto", false), ataLiberada("Fechado", false), ataLiberada("Homologado", false), ataLiberada("Aberto", true)]).toEqual([false, false, true, true]);
  });

  it("INV-048-02 / RB-24: o resultado da ata é o do histórico (com exame e trancamento) e os totais somam", () => {
    const { linhas, totais } = linhasDaAta(
      [
        { nome: "A", numeroMatricula: "1", media: 7.5, frequencia: 90, exame: null, matricula: "Cursando" },
        { nome: "B", numeroMatricula: "2", media: 5.2, frequencia: 80, exame: 6, matricula: "Cursando" },
        { nome: "C", numeroMatricula: "3", media: 3.5, frequencia: 70, exame: null, matricula: "Cursando" },
        { nome: "D", numeroMatricula: "4", media: 8, frequencia: 90, exame: null, matricula: "Trancada" },
      ],
      REGRA_PADRAO,
    );
    expect(linhas.map((l) => l.resultado)).toEqual(["Aprovado", "AprovadoExame", "ReprovadoNotaFrequencia", "Trancada"]);
    expect(linhas[1].notaFinal).toBeCloseTo(5.6);
    expect(totais.reduce((s, t) => s + t.quantidade, 0)).toBe(4);
  });

  it("Diário: P, F e A (falta abonada); a grade é dividida em blocos", () => {
    const abonos = [{ inicio: "2026-09-01", fim: "2026-09-03" }];
    expect([marcaDaPresenca(true, "2026-09-02", abonos), marcaDaPresenca(false, "2026-09-02", abonos), marcaDaPresenca(false, "2026-09-10", abonos), marcaDaPresenca(undefined, "2026-09-10", abonos)]).toEqual(["P", "A", "F", ""]);
    expect(emBlocos([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});

describe("SPEC-048 — documentos (integração)", () => {
  async function cenario() {
    const periodo = await criarPeriodoDeTeste();
    const base = await turmaComEstudantes(3, periodo.nome);
    const [a, b, c] = base.estudantes;
    await prisma.matricula.update({ where: { estudanteId_turmaId: { estudanteId: c.id, turmaId: base.turma.id } }, data: { situacao: "Trancada" } });
    for (const [e, media, freq] of [[a, 8, 90], [b, 4, 60]] as const) {
      await prisma.indicadorAcademico.create({ data: { estudanteId: e.id, turmaId: base.turma.id, media, frequenciaAtual: freq, situacao: media < 5 ? "Risco" : "Normal", atualizadoEm: new Date() } });
    }
    for (let i = 0; i < 20; i++) {
      const aula = await prisma.aula.create({ data: { turmaId: base.turma.id, data: new Date(Date.UTC(2026, 7, 11 + i)), conteudo: `Aula ${i + 1}` } });
      await prisma.presenca.createMany({ data: [{ aulaId: aula.id, estudanteId: a.id, presente: true }, { aulaId: aula.id, estudanteId: b.id, presente: i % 2 === 0 }] });
    }
    return base;
  }

  it("AC-048-02: com o diário aberto, a ata não sai", async () => {
    const { turma, coordenador } = await cenario();
    const ata = await ataDeResultados(sessao(coordenador.usuario.id, "Coordenador"), turma.id);
    expect(ata).toMatchObject({ liberada: false });
  });

  it("AC-048-01: diário homologado, a coordenação vê a ata com o resultado de cada estudante e os totais", async () => {
    const { turma, coordenador } = await cenario();
    await prisma.turma.update({ where: { id: turma.id }, data: { diario: "Homologado", diarioHomologadoEm: new Date() } });
    const ata = await ataDeResultados(sessao(coordenador.usuario.id, "Coordenador"), turma.id);
    if (!ata?.liberada) throw new Error("ata deveria estar liberada");
    expect(ata.linhas.map((l) => l.resultado).sort()).toEqual(["Aprovado", "ReprovadoNotaFrequencia", "Trancada"]);
    expect(ata.totais.reduce((s, t) => s + t.quantidade, 0)).toBe(3);
  });

  it("AC-048-03 / AC-048-04: o professor abre o diário (20 aulas com conteúdo e a grade) e a lista de presença só com quem está cursando", async () => {
    const { turma, professor } = await cenario();
    const quem = sessao(professor.id, "Professor");
    const diario = await diarioDeClasse(quem, turma.id);
    expect(diario!.aulas).toHaveLength(20);
    expect(diario!.aulas[0].conteudo).toBe("Aula 1");
    expect(diario!.estudantes.find((e) => e.marcas.includes("F"))!.marcas.filter((m) => m === "F")).toHaveLength(10);
    const lista = await listaDePresenca(quem, turma.id);
    expect(lista!.estudantes).toHaveLength(2);
  });

  it("AC-048-05 / RB-03: professor de outra turma não vê nenhum documento", async () => {
    const { turma } = await cenario();
    const outro = sessao((await criarUsuarioDeTeste("Professor")).id, "Professor");
    expect(await ataDeResultados(outro, turma.id)).toBeNull();
    expect(await diarioDeClasse(outro, turma.id)).toBeNull();
    expect(await listaDePresenca(outro, turma.id)).toBeNull();
    expect(await ataDeResultados(sessao(outro.usuarioId, "Estudante"), turma.id)).toBeNull();
  });
});
