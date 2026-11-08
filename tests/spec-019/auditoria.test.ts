// SPEC-019 — auditoria: regras de domínio (unitário) e gravação/consulta com rotas + banco (integração).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { hojeEmBrasilia } from "@/domain/atividades";
import { ACOES, acoesDoGrupo, gruposDaCategoria, numeroBR, paginaValida, semSegredos } from "@/domain/auditoria";
import { POST as registrarEntregaApi } from "@/app/api/atividades/[id]/entregas/route";
import { GET as auditoriaApi } from "@/app/api/auditoria/route";
import { POST as chamadaApi } from "@/app/api/aulas/route";
import { POST as criarContaApi } from "@/app/api/contas/route";
import { PATCH as alterarNotaApi } from "@/app/api/notas/[id]/route";
import { POST as registrarNotaApi } from "@/app/api/notas/route";
import { POST as encerrarPeriodoApi } from "@/app/api/periodos/[id]/encerrar/route";
import { POST as criarPlanoApi } from "@/app/api/planos/route";
import { POST as matricularApi } from "@/app/api/turmas/[id]/matriculas/route";
import { prisma } from "@/server/dados/prisma";
import {
  PREFIXO_DISCIPLINA_TESTE,
  criarPeriodoDeTeste,
  criarUsuarioDeTeste,
  emailDeTeste,
  entrarComo,
  parametros,
  removerUsuariosDeTeste,
  requisicaoComSessao,
  requisicaoJson,
  periodoAbertoDeTeste,
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

// Coordenador com curso, professor, estudante do curso matriculado numa turma com uma avaliação.
async function cenario() {
  const coordenador = await entrar("Coordenador");
  const professor = await entrar("Professor");
  const estudante = await entrar("Estudante", { cursoId: coordenador.usuario.cursoId });
  const disciplina = await prisma.disciplina.create({
    data: { nome: `${PREFIXO_DISCIPLINA_TESTE}Modelagem-${randomUUID().slice(0, 4)}`, cargaHoraria: 60, cursos: { create: { cursoId: coordenador.usuario.cursoId } } },
  });
  const turma = await prisma.turma.create({ data: { nome: "ES-A", periodo: await periodoAbertoDeTeste(), disciplinaId: disciplina.id, professorId: professor.usuario.id, cursoId: coordenador.usuario.cursoId } });
  await prisma.matricula.create({ data: { estudanteId: estudante.usuario.id, turmaId: turma.id } });
  const avaliacao = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "Prova 1", peso: 1, data: new Date() } });
  return { coordenador, professor, estudante, disciplina, turma, avaliacao };
}

const auditoria = async (token: string, consulta = "") => (await auditoriaApi(requisicaoComSessao(`${API}/auditoria${consulta}`, token))).json();
const registrosDaTurma = (turmaId: string) => prisma.registroAuditoria.findMany({ where: { turmaId }, orderBy: { registradoEm: "asc" } });

describe("SPEC-019 — regras de domínio (sem banco)", () => {
  it("INV-019-05: semSegredos tira senha e hash em qualquer nível", () => {
    expect(semSegredos({ nome: "A", senha: "x", dados: { senhaHash: "h", email: "e" }, lista: [{ senhaProvisoria: "p", ok: 1 }] })).toEqual({ nome: "A", dados: { email: "e" }, lista: [{ ok: 1 }] });
  });

  it("valores com vírgula e uma casa; página inválida vira 1", () => {
    expect([numeroBR(5), numeroBR(6.5), numeroBR(null)]).toEqual(["5,0", "6,5", "—"]);
    expect([paginaValida("3"), paginaValida("0"), paginaValida("x")]).toEqual([3, 1, 1]);
  });

  it("RB-22: toda ação tem categoria; grupos de cada perfil não se misturam", () => {
    // SPEC-027 e SPEC-033 (2026-11-06): pedidos de senha e instituição também são administrativos.
    // SPEC-040, SPEC-041 e SPEC-043 (2026-11-08): calendário, salas e exportação do Censo também.
    expect(gruposDaCategoria("Administrativa")).toEqual(["Contas", "Cursos", "Períodos", "Pedidos de senha", "Instituição", "Calendário e salas", "Exportações"]);
    expect(gruposDaCategoria("Academica")).not.toContain("Contas");
    // SPEC-026: editar e excluir avaliação também ficam no grupo Notas.
    expect(acoesDoGrupo("Academica", "Notas").sort()).toEqual(["avaliacao.criada", "avaliacao.editada", "avaliacao.excluida", "nota.alterada", "nota.lancada"]);
    expect(acoesDoGrupo("Administrativa", "inexistente")).toHaveLength(Object.values(ACOES).filter((a) => a.categoria === "Administrativa").length);
  });
});

