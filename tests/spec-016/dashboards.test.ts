// SPEC-016 — dashboards por perfil: cálculos (unitário) e consultas com escopo (integração).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { hojeEmBrasilia } from "@/domain/atividades";
import { painelDoPerfil, podeAcessar, RECURSOS } from "@/domain/autorizacao";
import { contarContas, dentroDosProximosDias, frequenciaGeral, mediaGeral, proximosPrazos, riscoSemPlano, situacaoPorCurso, somarDias } from "@/domain/dashboard";
import { PERFIS } from "@/domain/perfil";
import { POST as login } from "@/app/api/auth/login/route";
import { consultarDashboardAdministrador, consultarDashboardEstudante, consultarDashboardProfessor } from "@/server/academico/dashboard";
import { recalcularIndicador } from "@/server/academico/indicador";
import { consultarPainelCoordenador } from "@/server/academico/painel-coordenador";
import { gerarRelatorio } from "@/server/academico/relatorios";
import type { Sessao } from "@/server/auth/token";
import { paraData } from "@/server/dados/atividades";
import { prisma } from "@/server/dados/prisma";
import { PREFIXO_DISCIPLINA_TESTE, criarCursoDeTeste, criarUsuarioDeTeste, removerUsuariosDeTeste, requisicaoDeLogin } from "../apoio";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const sessaoDe = (u: { id: string; nome: string }, perfil: Sessao["perfil"]): Sessao => ({ usuarioId: u.id, nome: u.nome, perfil });
const contagem = (Normal: number, Atencao: number, Risco: number, SemDados = 0) => ({ Normal, Atencao, Risco, SemDados });

// Turma do curso com estudantes: cada um com nota (ou null) e frequência (ou null); o indicador sai da regra única.
async function turma(cursoId: string, professorId: string, alunos: { id: string; nota: number | null; freq: number | null }[]) {
  const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60 } });
  await prisma.cursoDisciplina.create({ data: { cursoId, disciplinaId: disciplina.id } });
  const t = await prisma.turma.create({ data: { nome: `T-${randomUUID().slice(0, 4)}`, periodo: "2026/2", disciplinaId: disciplina.id, professorId, cursoId } });
  const avaliacao = await prisma.avaliacao.create({ data: { turmaId: t.id, nome: "Prova 1", peso: 1, data: new Date("2026-09-15") } });
  for (const a of alunos) {
    await prisma.matricula.create({ data: { estudanteId: a.id, turmaId: t.id } });
    if (a.nota !== null) await prisma.nota.create({ data: { avaliacaoId: avaliacao.id, estudanteId: a.id, valor: a.nota } });
    if (a.freq !== null) await prisma.frequencia.create({ data: { estudanteId: a.id, turmaId: t.id, percentual: a.freq } });
    if (a.nota !== null || a.freq !== null) await recalcularIndicador(a.id, t.id);
  }
  return t;
}

