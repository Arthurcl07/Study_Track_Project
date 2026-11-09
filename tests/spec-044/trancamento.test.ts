// SPEC-044 — trancamento de disciplina e de curso por requerimento: destino e regra (unitário) e abertura,
// deferimento com efeito, recusas e escopo (integração).
import { afterAll, describe, expect, it } from "vitest";
import { destinoDoTipo, exigeTurma, motivoParaNaoTrancarDisciplina, validarRequerimento } from "@/domain/requerimentos";
import { POST as abrirApi } from "@/app/api/requerimentos/route";
import { PATCH as responderApi } from "@/app/api/requerimentos/[id]/route";
import { consultarBoletim } from "@/server/academico/documentos";
import { listarRequerimentos } from "@/server/academico/requerimentos";
import { prisma } from "@/server/dados/prisma";
import { criarPeriodoDeTeste, entrarComo, removerUsuariosDeTeste } from "../apoio";
import { sessao } from "../apoio-n3";
import { API, contexto, entrar, requisicao, turmaComEstudantes } from "../apoio-secretaria";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

describe("SPEC-044 — regras puras (sem banco)", () => {
  it("RB-42 / INV-044-03: trancamento de disciplina exige turma e vai para a secretaria; o de curso não tem turma", () => {
    expect([destinoDoTipo("TrancamentoDisciplina"), destinoDoTipo("Trancamento")]).toEqual(["Secretaria", "Secretaria"]);
    expect([exigeTurma("TrancamentoDisciplina"), exigeTurma("Trancamento")]).toEqual([true, false]);
    expect(validarRequerimento({ tipo: "TrancamentoDisciplina", descricao: "x" })).toMatchObject({ ok: false, erros: { turmaId: expect.any(String) } });
    expect(validarRequerimento({ tipo: "TrancamentoDisciplina", descricao: "x", turmaId: "t", avaliacaoId: "a" })).toMatchObject({ ok: true, dados: { turmaId: "t", avaliacaoId: null } });
  });

  it("RB-42 / INV-044-02: só tranca com a matrícula cursando, o período aberto e o diário aberto", () => {
    const ok = { matricula: "Cursando", diario: "Aberto", periodo: "Aberto" };
    expect(motivoParaNaoTrancarDisciplina(ok)).toBeNull();
    expect(motivoParaNaoTrancarDisciplina({ ...ok, diario: "Fechado" })).toMatch(/diário/);
    expect(motivoParaNaoTrancarDisciplina({ ...ok, periodo: "Encerrado" })).toMatch(/encerrado/);
    expect(motivoParaNaoTrancarDisciplina({ ...ok, matricula: "Trancada" })).toMatch(/já está trancada/);
    expect(motivoParaNaoTrancarDisciplina({ ...ok, matricula: null })).toMatch(/não está matriculado/);
  });
});

