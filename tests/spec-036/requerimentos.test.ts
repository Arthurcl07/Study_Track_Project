// SPEC-036 — requerimentos: prazo, destino, protocolo e transições (unitário) e abertura, resposta e escopo (integração).
import { afterAll, describe, expect, it } from "vitest";
import { hojeEmBrasilia } from "@/domain/atividades";
import { somarDiasUteis } from "@/domain/calendario";
import { atrasado, destinoDoTipo, protocolo, validarRequerimento, validarResposta } from "@/domain/requerimentos";
import { POST as abrirApi } from "@/app/api/requerimentos/route";
import { PATCH as responderApi } from "@/app/api/requerimentos/[id]/route";
import { folgasDoCalendario } from "@/server/academico/calendario";
import { consultarDeclaracao, listarRequerimentos, responderRequerimento } from "@/server/academico/requerimentos";
import { prisma } from "@/server/dados/prisma";
import { criarPeriodoDeTeste, entrarComo, removerUsuariosDeTeste } from "../apoio";
import { sessao } from "../apoio-n3";
import { API, contexto, entrar, requisicao, turmaComEstudantes } from "../apoio-secretaria";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

describe("SPEC-036 — regras puras (sem banco)", () => {
  it("RB-34 / AC-036-02: o prazo de 5 dias úteis pula sábado, domingo e feriado", () => {
    // Sexta 13/11/2026, feriado na terça 17/11: seg 16, qua 18, qui 19, sex 20, seg 23.
    const feriado = [{ tipo: "Feriado" as const, titulo: "Feriado", inicio: "2026-11-17", fim: "2026-11-17" }];
    expect(somarDiasUteis("2026-11-13", 5, feriado)).toBe("2026-11-23");
    expect(somarDiasUteis("2026-11-13", 5, [])).toBe("2026-11-20");
  });

  it("RB-34: revisão e segunda chamada vão para o professor e exigem turma; o resto vai para a secretaria", () => {
    expect([destinoDoTipo("RevisaoProva"), destinoDoTipo("SegundaChamada"), destinoDoTipo("DeclaracaoMatricula"), destinoDoTipo("Trancamento"), destinoDoTipo("Outro")]).toEqual(["Professor", "Professor", "Secretaria", "Secretaria", "Secretaria"]);
    expect(validarRequerimento({ tipo: "RevisaoProva", descricao: "x" })).toMatchObject({ ok: false, erros: { turmaId: expect.any(String) } });
    expect(validarRequerimento({ tipo: "Outro", descricao: "x", turmaId: "t" })).toMatchObject({ ok: true, dados: { turmaId: null } });
    expect(validarRequerimento({ tipo: "Outro", descricao: " " }).ok).toBe(false);
  });

  it("INV-036-01 / INV-036-04: protocolo do ano e decisão final; indeferir exige resposta", () => {
    expect(protocolo("2026", 42)).toBe("2026-000042");
    expect(validarResposta("Deferido", { status: "Indeferido", resposta: "x" })).toMatchObject({ ok: false, conflito: expect.any(String) });
    expect(validarResposta("Aberto", { status: "Indeferido" })).toMatchObject({ ok: false, erros: { resposta: expect.any(String) } });
    expect(validarResposta("Aberto", { status: "EmAnalise" })).toEqual({ ok: true, dados: { status: "EmAnalise", resposta: null } });
    expect([atrasado("Aberto", "2026-11-10", "2026-11-11"), atrasado("Deferido", "2026-11-10", "2026-11-11")]).toEqual([true, false]);
  });
});