describe("SPEC-016 — cálculos dos dashboards (sem banco)", () => {
  it("INV-016-03 / AC-016-02: média geral e frequência geral são médias simples dos valores existentes", () => {
    expect(mediaGeral([{ media: 7 }, { media: 5 }, { media: null }])).toBe(6);
    expect(frequenciaGeral([{ frequencia: 80 }, { frequencia: null }, { frequencia: 90 }])).toBe(85);
    expect(mediaGeral([{ media: null }])).toBeNull();
    expect(frequenciaGeral([])).toBeNull();
  });

  it("INV-016-04 / AC-016-03: próximos prazos = de hoje até 7 dias depois, sem entrega, do mais próximo ao mais distante", () => {
    const hoje = "2026-10-22";
    const lista = proximosPrazos(
      [
        { id: "dez", prazo: "2026-11-01", entregue: false },
        { id: "tres", prazo: "2026-10-25", entregue: false },
        { id: "hoje", prazo: "2026-10-22", entregue: false },
        { id: "entregue", prazo: "2026-10-24", entregue: true },
        { id: "ontem", prazo: "2026-10-21", entregue: false },
        { id: "sete", prazo: "2026-10-29", entregue: false },
      ],
      hoje,
    );
    expect(lista.map((a) => a.id)).toEqual(["hoje", "tres", "sete"]);
    expect(somarDias("2026-12-30", 3)).toBe("2027-01-02");
    expect(dentroDosProximosDias("2026-10-30", hoje)).toBe(false);
  });

  it("RF-25: contas por perfil contam só as ativas; desativadas e senha provisória à parte", () => {
    const c = contarContas([
      { perfil: "Estudante", ativo: true, trocarSenha: true },
      { perfil: "Estudante", ativo: true, trocarSenha: false },
      { perfil: "Professor", ativo: false, trocarSenha: true },
      { perfil: "Administrador", ativo: true, trocarSenha: false },
    ]);
    expect(c).toEqual({ ativasPorPerfil: { Estudante: 2, Professor: 0, Coordenador: 0, Administrador: 1 }, ativas: 3, desativadas: 1, aguardandoSenha: 1 });
  });

  it("RB-11: estudante em Risco sem plano ativo na mesma turma", () => {
    const sem = riscoSemPlano(
      [{ estudanteId: "a", turmaId: "t1" }, { estudanteId: "a", turmaId: "t2" }, { estudanteId: "b", turmaId: "t1" }],
      [{ estudanteId: "a", turmaId: "t1" }],
    );
    expect(sem).toEqual([{ estudanteId: "a", turmaId: "t2" }, { estudanteId: "b", turmaId: "t1" }]);
  });

  it("INV-016-02: a situação por curso é a soma das turmas do curso", () => {
    const porCurso = situacaoPorCurso([
      { cursoId: "eco", curso: "Eng. da Computação", estudantes: 3, contagem: contagem(1, 1, 1) },
      { cursoId: "cc", curso: "Ciência da Computação", estudantes: 2, contagem: contagem(2, 0, 0) },
      { cursoId: "eco", curso: "Eng. da Computação", estudantes: 2, contagem: contagem(0, 0, 1, 1) },
    ]);
    expect(porCurso).toEqual([
      { id: "cc", rotulo: "Ciência da Computação", estudantes: 2, contagem: contagem(2, 0, 0) },
      { id: "eco", rotulo: "Eng. da Computação", estudantes: 5, contagem: contagem(1, 1, 2, 1) },
    ]);
  });

  it("INV-016-05: o dashboard do administrador é só dele; os outros perfis não o acessam", () => {
    for (const perfil of PERFIS) expect(podeAcessar(perfil, RECURSOS.painelAdministrador)).toBe(perfil === "Administrador");
  });
});