describe("SPEC-044 — trancamento (integração)", () => {
  async function cenario() {
    const periodo = await criarPeriodoDeTeste();
    const base = await turmaComEstudantes(1, periodo.nome);
    const [estudante] = base.estudantes;
    // Uma segunda turma do mesmo curso e período, para mostrar que só uma é trancada.
    const outra = await prisma.turma.create({ data: { nome: `${base.turma.nome}-2`, periodo: periodo.nome, disciplinaId: base.disciplina.id, professorId: base.professor.id, cursoId: base.cursoId } });
    await prisma.matricula.create({ data: { estudanteId: estudante.id, turmaId: outra.id } });
    const admin = await entrar("Administrador");
    return { ...base, periodo, estudante, outra, admin, token: await entrarComo(estudante.email, estudante.senha) };
  }
  const abrir = (token: string, corpo: Record<string, unknown>) => abrirApi(requisicao(`${API}/requerimentos`, "POST", token, corpo));
  const responder = (token: string, id: string, corpo: Record<string, unknown>) => responderApi(requisicao(`${API}/requerimentos/${id}`, "PATCH", token, corpo), contexto({ id }));
  const situacaoDa = async (estudanteId: string, turmaId: string) => (await prisma.matricula.findUniqueOrThrow({ where: { estudanteId_turmaId: { estudanteId, turmaId } } })).situacao;

  it("AC-044-01 / AC-044-02 / AC-044-03 / INV-044-01 / INV-044-04: pede, a secretaria defere e só aquela disciplina fica Trancada", async () => {
    const { estudante, turma, outra, admin, token, professor, periodo } = await cenario();
    const prova = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "P1", peso: 1, data: new Date(), tipo: "Prova" } });
    await prisma.nota.create({ data: { avaliacaoId: prova.id, estudanteId: estudante.id, valor: 7 } });

    const r = await abrir(token, { tipo: "TrancamentoDisciplina", turmaId: turma.id, descricao: "Vou trabalhar nesse horário" });
    expect(r.status).toBe(201);
    const pedido = await r.json();
    expect(pedido.destino).toBe("Secretaria");
    // O professor da turma não vê (INV-044-03); a secretaria vê com o efeito.
    expect((await listarRequerimentos(sessao(professor.id, "Professor")))!.itens.map((i) => i.id)).not.toContain(pedido.id);
    const daSecretaria = (await listarRequerimentos(sessao(admin.usuario.id, "Administrador")))!.itens.find((i) => i.id === pedido.id)!;
    expect(daSecretaria.efeito).toMatch(/^Deferir tranca .* a matrícula fica Trancada/);

    expect((await responder(admin.token, pedido.id, { status: "Deferido", resposta: "Trancamento registrado." })).status).toBe(200);
    expect(await situacaoDa(estudante.id, turma.id)).toBe("Trancada");
    expect(await situacaoDa(estudante.id, outra.id)).toBe("Cursando");
    expect(await prisma.nota.count({ where: { estudanteId: estudante.id, avaliacao: { turmaId: turma.id } } })).toBe(1);
    expect(await prisma.notificacao.count({ where: { usuarioId: estudante.id, tipo: "Requerimento" } })).toBe(1);
    expect(await prisma.registroAuditoria.count({ where: { acao: "matricula.trancada", turmaId: turma.id } })).toBe(1);
    const boletim = await consultarBoletim(sessao(estudante.id, "Estudante"), { periodo: periodo.nome });
    expect(boletim!.turmas.find((t) => t.id === turma.id)?.resultado).toBe("Trancada");
  });

  it("AC-044-04 / AC-044-05 / AC-044-08: diário fechado ou turma que não cursa é recusado; diário fechado depois do pedido impede o deferimento", async () => {
    const { turma, outra, admin, token } = await cenario();
    const pedido = await (await abrir(token, { tipo: "TrancamentoDisciplina", turmaId: outra.id, descricao: "Trancar" })).json();

    await prisma.turma.update({ where: { id: turma.id }, data: { diario: "Fechado" } });
    const fechado = await abrir(token, { tipo: "TrancamentoDisciplina", turmaId: turma.id, descricao: "Trancar" });
    expect(fechado.status).toBe(400);
    expect((await fechado.json()).campos.turmaId).toMatch(/diário/);

    const alheia = await turmaComEstudantes(0);
    expect((await abrir(token, { tipo: "TrancamentoDisciplina", turmaId: alheia.turma.id, descricao: "Trancar" })).status).toBe(400);

    await prisma.turma.update({ where: { id: outra.id }, data: { diario: "Fechado" } });
    const recusado = await responder(admin.token, pedido.id, { status: "Deferido" });
    expect(recusado.status).toBe(409);
    expect((await responder(admin.token, pedido.id, { status: "Indeferido", resposta: "O diário já foi fechado." })).status).toBe(200);
  });

  it("AC-044-06 / AC-044-07: trancamento de curso deferido tranca o estudante e as matrículas; estudante já Trancado é 409", async () => {
    const { estudante, turma, outra, admin, token } = await cenario();
    const pedido = await (await abrir(token, { tipo: "Trancamento", descricao: "Mudança de cidade" })).json();
    const daSecretaria = (await listarRequerimentos(sessao(admin.usuario.id, "Administrador")))!.itens.find((i) => i.id === pedido.id)!;
    expect(daSecretaria.efeito).toMatch(/2 disciplina\(s\)/);

    expect((await responder(admin.token, pedido.id, { status: "Deferido" })).status).toBe(200);
    expect((await prisma.fichaEstudante.findUniqueOrThrow({ where: { estudanteId: estudante.id } })).situacaoCurso).toBe("Trancado");
    expect([await situacaoDa(estudante.id, turma.id), await situacaoDa(estudante.id, outra.id)]).toEqual(["Trancada", "Trancada"]);
    expect(await prisma.registroAuditoria.count({ where: { acao: "estudante.situacao", autorId: admin.usuario.id, descricao: { contains: pedido.protocolo } } })).toBe(1);

    const segundo = await (await abrir(token, { tipo: "Trancamento", descricao: "De novo" })).json();
    expect((await responder(admin.token, segundo.id, { status: "Deferido" })).status).toBe(409);
  });
});