describe("SPEC-036 — requerimentos (integração)", () => {
  async function cenario() {
    const periodo = await criarPeriodoDeTeste();
    const base = await turmaComEstudantes(1, periodo.nome);
    const [estudante] = base.estudantes;
    return { ...base, estudante, tokenEstudante: await entrarComo(estudante.email, estudante.senha), tokenProfessor: await entrarComo(base.professor.email, base.professor.senha) };
  }
  const abrir = (token: string, corpo: Record<string, unknown>) => abrirApi(requisicao(`${API}/requerimentos`, "POST", token, corpo));
  const responder = (token: string, id: string, corpo: Record<string, unknown>) => responderApi(requisicao(`${API}/requerimentos/${id}`, "PATCH", token, corpo), contexto({ id }));

  it("AC-036-01 / AC-036-03 / AC-036-06: revisão de prova vai ao professor, que defere; decidido é final", async () => {
    const { estudante, turma, professor, tokenEstudante, tokenProfessor } = await cenario();
    const r = await abrir(tokenEstudante, { tipo: "RevisaoProva", turmaId: turma.id, descricao: "Questão 3 corrigida errada" });
    expect(r.status).toBe(201);
    const aberto = await r.json();
    expect(aberto.protocolo).toMatch(/^\d{4}-\d{6}$/);
    expect(aberto.destino).toBe("Professor");
    expect(aberto.prazo).toBe(somarDiasUteis(hojeEmBrasilia(), 5, await folgasDoCalendario()));
    const doProfessor = await listarRequerimentos(sessao(professor.id, "Professor"));
    expect(doProfessor!.itens.map((i) => i.id)).toContain(aberto.id);

    const deferido = await responder(tokenProfessor, aberto.id, { status: "Deferido", resposta: "Nota revista para 7,0." });
    expect(deferido.status).toBe(200);
    expect(await prisma.notificacao.count({ where: { usuarioId: estudante.id, tipo: "Requerimento" } })).toBe(1);
    expect(await prisma.registroAuditoria.count({ where: { acao: "requerimento.respondido", turmaId: turma.id } })).toBe(1);
    expect((await responder(tokenProfessor, aberto.id, { status: "Indeferido", resposta: "x" })).status).toBe(409);
  });

  it("AC-036-04 / AC-036-05: secretaria indefere só com resposta; outro professor não responde", async () => {
    const { turma, tokenEstudante } = await cenario();
    const admin = await entrar("Administrador");
    const outro = await (await abrir(tokenEstudante, { tipo: "Outro", descricao: "Pedido de ementa" })).json();
    expect(outro.destino).toBe("Secretaria");
    expect((await responder(admin.token, outro.id, { status: "Indeferido" })).status).toBe(400);
    expect((await responder(admin.token, outro.id, { status: "Indeferido", resposta: "Ementa já publicada no site." })).status).toBe(200);

    const revisao = await (await abrir(tokenEstudante, { tipo: "RevisaoProva", turmaId: turma.id, descricao: "Revisão" })).json();
    const professor = await entrar("Professor");
    expect((await responder(professor.token, revisao.id, { status: "Deferido" })).status).toBe(404);
    // A secretaria também não responde o que é do professor.
    expect((await responder(admin.token, revisao.id, { status: "Deferido" })).status).toBe(404);
  });

  it("AC-036-07: declaração de matrícula deferida vira documento com as turmas cursando", async () => {
    const { estudante, turma, tokenEstudante } = await cenario();
    const admin = await entrar("Administrador");
    const pedido = await (await abrir(tokenEstudante, { tipo: "DeclaracaoMatricula", descricao: "Para o estágio" })).json();
    expect(await consultarDeclaracao(sessao(estudante.id, "Estudante"), pedido.id)).toBeNull();
    await responder(admin.token, pedido.id, { status: "Deferido" });
    const declaracao = await consultarDeclaracao(sessao(estudante.id, "Estudante"), pedido.id);
    expect(declaracao?.estudante.id).toBe(estudante.id);
    expect(declaracao?.turmas.map((t) => t.nome)).toContain(turma.nome);
    // Outro estudante não abre a declaração.
    const intruso = await entrar("Estudante");
    expect(await consultarDeclaracao(sessao(intruso.usuario.id, "Estudante"), pedido.id)).toBeNull();
  });

  it("AC-036-08: segunda chamada numa turma que o estudante não cursa é recusada", async () => {
    const { tokenEstudante } = await cenario();
    const outra = await cenario();
    const r = await abrir(tokenEstudante, { tipo: "SegundaChamada", turmaId: outra.turma.id, descricao: "Faltei na prova" });
    expect(r.status).toBe(400);
    expect((await r.json()).campos.turmaId).toBeTruthy();
  });

  it("AC-036-09 / INV-036-03: coordenador vê os do curso sem responder; estudante vê só os próprios", async () => {
    const { coordenador, estudante, tokenEstudante } = await cenario();
    const pedido = await (await abrir(tokenEstudante, { tipo: "Trancamento", descricao: "Mudança de cidade" })).json();
    const doCoordenador = await listarRequerimentos(sessao(coordenador.usuario.id, "Coordenador"));
    expect(doCoordenador!.podeResponder).toBe(false);
    expect(doCoordenador!.itens.map((i) => i.id)).toContain(pedido.id);
    expect((await responderRequerimento(sessao(coordenador.usuario.id, "Coordenador"), pedido.id, { status: "Deferido" })).ok).toBe(false);
    const outro = await entrar("Estudante");
    expect((await listarRequerimentos(sessao(outro.usuario.id, "Estudante")))!.itens).toHaveLength(0);
    expect((await listarRequerimentos(sessao(estudante.id, "Estudante")))!.itens.map((i) => i.id)).toEqual([pedido.id]);
  });
});
