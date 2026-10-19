// SPEC-014 — painel do coordenador: ordenação das turmas que pedem atenção (unitário) e números do painel (integração).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { SITUACOES_RELATORIO, turmasQuePedemAtencao } from "@/domain/relatorio";
import { FAIXAS } from "@/components/graficos-coordenador";
import { consultarPainelCoordenador } from "@/server/academico/painel-coordenador";
import { gerarRelatorio } from "@/server/academico/relatorios";
import { recalcularIndicador } from "@/server/academico/indicador";
import { prisma } from "@/server/dados/prisma";
import type { Sessao } from "@/server/auth/token";
import { PREFIXO_DISCIPLINA_TESTE, criarUsuarioDeTeste, removerUsuariosDeTeste } from "../apoio";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const resumo = (rotulo: string, risco: number, atrasadas: number) => ({
  rotulo, entregasAtrasadas: atrasadas, contagem: { Normal: 0, Atencao: 0, Risco: risco, SemDados: 0 },
});

// Turma do coordenador com `risco` estudantes em Risco (frequência 60%) e `normais` em Normal.
async function turma(coordenadorId: string, professorId: string, nome: string, risco: number, normais: number, estudantesRisco: { id: string }[] = []) {
  const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60 } });
  const t = await prisma.turma.create({ data: { nome, periodo: "2026/2", disciplinaId: disciplina.id, professorId, coordenadorId } });
  const emRisco = [...estudantesRisco];
  while (emRisco.length < risco) emRisco.push(await criarUsuarioDeTeste("Estudante"));
  for (const [i, e] of [...emRisco, ...(await Promise.all(Array.from({ length: normais }, () => criarUsuarioDeTeste("Estudante"))))].entries()) {
    await prisma.matricula.create({ data: { estudanteId: e.id, turmaId: t.id } });
    await prisma.frequencia.create({ data: { estudanteId: e.id, turmaId: t.id, percentual: i < risco ? 60 : 95 } });
    await recalcularIndicador(e.id, t.id);
  }
  return { turma: t, emRisco };
}

describe("SPEC-014 — regra de domínio", () => {
  it("Turmas que pedem atenção: mais Risco primeiro, depois mais atrasadas; turma sem Risco nem atraso fica de fora", () => {
    const ordem = turmasQuePedemAtencao([resumo("B", 1, 9), resumo("A", 3, 0), resumo("C", 1, 2), resumo("D", 0, 0), resumo("E", 0, 4)]);
    expect(ordem.map((t) => t.rotulo)).toEqual(["A", "B", "C", "E"]);
    expect(turmasQuePedemAtencao(Array.from({ length: 8 }, (_, i) => resumo(`T${i}`, 1, 0))).length).toBe(5);
  });

  it("INV-014-03 / RNF-06: toda situação do gráfico tem cor, símbolo e rótulo", () => {
    expect(FAIXAS.map((f) => f.chave)).toEqual([...SITUACOES_RELATORIO]);
    for (const f of FAIXAS) {
      expect(f.simbolo).not.toBe("");
      expect(f.rotulo).not.toBe("");
      expect(f.barra).toMatch(/^bg-/);
    }
    expect(FAIXAS.map((f) => f.simbolo)).toEqual(["●", "▲", "■", "–"]);
  });
});

describe("SPEC-014 — painel do coordenador", () => {
  it("AC-014-01 / AC-014-02: totais com estudantes em Risco (sem contar duas vezes) e a turma com mais Risco primeiro", async () => {
    const coordenador = await criarUsuarioDeTeste("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    const x = await turma(coordenador.id, professor.id, "Turma X", 3, 1);
    // Um dos estudantes em Risco da X também está em Risco na Y: conta uma vez só.
    await turma(coordenador.id, professor.id, "Turma Y", 1, 2, [x.emRisco[0]]);
    const sessao: Sessao = { usuarioId: coordenador.id, nome: coordenador.nome, perfil: "Coordenador" };

    const painel = await consultarPainelCoordenador(sessao);

    expect(painel.totais).toMatchObject({ turmas: 2, estudantes: 6, emRisco: 3 });
    expect(painel.atencao.map((t) => t.rotulo.split(" · ")[0])).toEqual(["Turma X", "Turma Y"]);
  });

  it("AC-014-03 / INV-014-01: os números por turma são os mesmos do relatório", async () => {
    const coordenador = await criarUsuarioDeTeste("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    await turma(coordenador.id, professor.id, "Turma Z", 2, 3);
    const sessao: Sessao = { usuarioId: coordenador.id, nome: coordenador.nome, perfil: "Coordenador" };

    const painel = await consultarPainelCoordenador(sessao);
    const relatorio = await gerarRelatorio(sessao, {});

    expect(relatorio.ok && relatorio.relatorio.resumo).toEqual(painel.resumo);
    expect(painel.resumo[0]).toMatchObject({ estudantes: 5, contagem: { Normal: 3, Atencao: 0, Risco: 2, SemDados: 0 } });
  });

  it("AC-014-04 / INV-014-02: coordenador não vê turmas de outro coordenador", async () => {
    const dono = await criarUsuarioDeTeste("Coordenador");
    const outro = await criarUsuarioDeTeste("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    await turma(dono.id, professor.id, "Turma W", 1, 1);

    const painel = await consultarPainelCoordenador({ usuarioId: outro.id, nome: outro.nome, perfil: "Coordenador" });

    expect(painel.totais).toMatchObject({ turmas: 0, estudantes: 0, emRisco: 0 });
    expect(painel.resumo).toEqual([]);
  });
});
