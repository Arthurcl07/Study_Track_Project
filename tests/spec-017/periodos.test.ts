// SPEC-017 — período letivo: regras de domínio (unitário) e rotas + banco (integração).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { mensagemPeriodoEncerrado, ordenarPeriodos, validarPeriodo } from "@/domain/periodos";
import { POST as desativarApi } from "@/app/api/contas/[id]/desativar/route";
import { POST as registrarEntregaApi } from "@/app/api/atividades/[id]/entregas/route";
import { GET as alertasApi } from "@/app/api/alertas/route";
import { PATCH as alterarNotaApi } from "@/app/api/notas/[id]/route";
import { POST as registrarNotaApi } from "@/app/api/notas/route";
import { POST as encerrarApi } from "@/app/api/periodos/[id]/encerrar/route";
import { POST as reabrirApi } from "@/app/api/periodos/[id]/reabrir/route";
import { GET as listarPeriodosApi, POST as criarPeriodoApi } from "@/app/api/periodos/route";
import { POST as criarPlanoApi } from "@/app/api/planos/route";
import { GET as relatorioApi } from "@/app/api/relatorios/route";
import { POST as cadastrarAtividadeApi } from "@/app/api/turmas/[id]/atividades/route";
import { POST as cadastrarAvaliacaoApi } from "@/app/api/turmas/[id]/avaliacoes/route";
import { POST as matricularApi } from "@/app/api/turmas/[id]/matriculas/route";
import { POST as trocarProfessorApi } from "@/app/api/turmas/[id]/professor/route";
import { POST as cadastrarTurmaApi } from "@/app/api/turmas/route";
import { consultarDashboardEstudante, consultarDashboardProfessor } from "@/server/academico/dashboard";
import { recalcularIndicador } from "@/server/academico/indicador";
import { prisma } from "@/server/dados/prisma";
import {
  PREFIXO_DISCIPLINA_TESTE,
  criarPeriodoDeTeste,
  criarUsuarioDeTeste,
  entrarComo,
  parametros,
  removerUsuariosDeTeste,
  requisicaoComSessao,
  requisicaoJson,
} from "../apoio";

const API = "http://localhost/api";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

async function entrar(perfil: "Estudante" | "Professor" | "Coordenador" | "Administrador", opcoes: { cursoId?: string } = {}) {
  const usuario = await criarUsuarioDeTeste(perfil, opcoes);
  return { usuario, token: await entrarComo(usuario.email, usuario.senha) };
}

async function json(resposta: Response) {
  return { status: resposta.status, corpo: await resposta.json() };
}

// Cenário: coordenador com curso, professor, estudante do curso e uma turma no período informado.
async function cenario(periodo: string) {
  const coordenador = await entrar("Coordenador");
  const professor = await entrar("Professor");
  const estudante = await entrar("Estudante", { cursoId: coordenador.usuario.cursoId });
  const disciplina = await prisma.disciplina.create({
    data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60, cursos: { create: { cursoId: coordenador.usuario.cursoId } } },
  });
  const turma = await prisma.turma.create({
    data: { nome: "T", periodo, disciplinaId: disciplina.id, professorId: professor.usuario.id, cursoId: coordenador.usuario.cursoId },
  });
  await prisma.matricula.create({ data: { estudanteId: estudante.usuario.id, turmaId: turma.id } });
  return { coordenador, professor, estudante, disciplina, turma };
}

describe("SPEC-017 — regras de domínio (sem banco)", () => {
  it("INV-017-02: nome do período no formato AAAA/1 ou AAAA/2", () => {
    expect(validarPeriodo({ nome: " 2027/1 " })).toEqual({ ok: true, dados: { nome: "2027/1" } });
    for (const nome of ["2027-1", "2027/3", "27/1", ""]) expect(validarPeriodo({ nome }).ok).toBe(false);
  });

  it("RB-20: mensagem da trava cita o período", () => {
    expect(mensagemPeriodoEncerrado("2026/1")).toBe("O período 2026/1 está encerrado: a turma é somente leitura.");
  });

  it("períodos do mais recente para o mais antigo", () => {
    expect(ordenarPeriodos([{ nome: "2026/1" }, { nome: "2027/1" }, { nome: "2026/2" }]).map((p) => p.nome)).toEqual(["2027/1", "2026/2", "2026/1"]);
  });
});