describe("SPEC-016 — dashboards com banco", () => {
  it("AC-016-01: cada perfil entra direto no próprio dashboard", async () => {
    const destinos: Record<string, string> = { Estudante: "/estudante", Professor: "/professor", Coordenador: "/coordenador", Administrador: "/admin" };
    for (const perfil of PERFIS) {
      const usuario = await criarUsuarioDeTeste(perfil);
      const resposta = await login(requisicaoDeLogin(usuario.email, usuario.senha));
      expect((await resposta.json()).destino).toBe(destinos[perfil]);
      expect(painelDoPerfil(perfil)).toBe(destinos[perfil]);
    }
  });

  it("AC-016-02 / AC-016-03 / AC-016-04 / INV-016-01: estudante vê média geral, próximos prazos e só os próprios dados", async () => {
    const coordenador = await criarUsuarioDeTeste("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    const ana = await criarUsuarioDeTeste("Estudante", { cursoId: coordenador.cursoId });
    const bia = await criarUsuarioDeTeste("Estudante", { cursoId: coordenador.cursoId });
    const t1 = await turma(coordenador.cursoId, professor.id, [{ id: ana.id, nota: 7, freq: 90 }, { id: bia.id, nota: 2, freq: 50 }]);
    await turma(coordenador.cursoId, professor.id, [{ id: ana.id, nota: 5, freq: 80 }]);
    await turma(coordenador.cursoId, professor.id, [{ id: ana.id, nota: null, freq: null }]);

    const hoje = hojeEmBrasilia();
    const atividade = (descricao: string, dias: number) => prisma.atividade.create({ data: { turmaId: t1.id, descricao, prazo: paraData(somarDias(hoje, dias)) } });
    await atividade("Em 3 dias", 3);
    await atividade("Em 10 dias", 10);
    const entregue = await atividade("Entregue, em 2 dias", 2);
    await prisma.entrega.create({ data: { atividadeId: entregue.id, estudanteId: ana.id, dataEntrega: paraData(hoje) } });

    const painel = await consultarDashboardEstudante(sessaoDe(ana, "Estudante"), hoje);
    expect(painel.resumo.mediaGeral).toBe(6);
    expect(painel.resumo.frequenciaGeral).toBe(85);
    expect(painel.proximosPrazos.map((a) => a.descricao)).toEqual(["Em 3 dias"]);
    expect(painel.curso).toMatch(/^vitest-curso-/);
    // A colega em Risco na mesma turma não aparece em lugar nenhum do dashboard de Ana.
    expect(JSON.stringify(painel)).not.toContain(bia.id);
    expect(painel.resumo.turmasEmRisco).toBe(0);
  });

  it("AC-016-05 / AC-016-06 / INV-016-02: professor vê as turmas que leciona com os números do relatório e os planos", async () => {
    const coordenador = await criarUsuarioDeTeste("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    const outro = await criarUsuarioDeTeste("Professor");
    const [a, b, c] = await Promise.all([1, 2, 3].map(() => criarUsuarioDeTeste("Estudante", { cursoId: coordenador.cursoId })));
    const t1 = await turma(coordenador.cursoId, professor.id, [{ id: a.id, nota: 8, freq: 90 }, { id: b.id, nota: 3, freq: 90 }]);
    await turma(coordenador.cursoId, professor.id, [{ id: c.id, nota: 5.5, freq: 60 }]);
    const alheia = await turma(coordenador.cursoId, outro.id, [{ id: a.id, nota: 2, freq: 40 }]);
    await prisma.planoRecuperacao.create({
      data: { estudanteId: b.id, turmaId: t1.id, professorId: professor.id, itens: { create: [{ descricao: "x", ordem: 0, concluido: true }, { descricao: "y", ordem: 1 }] } },
    });

    const sessao = sessaoDe(professor, "Professor");
    const painel = await consultarDashboardProfessor(sessao);
    const relatorio = await gerarRelatorio(sessao, {});
    expect(relatorio.ok && painel.resumo).toEqual(relatorio.ok && relatorio.relatorio.resumo);
    expect(painel.turmas.map((t) => t.id)).not.toContain(alheia.id);
    expect(painel.totais).toMatchObject({ turmas: 2, estudantes: 3, emRisco: 2, planosAtivos: 1, progressoMedio: 50 });
    expect(painel.planos).toEqual([expect.objectContaining({ progresso: { concluidos: 1, total: 2, percentual: 50 } })]);
    expect(painel.semPlano).toHaveLength(1);
  });

  it("AC-016-07 / AC-016-08: coordenador com 2 cursos filtra por curso; curso de outro coordenador é ignorado", async () => {
    const marina = await criarUsuarioDeTeste("Coordenador");
    const cc = await criarCursoDeTeste(marina.id);
    const outro = await criarUsuarioDeTeste("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    const doEco = await criarUsuarioDeTeste("Estudante", { cursoId: marina.cursoId });
    const doCc = await criarUsuarioDeTeste("Estudante", { cursoId: cc });
    const tEco = await turma(marina.cursoId, professor.id, [{ id: doEco.id, nota: 3, freq: 90 }]);
    const tCc = await turma(cc, professor.id, [{ id: doCc.id, nota: 9, freq: 95 }]);
    await turma(outro.cursoId, professor.id, []);

    const sessao = sessaoDe(marina, "Coordenador");
    const todos = await consultarPainelCoordenador(sessao);
    expect(todos.filtro).toBeNull();
    expect(todos.resumo.map((r) => r.id).sort()).toEqual([tEco.id, tCc.id].sort());
    expect(todos.porCurso.map((p) => [p.id, p.contagem.Risco, p.contagem.Normal]).sort()).toEqual([[cc, 0, 1], [marina.cursoId, 1, 0]].sort());
    expect(todos.totais).toMatchObject({ cursos: 2, turmas: 2, estudantes: 2, emRisco: 1, riscoSemPlano: 1 });

    const soCc = await consultarPainelCoordenador(sessao, cc);
    expect(soCc.filtro?.id).toBe(cc);
    expect(soCc.resumo.map((r) => r.id)).toEqual([tCc.id]);
    expect(soCc.totais).toMatchObject({ cursos: 1, turmas: 1, emRisco: 0 });

    const alheio = await consultarPainelCoordenador(sessao, outro.cursoId);
    expect(alheio.filtro).toBeNull();
    expect(alheio.resumo.map((r) => r.id).sort()).toEqual([tEco.id, tCc.id].sort());
  });

  it("AC-016-09 / AC-016-10 / INV-016-05: administrador vê contas e cursos, sem dado acadêmico; conta nova aparece primeiro", async () => {
    const nova = await criarUsuarioDeTeste("Professor");
    const painel = await consultarDashboardAdministrador();

    const ativas = await prisma.usuario.count({ where: { ativo: true } });
    expect(painel.contas.ativas).toBe(ativas);
    expect(painel.contas.desativadas).toBe(await prisma.usuario.count({ where: { ativo: false } }));
    expect(painel.contas.ativasPorPerfil.Estudante).toBe(await prisma.usuario.count({ where: { ativo: true, perfil: "Estudante" } }));
    expect(painel.cursos.length).toBe(await prisma.curso.count());
    expect(painel.recentes[0].id).toBe(nova.id);

    expect(Object.keys(painel).sort()).toEqual(["contas", "coordenadores", "cursos", "recentes"]);
    expect(JSON.stringify(painel)).not.toMatch(/"(media|frequencia|situacao|nota|valor|percentual)"/);
  });

  it("AC-016-11: professor sem turmas e coordenador sem cursos recebem dashboard vazio", async () => {
    const professor = await criarUsuarioDeTeste("Professor");
    const coordenador = await criarUsuarioDeTeste("Coordenador", { semCurso: true });
    const p = await consultarDashboardProfessor(sessaoDe(professor, "Professor"));
    const c = await consultarPainelCoordenador(sessaoDe(coordenador, "Coordenador"));
    expect(p.turmas).toEqual([]);
    expect(p.totais).toMatchObject({ turmas: 0, estudantes: 0, emRisco: 0, planosAtivos: 0 });
    expect(c.cursos).toEqual([]);
    expect(c.totais).toMatchObject({ cursos: 0, turmas: 0, estudantes: 0, emRisco: 0 });
  });

  it("INV-016-06: abrir os dashboards não grava nada", async () => {
    const coordenador = await criarUsuarioDeTeste("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    const estudante = await criarUsuarioDeTeste("Estudante", { cursoId: coordenador.cursoId });
    await turma(coordenador.cursoId, professor.id, [{ id: estudante.id, nota: 4, freq: 70 }]);
    const contar = () => Promise.all([prisma.indicadorAcademico.count(), prisma.planoRecuperacao.count(), prisma.entrega.count(), prisma.historicoNota.count(), prisma.usuario.count()]);

    const antes = await contar();
    await consultarDashboardEstudante(sessaoDe(estudante, "Estudante"));
    await consultarDashboardProfessor(sessaoDe(professor, "Professor"));
    await consultarPainelCoordenador(sessaoDe(coordenador, "Coordenador"));
    await consultarDashboardAdministrador();
    expect(await contar()).toEqual(antes);
  });
});