describe("SPEC-019 — gravação (integração)", () => {
  it("AC-019-01 / INV-019-01: nota lançada e alterada (5,0 → 6,5) aparecem para o coordenador do curso com autor e valores", async () => {
    const { coordenador, professor, estudante, turma, avaliacao } = await cenario();
    const lancada = await (await registrarNotaApi(requisicaoJson(`${API}/notas`, { turmaId: turma.id, avaliacaoId: avaliacao.id, estudanteId: estudante.usuario.id, valor: 5 }, professor.token))).json();
    await alterarNotaApi(requisicaoJson(`${API}/notas/${lancada.nota.id}`, { valor: 6.5 }, professor.token, "PATCH"), parametros(lancada.nota.id));

    const { registros } = await auditoria(coordenador.token, "?grupo=Notas");
    const alterada = registros.find((r: { acao: string }) => r.acao === "nota.alterada");
    expect(alterada).toMatchObject({ autor: professor.usuario.nome, rotulo: "Nota alterada", antes: { valor: 5 }, depois: { valor: 6.5 } });
    expect(alterada.descricao).toContain("5,0 → 6,5");
    expect(alterada.descricao).toContain("Prova 1");
    expect(registros.some((r: { acao: string }) => r.acao === "nota.lancada")).toBe(true);
  });

  it("AC-019-02: chamada, entrega, plano e matrícula geram um registro cada", async () => {
    const { coordenador, professor, estudante, turma } = await cenario();
    const atividade = await prisma.atividade.create({ data: { turmaId: turma.id, descricao: "Lista", prazo: new Date(`${hojeEmBrasilia()}T00:00:00Z`) } });
    await chamadaApi(requisicaoJson(`${API}/aulas`, { turmaId: turma.id, data: hojeEmBrasilia(), presencas: [{ estudanteId: estudante.usuario.id, presente: false }] }, professor.token));
    await registrarEntregaApi(requisicaoJson(`${API}/atividades/${atividade.id}/entregas`, { estudanteId: estudante.usuario.id }, professor.token), parametros(atividade.id));
    const plano = await criarPlanoApi(requisicaoJson(`${API}/planos`, { turmaId: turma.id, estudanteId: estudante.usuario.id, itens: ["Refazer a lista"] }, professor.token));
    expect(plano.status).toBe(201);
    const outro = await entrar("Estudante", { cursoId: coordenador.usuario.cursoId });
    await matricularApi(requisicaoJson(`${API}/turmas/${turma.id}/matriculas`, { email: outro.usuario.email }, coordenador.token), parametros(turma.id));

    const acoes = (await registrosDaTurma(turma.id)).map((r) => r.acao);
    expect(acoes).toEqual(["chamada.registrada", "entrega.registrada", "plano.criado", "estudante.matriculado"]);
    const chamada = (await registrosDaTurma(turma.id))[0];
    expect(chamada.descricao).toContain("0 presente(s), 1 falta(s)");
  });

  it("AC-019-05: escrita recusada (nota 11) não grava registro", async () => {
    const { professor, estudante, turma, avaliacao } = await cenario();
    const r = await registrarNotaApi(requisicaoJson(`${API}/notas`, { turmaId: turma.id, avaliacaoId: avaliacao.id, estudanteId: estudante.usuario.id, valor: 11 }, professor.token));
    expect(r.status).toBe(400);
    expect(await registrosDaTurma(turma.id)).toHaveLength(0);
  });

  it("AC-019-06 / INV-019-05: conta criada com senha não guarda senha nem hash no registro", async () => {
    const admin = await entrar("Administrador");
    const email = emailDeTeste("auditada");
    const r = await criarContaApi(requisicaoJson(`${API}/contas`, { nome: "Conta Auditada", email, senha: "senha-secreta-1", perfil: "Professor" }, admin.token));
    expect(r.status).toBe(201);
    const registro = await prisma.registroAuditoria.findFirst({ where: { acao: "conta.criada", autorId: admin.usuario.id } });
    const texto = JSON.stringify(registro);
    expect(registro?.categoria).toBe("Administrativa");
    expect(texto).not.toContain("senha-secreta-1");
    expect(texto).not.toMatch(/senhaHash|\$2[aby]\$/);
  });
});