describe("SPEC-017 — cadastro, encerramento e reabertura (integração)", () => {
  it("AC-017-01: administrador cria período, que nasce Aberto e aparece na lista", async () => {
    const admin = await entrar("Administrador");
    const nome = `19${String(Math.floor(Math.random() * 90) + 10)}/2`;
    await prisma.periodoLetivo.deleteMany({ where: { nome } });
    const criado = await json(await criarPeriodoApi(requisicaoJson(`${API}/periodos`, { nome }, admin.token)));
    expect(criado.status).toBe(201);
    expect(criado.corpo.status).toBe("Aberto");
    const lista = await json(await listarPeriodosApi(requisicaoComSessao(`${API}/periodos`, admin.token)));
    expect(lista.corpo.some((p: { nome: string }) => p.nome === nome)).toBe(true);
  });

  it("AC-017-02: formato inválido e nome repetido são recusados com o campo", async () => {
    const admin = await entrar("Administrador");
    const existente = await criarPeriodoDeTeste();
    for (const nome of ["2027-1", "2027/3", existente.nome]) {
      const r = await json(await criarPeriodoApi(requisicaoJson(`${API}/periodos`, { nome }, admin.token)));
      expect(r.status).toBe(400);
      expect(r.corpo.campos.nome).toBeTruthy();
    }
  });

  it("AC-017-09 / INV-017-06: coordenador e professor não criam, encerram nem reabrem período", async () => {
    const periodo = await criarPeriodoDeTeste();
    for (const perfil of ["Coordenador", "Professor"] as const) {
      const { token } = await entrar(perfil);
      expect((await criarPeriodoApi(requisicaoJson(`${API}/periodos`, { nome: "1901/1" }, token))).status).toBe(403);
      expect((await encerrarApi(requisicaoJson(`${API}/periodos/${periodo.id}/encerrar`, {}, token), parametros(periodo.id))).status).toBe(403);
      expect((await reabrirApi(requisicaoJson(`${API}/periodos/${periodo.id}/reabrir`, {}, token), parametros(periodo.id))).status).toBe(403);
    }
  });

  it("AC-017-03 / RB-20 / INV-017-03: em período encerrado, nota, avaliação, atividade, entrega e plano são recusados (409) e nada é gravado", async () => {
    const periodo = await criarPeriodoDeTeste();
    const { professor, estudante, turma } = await cenario(periodo.nome);
    const avaliacao = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "P1", peso: 1, data: new Date() } });
    const nota = await prisma.nota.create({ data: { avaliacaoId: avaliacao.id, estudanteId: estudante.usuario.id, valor: 3 } });
    await recalcularIndicador(estudante.usuario.id, turma.id);
    const atividade = await prisma.atividade.create({ data: { turmaId: turma.id, descricao: "A", prazo: new Date("2026-01-10") } });

    const admin = await entrar("Administrador");
    expect((await encerrarApi(requisicaoJson(`${API}/periodos/${periodo.id}/encerrar`, {}, admin.token), parametros(periodo.id))).status).toBe(200);

    const t = professor.token;
    const respostas = [
      await registrarNotaApi(requisicaoJson(`${API}/notas`, { turmaId: turma.id, avaliacaoId: avaliacao.id, estudanteId: estudante.usuario.id, valor: 9 }, t)),
      await alterarNotaApi(requisicaoJson(`${API}/notas/${nota.id}`, { valor: 9 }, t, "PATCH"), parametros(nota.id)),
      await cadastrarAvaliacaoApi(requisicaoJson(`${API}/turmas/${turma.id}/avaliacoes`, { nome: "P2", peso: 1, data: "2026-01-10" }, t), parametros(turma.id)),
      await cadastrarAtividadeApi(requisicaoJson(`${API}/turmas/${turma.id}/atividades`, { descricao: "B", prazo: "2026-01-20" }, t), parametros(turma.id)),
      await registrarEntregaApi(requisicaoJson(`${API}/atividades/${atividade.id}/entregas`, { estudanteId: estudante.usuario.id, dataEntrega: "2026-01-05" }, t), parametros(atividade.id)),
      await criarPlanoApi(requisicaoJson(`${API}/planos`, { turmaId: turma.id, estudanteId: estudante.usuario.id, itens: ["Estudar"] }, t)),
    ];
    for (const r of respostas) {
      const corpo = await json(r);
      expect(corpo.status).toBe(409);
      expect(corpo.corpo.erro).toBe(mensagemPeriodoEncerrado(periodo.nome));
    }
    expect((await prisma.nota.findUnique({ where: { id: nota.id } }))?.valor).toBe(3);
    expect(await prisma.avaliacao.count({ where: { turmaId: turma.id } })).toBe(1);
    expect(await prisma.atividade.count({ where: { turmaId: turma.id } })).toBe(1);
    expect(await prisma.entrega.count({ where: { atividadeId: atividade.id } })).toBe(0);
    expect(await prisma.planoRecuperacao.count({ where: { turmaId: turma.id } })).toBe(0);
  });

  it("AC-017-04: em período encerrado, coordenador não matricula, não troca professor nem cria turma", async () => {
    const periodo = await criarPeriodoDeTeste("Encerrado");
    const { coordenador, disciplina, turma, professor } = await cenario(periodo.nome);
    const outro = await entrar("Estudante", { cursoId: coordenador.usuario.cursoId });
    const outroProfessor = await entrar("Professor");
    const t = coordenador.token;
    expect((await matricularApi(requisicaoJson(`${API}/turmas/${turma.id}/matriculas`, { email: outro.usuario.email }, t), parametros(turma.id))).status).toBe(409);
    expect((await trocarProfessorApi(requisicaoJson(`${API}/turmas/${turma.id}/professor`, { professorId: outroProfessor.usuario.id }, t), parametros(turma.id))).status).toBe(409);
    const nova = await json(await cadastrarTurmaApi(requisicaoJson(`${API}/turmas`, { nome: "Nova", periodo: periodo.nome, disciplinaId: disciplina.id, professorId: professor.usuario.id }, t)));
    expect(nova.status).toBe(400);
    expect(nova.corpo.campos.periodo).toBeTruthy();
    expect(await prisma.matricula.count({ where: { turmaId: turma.id } })).toBe(1);
  });

  it("AC-017-05: encerrado e reaberto, o professor volta a lançar nota", async () => {
    const periodo = await criarPeriodoDeTeste();
    const { professor, estudante, turma } = await cenario(periodo.nome);
    const avaliacao = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "P1", peso: 1, data: new Date() } });
    const admin = await entrar("Administrador");
    await encerrarApi(requisicaoJson(`${API}/periodos/${periodo.id}/encerrar`, {}, admin.token), parametros(periodo.id));
    const reaberto = await json(await reabrirApi(requisicaoJson(`${API}/periodos/${periodo.id}/reabrir`, {}, admin.token), parametros(periodo.id)));
    expect(reaberto.corpo.status).toBe("Aberto");
    const nota = await registrarNotaApi(requisicaoJson(`${API}/notas`, { turmaId: turma.id, avaliacaoId: avaliacao.id, estudanteId: estudante.usuario.id, valor: 8 }, professor.token));
    expect(nota.status).toBe(201);
  });
});

