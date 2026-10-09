// SPEC-002 — estrutura acadêmica e vínculos de turma: domínio (unitário) e rotas + banco (integração).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { validarDisciplina, validarEstudante, validarTurma } from "@/domain/estrutura-academica";
import { GET as listarDisciplinasApi, POST as cadastrarDisciplinaApi } from "@/app/api/disciplinas/route";
import { GET as listarTurmasApi, POST as cadastrarTurmaApi } from "@/app/api/turmas/route";
import { GET as buscarTurmaApi } from "@/app/api/turmas/[id]/route";
import { POST as cadastrarEstudanteApi } from "@/app/api/turmas/[id]/estudantes/route";
import { POST as matricularApi } from "@/app/api/turmas/[id]/matriculas/route";
import { prisma } from "@/server/dados/prisma";
import {
  PREFIXO_DISCIPLINA_TESTE,
  criarUsuarioDeTeste,
  emailDeTeste,
  entrarComo,
  parametros,
  removerUsuariosDeTeste,
  requisicaoComSessao,
  requisicaoJson,
} from "../apoio";

const API = "http://localhost/api";
const FORMATO_BCRYPT = /^\$2[aby]\$\d{2}\$/;

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

async function entrar(perfil: "Estudante" | "Professor" | "Coordenador") {
  const usuario = await criarUsuarioDeTeste(perfil);
  return { usuario, token: await entrarComo(usuario.email, usuario.senha) };
}

// Monta disciplina + turma pela API, com o coordenador informado como responsável.
async function criarTurmaPelaApi(tokenCoordenador: string, professorId: string) {
  const disciplina = await cadastrarDisciplinaApi(
    requisicaoJson(`${API}/disciplinas`, { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60 }, tokenCoordenador),
  );
  const { id: disciplinaId } = await disciplina.json();
  const turma = await cadastrarTurmaApi(
    requisicaoJson(`${API}/turmas`, { nome: "Turma A", periodo: "2026/2", disciplinaId, professorId }, tokenCoordenador),
  );
  return { resposta: turma, turma: await turma.json(), disciplinaId };
}

describe("SPEC-002 — validação de domínio (sem banco)", () => {
  it("OPEN-009: estudante exige nome, e-mail válido e senha inicial de 8+ caracteres", () => {
    expect(validarEstudante({ nome: "Ana", email: "ana@x.com", senha: "12345678" }).ok).toBe(true);
    const falha = validarEstudante({ nome: " ", email: "sem-arroba", senha: "1234567" });
    expect(falha.ok).toBe(false);
    if (!falha.ok) expect(Object.keys(falha.erros).sort()).toEqual(["email", "nome", "senha"]);
  });

  it("OPEN-009: carga horária precisa ser inteiro maior que zero", () => {
    for (const invalida of [0, -1, 1.5, "abc", "", undefined]) {
      expect(validarDisciplina({ nome: "X", cargaHoraria: invalida }).ok).toBe(false);
    }
    expect(validarDisciplina({ nome: "X", cargaHoraria: "60" })).toEqual({ ok: true, dados: { nome: "X", cargaHoraria: 60 } });
  });

  it("OPEN-009: turma exige nome, período, disciplina e professor", () => {
    const falha = validarTurma({});
    expect(falha.ok).toBe(false);
    if (!falha.ok) expect(Object.keys(falha.erros).sort()).toEqual(["disciplinaId", "nome", "periodo", "professorId"]);
  });
});

