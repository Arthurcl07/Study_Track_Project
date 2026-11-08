// SPEC-026 — correção de cadastros: motivos de recusa (unitário) e edição/exclusão com escopo, trava, recálculo e
// auditoria (integração).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { motivoParaNaoExcluirTurma, motivoParaNaoTirarDaTurma, validarEdicaoConta } from "@/domain/correcoes";
import { hojeEmBrasilia } from "@/domain/atividades";
import { PATCH as editarContaApi } from "@/app/api/contas/[id]/route";
import { DELETE as excluirDisciplinaApi, PATCH as editarDisciplinaApi } from "@/app/api/disciplinas/[id]/route";
import { DELETE as excluirTurmaApi, PATCH as editarTurmaApi } from "@/app/api/turmas/[id]/route";
import { DELETE as tirarApi } from "@/app/api/turmas/[id]/matriculas/[estudanteId]/route";
import { DELETE as excluirAvaliacaoApi, PATCH as editarAvaliacaoApi } from "@/app/api/avaliacoes/[id]/route";
import { DELETE as excluirAtividadeApi, PATCH as editarAtividadeApi } from "@/app/api/atividades/[id]/route";
import { DELETE as excluirAulaApi, PATCH as editarAulaApi } from "@/app/api/aulas/[id]/route";
import { POST as chamadaApi } from "@/app/api/aulas/route";
import { recalcularIndicador } from "@/server/academico/indicador";
import { NOME_COOKIE_SESSAO } from "@/server/auth/token";
import { prisma } from "@/server/dados/prisma";
import { PREFIXO_DISCIPLINA_TESTE, criarPeriodoDeTeste, criarUsuarioDeTeste, entrarComo, parametros, removerUsuariosDeTeste, requisicaoJson, periodoAbertoDeTeste } from "../apoio";

const API = "http://localhost/api";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const patch = (url: string, corpo: unknown, token: string) => requisicaoJson(url, corpo, token, "PATCH");
const del = (url: string, token: string) => new Request(url, { method: "DELETE", headers: { cookie: `${NOME_COOKIE_SESSAO}=${token}` } });
const auditorias = (acao: string, turmaId?: string) => prisma.registroAuditoria.count({ where: { acao, ...(turmaId ? { turmaId } : {}) } });

async function entrar(perfil: "Estudante" | "Professor" | "Coordenador" | "Administrador", opcoes: { cursoId?: string } = {}) {
  const usuario = await criarUsuarioDeTeste(perfil, opcoes);
  return { usuario, token: await entrarComo(usuario.email, usuario.senha) };
}

// Turma do curso do coordenador com o professor e dois estudantes.
async function cenario(periodoPedido?: string) {
  const periodo = periodoPedido ?? (await periodoAbertoDeTeste());
  const coordenador = await entrar("Coordenador");
  const professor = await entrar("Professor");
  const cursoId = coordenador.usuario.cursoId;
  const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60, cursos: { create: { cursoId } } } });
  const turma = await prisma.turma.create({ data: { nome: "T", periodo, disciplinaId: disciplina.id, professorId: professor.usuario.id, cursoId } });
  const a = await criarUsuarioDeTeste("Estudante", { cursoId });
  const b = await criarUsuarioDeTeste("Estudante", { cursoId });
  await prisma.matricula.createMany({ data: [a, b].map((e) => ({ estudanteId: e.id, turmaId: turma.id })) });
  return { coordenador, professor, cursoId, disciplina, turma, a, b };
}

describe("SPEC-026 — regras puras (sem banco)", () => {
  it("RB-32: motivos de recusa", () => {
    expect(motivoParaNaoExcluirTurma({ matriculas: 2, avaliacoes: 1, aulas: 0, atividades: 0 })).toBe("A turma já tem 2 matrículas, 1 avaliação e não pode ser excluída.");
    expect(motivoParaNaoExcluirTurma({ matriculas: 0, avaliacoes: 0, aulas: 0, atividades: 0 })).toBeNull();
    expect(motivoParaNaoTirarDaTurma({ notas: 1, presencas: 0, entregas: 0, planos: 0 })).toMatch(/1 nota/);
    expect(motivoParaNaoTirarDaTurma({ notas: 0, presencas: 0, entregas: 0, planos: 0 })).toBeNull();
    expect(validarEdicaoConta({ nome: "", email: "x" })).toEqual({ ok: false, erros: { nome: "Informe o nome.", email: "E-mail inválido." } });
  });
});