describe("SPEC-017 — filtros de período (integração)", () => {
  it("AC-017-06 / INV-017-05: dashboards do estudante e do professor, alertas e relatório sem filtro mostram só períodos abertos", async () => {
    const encerrado = await criarPeriodoDeTeste("Encerrado");
    const aberto = await criarPeriodoDeTeste("Aberto");
    const { professor, estudante, turma: antiga, coordenador } = await cenario(encerrado.nome);
    const disciplina = await prisma.disciplina.create({
      data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60, cursos: { create: { cursoId: coordenador.usuario.cursoId } } },
    });
    const atual = await prisma.turma.create({ data: { nome: "Atual", periodo: aberto.nome, disciplinaId: disciplina.id, professorId: professor.usuario.id, cursoId: coordenador.usuario.cursoId } });
    await prisma.matricula.create({ data: { estudanteId: estudante.usuario.id, turmaId: atual.id } });
    // Estudante em Risco na turma antiga: não deve gerar alerta (período encerrado).
    await prisma.frequencia.create({ data: { estudanteId: estudante.usuario.id, turmaId: antiga.id, percentual: 50 } });
    await recalcularIndicador(estudante.usuario.id, antiga.id);

    const sessaoEstudante = { usuarioId: estudante.usuario.id, perfil: "Estudante" as const, nome: "E" };
    const sessaoProfessor = { usuarioId: professor.usuario.id, perfil: "Professor" as const, nome: "P" };
    expect((await consultarDashboardEstudante(sessaoEstudante)).turmas.map((t) => t.id)).toEqual([atual.id]);
    expect((await consultarDashboardProfessor(sessaoProfessor)).turmas.map((t) => t.id)).toEqual([atual.id]);
    const alertas = await json(await alertasApi(requisicaoComSessao(`${API}/alertas`, estudante.token)));
    expect(alertas.corpo.some((a: { turma: { id: string } }) => a.turma.id === antiga.id)).toBe(false);
    const relatorio = await json(await relatorioApi(requisicaoComSessao(`${API}/relatorios`, coordenador.token)));
    expect(relatorio.corpo.resumo.map((r: { id: string }) => r.id)).toEqual([atual.id]);
  });

  it("AC-017-07: coordenador filtra o relatório pelo período encerrado e vê só as turmas dele", async () => {
    const encerrado = await criarPeriodoDeTeste("Encerrado");
    const { coordenador, turma } = await cenario(encerrado.nome);
    const relatorio = await json(await relatorioApi(requisicaoComSessao(`${API}/relatorios?periodo=${encodeURIComponent(encerrado.nome)}`, coordenador.token)));
    expect(relatorio.corpo.periodo).toBe(encerrado.nome);
    expect(relatorio.corpo.resumo.map((r: { id: string }) => r.id)).toEqual([turma.id]);
    // Outro coordenador não tem turma nesse período: o filtro é ignorado e nada aparece.
    const outro = await entrar("Coordenador");
    const alheio = await json(await relatorioApi(requisicaoComSessao(`${API}/relatorios?periodo=${encodeURIComponent(encerrado.nome)}`, outro.token)));
    expect(alheio.corpo.periodo).toBeNull();
    expect(alheio.corpo.resumo).toEqual([]);
  });

  it("AC-017-08 / INV-017-07 / RB-14: professor só com turmas de período encerrado pode ser desativado", async () => {
    const encerrado = await criarPeriodoDeTeste("Encerrado");
    const { professor } = await cenario(encerrado.nome);
    const admin = await entrar("Administrador");
    const r = await desativarApi(requisicaoJson(`${API}/contas/${professor.usuario.id}/desativar`, {}, admin.token), parametros(professor.usuario.id));
    expect(r.status).toBe(200);
    expect((await prisma.usuario.findUnique({ where: { id: professor.usuario.id } }))?.ativo).toBe(false);
  });
});
