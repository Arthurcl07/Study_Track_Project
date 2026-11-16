// SPEC-050 — alerta de evasão: regra (unitário); painel, escopo e notificação (integração).
import { afterAll, describe, expect, it } from "vitest";
import { hojeEmBrasilia } from "@/domain/atividades";
import { avaliarEvasao, somarDias, textoDoMotivo } from "@/domain/evasao";
import { consultarEvasao, painelDeEvasao } from "@/server/academico/evasao";
import { prisma } from "@/server/dados/prisma";
import { criarPeriodoDeTeste, removerUsuariosDeTeste } from "../apoio";
import { sessao } from "../apoio-n3";
import { turmaComEstudantes } from "../apoio-secretaria";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const hoje = "2026-11-14";
const aulas = (presencas: boolean[], ultima = "2026-11-12", passo = 2) =>
  presencas.map((presente, i) => ({ data: somarDias(ultima, -(presencas.length - 1 - i) * passo), presente }));

describe("SPEC-050 — regra pura (sem banco)", () => {
  it("RB-45 / AC-050-01: faltou nas 3 últimas aulas registradas", () => {
    const e = avaliarEvasao(aulas([true, true, false, false, false]), hoje);
    expect(e).toMatchObject({ motivo: "FaltasSeguidas", faltasSeguidas: 3 });
    expect(textoDoMotivo(e!)).toBe("3 faltas seguidas");
  });

  it("RB-45 / AC-050-02: sem presença nas aulas dos últimos 14 dias (aulas espaçadas)", () => {
    const e = avaliarEvasao([{ data: "2026-10-20", presente: true }, { data: "2026-11-03", presente: false }, { data: "2026-11-10", presente: false }], hoje);
    expect(e).toMatchObject({ motivo: "SemPresenca", diasSemPresenca: 25 });
  });

  it("RB-45 / AC-050-03: faltou 2 e veio na última, não está em evasão; falta abonada conta como presença", () => {
    expect(avaliarEvasao(aulas([true, false, false, true]), hoje)).toBeNull();
    const abonadas = aulas([true, false, false, false]);
    expect(avaliarEvasao(abonadas, hoje, [{ inicio: abonadas[1].data, fim: abonadas[3].data }])).toBeNull();
    // Duas aulas na mesma data contam como um encontro.
    expect(avaliarEvasao([...aulas([false, false]), { data: "2026-11-12", presente: true }], hoje)).toBeNull();
  });
});

describe("SPEC-050 — painel (integração)", () => {
  async function turmaComChamada(presencasDoSumido: boolean[]) {
    const periodo = await criarPeriodoDeTeste();
    const base = await turmaComEstudantes(2, periodo.nome);
    const [sumido, presente] = base.estudantes;
    const atual = hojeEmBrasilia();
    for (const [i, p] of presencasDoSumido.entries()) {
      const aula = await prisma.aula.create({ data: { turmaId: base.turma.id, data: new Date(`${somarDias(atual, -(presencasDoSumido.length - i) * 2)}T00:00:00Z`) } });
      await prisma.presenca.createMany({ data: [{ aulaId: aula.id, estudanteId: sumido.id, presente: p }, { aulaId: aula.id, estudanteId: presente.id, presente: true }] });
    }
    return { ...base, sumido, presente };
  }

  it("AC-050-01 / AC-050-04 / INV-050-02: a coordenação vê quem sumiu no curso dela; outro curso não vê", async () => {
    const { coordenador, sumido, presente } = await turmaComChamada([true, true, false, false, false]);
    const linhas = await painelDeEvasao(coordenador.usuario.id);
    expect(linhas.map((l) => l.estudanteId)).toEqual([sumido.id]);
    expect(linhas[0]).toMatchObject({ textoMotivo: "3 faltas seguidas" });
    expect(linhas.some((l) => l.estudanteId === presente.id)).toBe(false);
    const outro = await turmaComEstudantes(1);
    expect((await painelDeEvasao(outro.coordenador.usuario.id)).some((l) => l.estudanteId === sumido.id)).toBe(false);
  });

  it("INV-050-02: matrícula trancada sai do painel", async () => {
    const { coordenador, sumido, turma } = await turmaComChamada([false, false, false]);
    await prisma.matricula.update({ where: { estudanteId_turmaId: { estudanteId: sumido.id, turmaId: turma.id } }, data: { situacao: "Trancada" } });
    expect(await painelDeEvasao(coordenador.usuario.id)).toEqual([]);
  });

  it("AC-050-05 / INV-050-03 / INV-050-01: o coordenador é notificado uma vez por estudante e turma; nada de evasão é gravado", async () => {
    const { coordenador, sumido } = await turmaComChamada([true, false, false, false]);
    const quem = sessao(coordenador.usuario.id, "Coordenador");
    await consultarEvasao(quem);
    await consultarEvasao(quem);
    const avisos = await prisma.notificacao.findMany({ where: { usuarioId: coordenador.usuario.id, tipo: "Evasao" } });
    expect(avisos).toHaveLength(1);
    expect(avisos[0].chave).toContain(sumido.id);
    expect(await consultarEvasao(sessao(sumido.id, "Estudante"))).toBeNull();
  });
});