describe("SPEC-026 — correção de cadastros (integração)", () => {
  it("AC-026-01 / AC-026-02: administrador edita nome e e-mail; e-mail repetido é recusado", async () => {
    const admin = await entrar("Administrador");
    const conta = await criarUsuarioDeTeste("Professor");
    const outro = await criarUsuarioDeTeste("Professor");
    const novoEmail = `editado-${randomUUID()}@vitest.studytrack.test`;
    const r = await editarContaApi(patch(`${API}/contas/${conta.id}`, { nome: "Nome Novo", email: novoEmail }, admin.token), parametros(conta.id));
    expect(r.status).toBe(200);
    expect(await prisma.usuario.findUnique({ where: { id: conta.id }, select: { nome: true, email: true } })).toEqual({ nome: "Nome Novo", email: novoEmail });
    expect(await prisma.registroAuditoria.count({ where: { autorId: admin.usuario.id, acao: "conta.editada" } })).toBe(1);
    const repetido = await editarContaApi(patch(`${API}/contas/${conta.id}`, { nome: "X", email: outro.email }, admin.token), parametros(conta.id));
    expect(repetido.status).toBe(400);
    expect((await repetido.json()).campos.email).toMatch(/Já existe/);
  });

  it("AC-026-03 / INV-026-02: mudar o peso recalcula a média de quem tem nota", async () => {
    const { professor, turma, a } = await cenario();
    const p1 = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "P1", peso: 1, data: new Date() } });
    const p2 = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "P2", peso: 1, data: new Date() } });
    await prisma.nota.createMany({ data: [{ avaliacaoId: p1.id, estudanteId: a.id, valor: 4 }, { avaliacaoId: p2.id, estudanteId: a.id, valor: 8 }] });
    await recalcularIndicador(a.id, turma.id);
    const r = await editarAvaliacaoApi(patch(`${API}/avaliacoes/${p2.id}`, { nome: "P2", peso: 3, data: "2026-10-10" }, professor.token), parametros(p2.id));
    expect(r.status).toBe(200);
    const indicador = await prisma.indicadorAcademico.findFirstOrThrow({ where: { estudanteId: a.id, turmaId: turma.id } });
    expect(indicador.media).toBe(7);
    expect(await auditorias("avaliacao.editada", turma.id)).toBe(1);
  });

  it("AC-026-04 / AC-026-05: avaliação com nota não é excluída; sem nota, é", async () => {
    const { professor, turma, a } = await cenario();
    const comNota = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "P1", peso: 1, data: new Date() } });
    await prisma.nota.create({ data: { avaliacaoId: comNota.id, estudanteId: a.id, valor: 5 } });
    const semNota = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "P2", peso: 1, data: new Date() } });
    const r = await excluirAvaliacaoApi(del(`${API}/avaliacoes/${comNota.id}`, professor.token), parametros(comNota.id));
    expect(r.status).toBe(409);
    expect((await r.json()).erro).toMatch(/já tem 1 nota/);
    expect((await excluirAvaliacaoApi(del(`${API}/avaliacoes/${semNota.id}`, professor.token), parametros(semNota.id))).status).toBe(200);
    expect(await prisma.avaliacao.count({ where: { turmaId: turma.id } })).toBe(1);
    expect(await auditorias("avaliacao.excluida", turma.id)).toBe(1);
  });

  it("AC-026-06 / AC-026-07 / INV-026-03: excluir aula recalcula a frequência; data futura é recusada", async () => {
    const { professor, turma, a, b } = await cenario();
    const hoje = hojeEmBrasilia();
    const ontem = new Date(`${hoje}T00:00:00Z`);
    ontem.setUTCDate(ontem.getUTCDate() - 1);
    const dataOntem = ontem.toISOString().slice(0, 10);
    const marcar = (data: string, presenteA: boolean) =>
      chamadaApi(requisicaoJson(`${API}/aulas`, { turmaId: turma.id, data, presencas: [{ estudanteId: a.id, presente: presenteA }, { estudanteId: b.id, presente: true }] }, professor.token));
    await marcar(dataOntem, false);
    await marcar(hoje, true);
    expect((await prisma.frequencia.findFirstOrThrow({ where: { estudanteId: a.id, turmaId: turma.id } })).percentual).toBe(50);
    const aula = await prisma.aula.findFirstOrThrow({ where: { turmaId: turma.id, data: new Date(`${dataOntem}T00:00:00Z`) } });

    const amanha = new Date(`${hoje}T00:00:00Z`);
    amanha.setUTCDate(amanha.getUTCDate() + 1);
    expect((await editarAulaApi(patch(`${API}/aulas/${aula.id}`, { data: amanha.toISOString().slice(0, 10) }, professor.token), parametros(aula.id))).status).toBe(400);

    expect((await excluirAulaApi(del(`${API}/aulas/${aula.id}`, professor.token), parametros(aula.id))).status).toBe(200);
    expect(await prisma.presenca.count({ where: { aulaId: aula.id } })).toBe(0);
    expect((await prisma.frequencia.findFirstOrThrow({ where: { estudanteId: a.id, turmaId: turma.id } })).percentual).toBe(100);
    expect(await auditorias("aula.excluida", turma.id)).toBe(1);
  });

  it("AC-026-08 / AC-026-09: tira da turma quem não tem registros; com nota, não", async () => {
    const { coordenador, turma, a, b } = await cenario();
    const p1 = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "P1", peso: 1, data: new Date() } });
    await prisma.nota.create({ data: { avaliacaoId: p1.id, estudanteId: a.id, valor: 5 } });
    const comNota = await tirarApi(del(`${API}/turmas/${turma.id}/matriculas/${a.id}`, coordenador.token), { params: Promise.resolve({ id: turma.id, estudanteId: a.id }) });
    expect(comNota.status).toBe(409);
    const semNada = await tirarApi(del(`${API}/turmas/${turma.id}/matriculas/${b.id}`, coordenador.token), { params: Promise.resolve({ id: turma.id, estudanteId: b.id }) });
    expect(semNada.status).toBe(200);
    expect(await prisma.matricula.count({ where: { turmaId: turma.id } })).toBe(1);
  });

  it("AC-026-10 / AC-026-11: disciplina com turma e disciplina compartilhada com outra coordenação", async () => {
    const { coordenador, disciplina, turma } = await cenario();
    expect((await excluirDisciplinaApi(del(`${API}/disciplinas/${disciplina.id}`, coordenador.token), parametros(disciplina.id))).status).toBe(409);
    expect((await excluirTurmaApi(del(`${API}/turmas/${turma.id}`, coordenador.token), parametros(turma.id))).status).toBe(409);

    const outro = await entrar("Coordenador");
    await prisma.cursoDisciplina.create({ data: { cursoId: outro.usuario.cursoId, disciplinaId: disciplina.id } });
    const r = await editarDisciplinaApi(patch(`${API}/disciplinas/${disciplina.id}`, { nome: "Nova", cargaHoraria: 80 }, coordenador.token), parametros(disciplina.id));
    expect(r.status).toBe(409);
    expect((await r.json()).erro).toMatch(/outra coordenação/);

    const sozinha = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 40, cursos: { create: { cursoId: coordenador.usuario.cursoId } } } });
    expect((await editarDisciplinaApi(patch(`${API}/disciplinas/${sozinha.id}`, { nome: `${PREFIXO_DISCIPLINA_TESTE}nova`, cargaHoraria: 80 }, coordenador.token), parametros(sozinha.id))).status).toBe(200);
    expect((await excluirDisciplinaApi(del(`${API}/disciplinas/${sozinha.id}`, coordenador.token), parametros(sozinha.id))).status).toBe(200);
    expect(await prisma.disciplina.count({ where: { id: sozinha.id } })).toBe(0);
  });

  it("AC-026-12: professor de outra turma e coordenador de outro curso recebem 404", async () => {
    const { turma } = await cenario();
    const avaliacao = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "P1", peso: 1, data: new Date() } });
    const outroProfessor = await entrar("Professor");
    const outroCoordenador = await entrar("Coordenador");
    expect((await excluirAvaliacaoApi(del(`${API}/avaliacoes/${avaliacao.id}`, outroProfessor.token), parametros(avaliacao.id))).status).toBe(404);
    expect((await editarTurmaApi(patch(`${API}/turmas/${turma.id}`, { nome: "Invadida" }, outroCoordenador.token), parametros(turma.id))).status).toBe(404);
    expect((await prisma.turma.findUniqueOrThrow({ where: { id: turma.id } })).nome).toBe("T");
  });

  it("AC-026-13: turma de período encerrado não é editada", async () => {
    const encerrado = await criarPeriodoDeTeste("Encerrado");
    const { coordenador, professor, turma } = await cenario(encerrado.nome);
    const avaliacao = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "P1", peso: 1, data: new Date() } });
    expect((await editarTurmaApi(patch(`${API}/turmas/${turma.id}`, { nome: "Nova" }, coordenador.token), parametros(turma.id))).status).toBe(409);
    expect((await excluirAvaliacaoApi(del(`${API}/avaliacoes/${avaliacao.id}`, professor.token), parametros(avaliacao.id))).status).toBe(409);
  });

  it("AC-026-14: atividade sem entrega é editada e excluída; com entrega, não é excluída", async () => {
    const { professor, turma, a } = await cenario();
    const atividade = await prisma.atividade.create({ data: { turmaId: turma.id, descricao: "Lista", prazo: new Date("2026-12-01T00:00:00Z") } });
    const r = await editarAtividadeApi(patch(`${API}/atividades/${atividade.id}`, { descricao: "Lista 2", prazo: "2026-12-05" }, professor.token), parametros(atividade.id));
    expect(r.status).toBe(200);
    expect((await prisma.atividade.findUniqueOrThrow({ where: { id: atividade.id } })).descricao).toBe("Lista 2");
    await prisma.entrega.create({ data: { atividadeId: atividade.id, estudanteId: a.id, dataEntrega: new Date("2026-11-01T00:00:00Z") } });
    expect((await excluirAtividadeApi(del(`${API}/atividades/${atividade.id}`, professor.token), parametros(atividade.id))).status).toBe(409);
    await prisma.entrega.deleteMany({ where: { atividadeId: atividade.id } });
    expect((await excluirAtividadeApi(del(`${API}/atividades/${atividade.id}`, professor.token), parametros(atividade.id))).status).toBe(200);
  });
});