describe("SPEC-019 — consulta e escopo (integração)", () => {
  it("AC-019-03 / INV-019-03: coordenador vê só os registros do próprio curso", async () => {
    const a = await cenario();
    const b = await cenario();
    await registrarNotaApi(requisicaoJson(`${API}/notas`, { turmaId: a.turma.id, avaliacaoId: a.avaliacao.id, estudanteId: a.estudante.usuario.id, valor: 7 }, a.professor.token));
    await registrarNotaApi(requisicaoJson(`${API}/notas`, { turmaId: b.turma.id, avaliacaoId: b.avaliacao.id, estudanteId: b.estudante.usuario.id, valor: 8 }, b.professor.token));
    const deA = await auditoria(a.coordenador.token);
    expect(deA.total).toBe(1);
    expect(deA.registros[0].descricao).toContain("7,0");
  });

  // SPEC-035 (INV-035-02, 2026-11-06): o administrador vê também os registros acadêmicos feitos pela secretaria (grupo
  // Secretaria), nunca os de professores e coordenadores.
  it("AC-019-04 / INV-019-04 / INV-035-02: administrador vê contas e períodos e nenhum registro acadêmico de professor ou coordenador", async () => {
    const { professor, estudante, turma, avaliacao } = await cenario();
    await registrarNotaApi(requisicaoJson(`${API}/notas`, { turmaId: turma.id, avaliacaoId: avaliacao.id, estudanteId: estudante.usuario.id, valor: 7 }, professor.token));
    const admin = await entrar("Administrador");
    const periodo = await criarPeriodoDeTeste();
    await encerrarPeriodoApi(requisicaoJson(`${API}/periodos/${periodo.id}/encerrar`, {}, admin.token), parametros(periodo.id));
    const { categoria, registros } = await auditoria(admin.token, "?grupo=Períodos");
    expect(categoria).toBe("Administrativa");
    expect(registros.some((r: { descricao: string }) => r.descricao.startsWith(periodo.nome))).toBe(true);
    const todos = await auditoria(admin.token);
    const acoes = ACOES as Record<string, { categoria: string; grupo: string }>;
    expect(todos.registros.every((r: { acao: string }) => acoes[r.acao].categoria === "Administrativa" || acoes[r.acao].grupo === "Secretaria")).toBe(true);
    expect(todos.registros.some((r: { acao: string }) => r.acao.startsWith("nota."))).toBe(false);
  });

  it("AC-019-07: professor e estudante não consultam a auditoria", async () => {
    for (const perfil of ["Professor", "Estudante"] as const) {
      const { token } = await entrar(perfil);
      expect((await auditoriaApi(requisicaoComSessao(`${API}/auditoria`, token))).status).toBe(403);
    }
  });

  it("INV-019-02: não há rota de alteração nem de exclusão", async () => {
    const rota = await import("@/app/api/auditoria/route");
    expect(Object.keys(rota).sort()).toEqual(["GET"]);
  });
});