describe("SPEC-002 — cadastros e vínculos", () => {
  it("AC-002-01 / INV-002-01: coordenador responsável cadastra estudante já vinculado à turma", async () => {
    const coordenador = await entrar("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    const { turma } = await criarTurmaPelaApi(coordenador.token, professor.id);
    const email = emailDeTeste("estudante");

    const resposta = await cadastrarEstudanteApi(
      requisicaoJson(`${API}/turmas/${turma.id}/estudantes`, { nome: "Novo Estudante", email, senha: "senha-inicial-1" }, coordenador.token),
      parametros(turma.id),
    );

    expect(resposta.status).toBe(201);
    const salvo = await prisma.usuario.findUniqueOrThrow({ where: { email }, include: { matriculas: true } });
    expect(salvo.perfil).toBe("Estudante");
    expect(salvo.senhaHash).toMatch(FORMATO_BCRYPT);
    expect(salvo.matriculas.map((m) => m.turmaId)).toEqual([turma.id]);
  });

  it("AC-002-02 / INV-002-05: cadastro sem campo obrigatório é impedido, indica o campo e não persiste nada", async () => {
    const coordenador = await entrar("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    const { turma } = await criarTurmaPelaApi(coordenador.token, professor.id);
    const email = emailDeTeste("incompleto");

    const resposta = await cadastrarEstudanteApi(
      requisicaoJson(`${API}/turmas/${turma.id}/estudantes`, { email }, coordenador.token),
      parametros(turma.id),
    );

    expect(resposta.status).toBe(400);
    const corpo = await resposta.json();
    expect(Object.keys(corpo.campos).sort()).toEqual(["nome", "senha"]);
    expect(await prisma.usuario.count({ where: { email } })).toBe(0);
  });

  it("OPEN-009: e-mail já cadastrado é recusado (409)", async () => {
    const coordenador = await entrar("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    const { turma } = await criarTurmaPelaApi(coordenador.token, professor.id);
    const existente = await criarUsuarioDeTeste("Estudante");

    const resposta = await cadastrarEstudanteApi(
      requisicaoJson(`${API}/turmas/${turma.id}/estudantes`, { nome: "Outro", email: existente.email, senha: "senha-inicial-1" }, coordenador.token),
      parametros(turma.id),
    );

    expect(resposta.status).toBe(409);
  });

  it("AC-002-03: coordenador cadastra disciplina e turma e associa professor e estudantes", async () => {
    const coordenador = await entrar("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    const estudante = await criarUsuarioDeTeste("Estudante");

    const { resposta, turma, disciplinaId } = await criarTurmaPelaApi(coordenador.token, professor.id);
    expect(resposta.status).toBe(201);
    expect(turma.disciplina.id).toBe(disciplinaId);
    expect(turma.professor.id).toBe(professor.id);

    const matricula = await matricularApi(
      requisicaoJson(`${API}/turmas/${turma.id}/matriculas`, { email: estudante.email }, coordenador.token),
      parametros(turma.id),
    );
    expect(matricula.status).toBe(201);

    const consultada = await (await buscarTurmaApi(requisicaoComSessao(`${API}/turmas/${turma.id}`, coordenador.token), parametros(turma.id))).json();
    expect(consultada.estudantes.map((e: { id: string }) => e.id)).toEqual([estudante.id]);
    const noBanco = await prisma.turma.findUniqueOrThrow({ where: { id: turma.id } });
    expect(noBanco.coordenadorId).toBe(coordenador.usuario.id);
  });

  it("AC-002-04: usuário sem permissão tem o cadastro negado no servidor", async () => {
    const estudante = await entrar("Estudante");
    const professor = await entrar("Professor");
    const corpo = { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 30 };

    expect((await cadastrarDisciplinaApi(requisicaoJson(`${API}/disciplinas`, corpo, estudante.token))).status).toBe(403);
    expect((await cadastrarDisciplinaApi(requisicaoJson(`${API}/disciplinas`, corpo, professor.token))).status).toBe(403);
    expect((await cadastrarDisciplinaApi(requisicaoJson(`${API}/disciplinas`, corpo))).status).toBe(401);
    expect((await listarDisciplinasApi(requisicaoComSessao(`${API}/disciplinas`, estudante.token))).status).toBe(403);
    expect(await prisma.disciplina.count({ where: { nome: corpo.nome } })).toBe(0);
  });

  it("AC-002-04 / OPEN-001: coordenador não cadastra nem matricula em turma que não é sua", async () => {
    const dono = await entrar("Coordenador");
    const outro = await entrar("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    const estudante = await criarUsuarioDeTeste("Estudante");
    const { turma } = await criarTurmaPelaApi(dono.token, professor.id);
    const email = emailDeTeste("intruso");

    const cadastro = await cadastrarEstudanteApi(
      requisicaoJson(`${API}/turmas/${turma.id}/estudantes`, { nome: "X", email, senha: "senha-inicial-1" }, outro.token),
      parametros(turma.id),
    );
    const matricula = await matricularApi(
      requisicaoJson(`${API}/turmas/${turma.id}/matriculas`, { email: estudante.email }, outro.token),
      parametros(turma.id),
    );

    expect(cadastro.status).toBe(403);
    expect(matricula.status).toBe(403);
    expect(await prisma.usuario.count({ where: { email } })).toBe(0);
    expect(await prisma.matricula.count({ where: { turmaId: turma.id } })).toBe(0);
  });

  it("AC-002-05 / INV-002-02: turma consultada pertence a exatamente 1 disciplina e 1 professor", async () => {
    const coordenador = await entrar("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    const { turma } = await criarTurmaPelaApi(coordenador.token, professor.id);

    const consultada = await (await buscarTurmaApi(requisicaoComSessao(`${API}/turmas/${turma.id}`, coordenador.token), parametros(turma.id))).json();

    expect(consultada.disciplina).toEqual(expect.objectContaining({ id: expect.any(String), nome: expect.any(String) }));
    expect(consultada.professor).toEqual({ id: professor.id, nome: professor.nome });
  });

  it("INV-002-02: turma com professor que não tem perfil Professor é recusada", async () => {
    const coordenador = await entrar("Coordenador");
    const naoProfessor = await criarUsuarioDeTeste("Estudante");

    const { resposta } = await criarTurmaPelaApi(coordenador.token, naoProfessor.id);

    expect(resposta.status).toBe(400);
    expect(await prisma.turma.count({ where: { professorId: naoProfessor.id } })).toBe(0);
  });

  it("Caso de teste 12.3: o banco recusa turma sem disciplina válida e disciplina com carga horária zero", async () => {
    const professor = await criarUsuarioDeTeste("Professor");
    await expect(
      prisma.turma.create({ data: { nome: "Sem disciplina", periodo: "2026/2", disciplinaId: randomUUID(), professorId: professor.id } }),
    ).rejects.toThrow();
    await expect(
      prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 0 } }),
    ).rejects.toThrow();
  });

  it("INV-002-03: turma pode ficar sem coordenador e um coordenador pode responder por várias turmas", async () => {
    const coordenador = await entrar("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    const primeira = await criarTurmaPelaApi(coordenador.token, professor.id);
    const segunda = await criarTurmaPelaApi(coordenador.token, professor.id);
    const semCoordenador = await prisma.turma.create({
      data: { nome: "Sem coordenador", periodo: "2026/2", disciplinaId: primeira.disciplinaId, professorId: professor.id },
    });

    expect(semCoordenador.coordenadorId).toBeNull();
    expect(await prisma.turma.count({ where: { coordenadorId: coordenador.usuario.id } })).toBe(2);
    expect([primeira.turma.id, segunda.turma.id]).toHaveLength(2);
  });

  it("INV-002-04: matrícula é N:M e não duplica", async () => {
    const coordenador = await entrar("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    const estudante = await criarUsuarioDeTeste("Estudante");
    const a = (await criarTurmaPelaApi(coordenador.token, professor.id)).turma;
    const b = (await criarTurmaPelaApi(coordenador.token, professor.id)).turma;

    for (const turma of [a, b, a]) {
      await matricularApi(requisicaoJson(`${API}/turmas/${turma.id}/matriculas`, { email: estudante.email }, coordenador.token), parametros(turma.id));
    }

    const matriculas = await prisma.matricula.findMany({ where: { estudanteId: estudante.id } });
    expect(matriculas.map((m) => m.turmaId).sort()).toEqual([a.id, b.id].sort());
    expect((await prisma.turma.findUniqueOrThrow({ where: { id: a.id }, include: { matriculas: true } })).matriculas).toHaveLength(1);
  });
});

describe("SPEC-002 — escopo das consultas", () => {
  it("INV-002-06: cada perfil só vê as turmas do seu escopo; Estudante não recebe a lista de colegas", async () => {
    const coordenador = await entrar("Coordenador");
    const outroCoordenador = await entrar("Coordenador");
    const professor = await entrar("Professor");
    const outroProfessor = await criarUsuarioDeTeste("Professor");
    const estudante = await entrar("Estudante");
    const colega = await criarUsuarioDeTeste("Estudante");

    const minha = (await criarTurmaPelaApi(coordenador.token, professor.usuario.id)).turma;
    const alheia = (await criarTurmaPelaApi(outroCoordenador.token, outroProfessor.id)).turma;
    for (const e of [estudante.usuario, colega]) {
      await matricularApi(requisicaoJson(`${API}/turmas/${minha.id}/matriculas`, { email: e.email }, coordenador.token), parametros(minha.id));
    }

    const ids = async (token: string) =>
      (await (await listarTurmasApi(requisicaoComSessao(`${API}/turmas`, token))).json()).map((t: { id: string }) => t.id);

    expect(await ids(coordenador.token)).toEqual([minha.id]);
    expect(await ids(professor.token)).toEqual([minha.id]);
    expect(await ids(estudante.token)).toEqual([minha.id]);
    expect(await ids(outroCoordenador.token)).toEqual([alheia.id]);

    const doEstudante = await (await listarTurmasApi(requisicaoComSessao(`${API}/turmas`, estudante.token))).json();
    expect(doEstudante[0]).not.toHaveProperty("estudantes");

    const turmaAlheia = await buscarTurmaApi(requisicaoComSessao(`${API}/turmas/${alheia.id}`, estudante.token), parametros(alheia.id));
    expect(turmaAlheia.status).toBe(404);
    const turmaAlheiaProfessor = await buscarTurmaApi(requisicaoComSessao(`${API}/turmas/${alheia.id}`, professor.token), parametros(alheia.id));
    expect(turmaAlheiaProfessor.status).toBe(404);
  });
});
