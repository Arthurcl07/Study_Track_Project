// SPEC-015 — cursos e coordenação por curso: regras de domínio (unitário) e rotas + banco (integração).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { motivoParaNaoDesativar, validarNovaConta } from "@/domain/contas";
import { disciplinaNaGrade, escolherCurso, podeCoordenar, podeMatricular, validarCurso } from "@/domain/cursos";
import { POST as desativarApi } from "@/app/api/contas/[id]/desativar/route";
import { POST as criarContaApi } from "@/app/api/contas/route";
import { POST as trocarCoordenadorApi } from "@/app/api/cursos/[id]/coordenador/route";
import { POST as adicionarAGradeApi } from "@/app/api/cursos/[id]/disciplinas/route";
import { GET as listarCursosApi, POST as criarCursoApi } from "@/app/api/cursos/route";
import { GET as listarDisciplinasApi, POST as cadastrarDisciplinaApi } from "@/app/api/disciplinas/route";
import { GET as historicoApi } from "@/app/api/historico-notas/route";
import { GET as relatorioApi } from "@/app/api/relatorios/route";
import { GET as buscarTurmaApi } from "@/app/api/turmas/[id]/route";
import { POST as cadastrarEstudanteApi } from "@/app/api/turmas/[id]/estudantes/route";
import { POST as matricularApi } from "@/app/api/turmas/[id]/matriculas/route";
import { GET as listarTurmasApi, POST as cadastrarTurmaApi } from "@/app/api/turmas/route";
import { prisma } from "@/server/dados/prisma";
import {
  PREFIXO_DISCIPLINA_TESTE,
  criarCursoDeTeste,
  criarUsuarioDeTeste,
  emailDeTeste,
  entrarComo,
  parametros,
  removerUsuariosDeTeste,
  requisicaoComSessao,
  requisicaoJson,
} from "../apoio";

const API = "http://localhost/api";
const nomeCurso = () => `${PREFIXO_DISCIPLINA_TESTE}curso-${randomUUID()}`;
const nomeDisciplina = () => `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`;

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

async function entrar(perfil: "Estudante" | "Professor" | "Coordenador" | "Administrador", opcoes: { cursoId?: string; semCurso?: boolean } = {}) {
  const usuario = await criarUsuarioDeTeste(perfil, opcoes);
  return { usuario, token: await entrarComo(usuario.email, usuario.senha) };
}

async function json(resposta: Response) {
  return { status: resposta.status, corpo: await resposta.json() };
}

// Disciplina nova na grade do curso, cadastrada pelo coordenador pela API.
async function disciplinaNoCurso(token: string, cursoId: string) {
  const r = await json(await cadastrarDisciplinaApi(requisicaoJson(`${API}/disciplinas`, { cursoId, nome: nomeDisciplina(), cargaHoraria: 60 }, token)));
  expect(r.status).toBe(201);
  return r.corpo.id as string;
}

async function turmaNoCurso(token: string, cursoId: string, disciplinaId: string, professorId: string) {
  return json(await cadastrarTurmaApi(requisicaoJson(`${API}/turmas`, { cursoId, disciplinaId, professorId, nome: "Turma T", periodo: "2026/2" }, token)));
}

describe("SPEC-015 — regras de domínio (sem banco)", () => {
  it("RB-17 / INV-015-01: só conta ativa com perfil Coordenador pode coordenar curso", () => {
    expect(podeCoordenar({ perfil: "Coordenador", ativo: true })).toBe(true);
    expect(podeCoordenar({ perfil: "Coordenador", ativo: false })).toBe(false);
    expect(podeCoordenar({ perfil: "Professor", ativo: true })).toBe(false);
    expect(podeCoordenar(null)).toBe(false);
  });

  it("RF-22: curso exige nome e coordenador", () => {
    expect(validarCurso({ nome: " Eng ", coordenadorId: "c" })).toEqual({ ok: true, dados: { nome: "Eng", coordenadorId: "c" } });
    const falha = validarCurso({ nome: " " });
    expect(falha.ok).toBe(false);
    if (!falha.ok) expect(Object.keys(falha.erros).sort()).toEqual(["coordenadorId", "nome"]);
  });

  it("RB-18 / INV-015-03: a disciplina da turma precisa estar na grade do curso", () => {
    expect(disciplinaNaGrade(["d1", "d2"], "d2")).toBe(true);
    expect(disciplinaNaGrade(["d1"], "d2")).toBe(false);
  });

  it("RB-19 / INV-015-06: só há matrícula em turma do curso do estudante", () => {
    expect(podeMatricular("eco", "eco")).toBe(true);
    expect(podeMatricular("pp", "eco")).toBe(false);
    expect(podeMatricular(null, "eco")).toBe(false);
  });

  it("INV-015-07: o curso da operação é um dos cursos do coordenador (implícito se ele tiver só um)", () => {
    expect(escolherCurso(["a"], "")).toEqual({ ok: true, cursoId: "a" });
    expect(escolherCurso(["a", "b"], "b")).toEqual({ ok: true, cursoId: "b" });
    expect(escolherCurso(["a", "b"], undefined)).toEqual({ ok: false, motivo: "informe" });
    expect(escolherCurso([], undefined)).toEqual({ ok: false, motivo: "sem-curso" });
    expect(escolherCurso(["a"], "x")).toEqual({ ok: false, motivo: "fora-do-escopo" });
  });

  it("INV-015-05: conta de Estudante exige curso; os outros perfis nunca guardam curso", () => {
    const base = { nome: "Ana", email: "ana@x.com", senha: "12345678" };
    const semCurso = validarNovaConta({ ...base, perfil: "Estudante" });
    expect(semCurso.ok).toBe(false);
    if (!semCurso.ok) expect(semCurso.erros.cursoId).toBeDefined();
    expect(validarNovaConta({ ...base, perfil: "Estudante", cursoId: "c" })).toMatchObject({ ok: true, dados: { cursoId: "c" } });
    expect(validarNovaConta({ ...base, perfil: "Professor", cursoId: "c" })).toMatchObject({ ok: true, dados: { cursoId: null } });
  });

  it("INV-015-09: coordenador de curso não pode ser desativado", () => {
    expect(motivoParaNaoDesativar({ id: "m", nome: "Marina", turmasComoProfessor: 0, cursosCoordenados: 2 }, "a")).toMatch(/Marina coordena 2 curso/);
    expect(motivoParaNaoDesativar({ id: "m", nome: "Marina", turmasComoProfessor: 0, cursosCoordenados: 0 }, "a")).toBeNull();
  });
});

describe("SPEC-015 — cursos pelo administrador", () => {
  it("AC-015-01: administrador cria o curso com a coordenadora e ele aparece na lista", async () => {
    const admin = await entrar("Administrador");
    const paula = await criarUsuarioDeTeste("Coordenador", { semCurso: true });
    const nome = nomeCurso();

    const criado = await json(await criarCursoApi(requisicaoJson(`${API}/cursos`, { nome, coordenadorId: paula.id }, admin.token)));
    expect(criado.status).toBe(201);
    const lista = await json(await listarCursosApi(requisicaoComSessao(`${API}/cursos`, admin.token)));
    expect(lista.corpo.find((c: { nome: string }) => c.nome === nome)).toMatchObject({ coordenador: { id: paula.id }, disciplinas: 0, turmas: 0, estudantes: 0 });
  });

  it("AC-015-02 / INV-015-02: nome repetido (sem diferenciar maiúsculas) ou ausente é recusado com o campo indicado", async () => {
    const admin = await entrar("Administrador");
    const coordenador = await criarUsuarioDeTeste("Coordenador", { semCurso: true });
    const nome = nomeCurso();
    await criarCursoApi(requisicaoJson(`${API}/cursos`, { nome, coordenadorId: coordenador.id }, admin.token));

    const repetido = await json(await criarCursoApi(requisicaoJson(`${API}/cursos`, { nome: nome.toUpperCase(), coordenadorId: coordenador.id }, admin.token)));
    const semNome = await json(await criarCursoApi(requisicaoJson(`${API}/cursos`, { nome: "", coordenadorId: coordenador.id }, admin.token)));
    expect(repetido.status).toBe(400);
    expect(repetido.corpo.campos.nome).toMatch(/já existe/i);
    expect(semNome.status).toBe(400);
    expect(semNome.corpo.campos.nome).toBeDefined();
    expect(await prisma.curso.count({ where: { nome: { equals: nome, mode: "insensitive" } } })).toBe(1);
  });

  it("AC-015-03 / RB-17: professor ou coordenador desativado não pode coordenar", async () => {
    const admin = await entrar("Administrador");
    const professor = await criarUsuarioDeTeste("Professor");
    const inativo = await criarUsuarioDeTeste("Coordenador", { semCurso: true });
    await prisma.usuario.update({ where: { id: inativo.id }, data: { ativo: false } });

    for (const coordenadorId of [professor.id, inativo.id]) {
      const r = await json(await criarCursoApi(requisicaoJson(`${API}/cursos`, { nome: nomeCurso(), coordenadorId }, admin.token)));
      expect(r.status).toBe(400);
      expect(r.corpo.campos.coordenadorId).toBeDefined();
    }
  });

  it("AC-015-04 / INV-015-07: trocar a coordenação muda o escopo na hora", async () => {
    const admin = await entrar("Administrador");
    const paula = await entrar("Coordenador");
    const marina = await entrar("Coordenador", { semCurso: true });
    const professor = await criarUsuarioDeTeste("Professor");
    const disciplinaId = await disciplinaNoCurso(paula.token, paula.usuario.cursoId);
    const turma = (await turmaNoCurso(paula.token, paula.usuario.cursoId, disciplinaId, professor.id)).corpo;

    const troca = await json(await trocarCoordenadorApi(
      requisicaoJson(`${API}/cursos/${paula.usuario.cursoId}/coordenador`, { coordenadorId: marina.usuario.id }, admin.token),
      parametros(paula.usuario.cursoId),
    ));
    expect(troca.status).toBe(200);
    expect(troca.corpo.coordenador.id).toBe(marina.usuario.id);

    const verTurma = (token: string) => buscarTurmaApi(requisicaoComSessao(`${API}/turmas/${turma.id}`, token), parametros(turma.id));
    expect((await verTurma(marina.token)).status).toBe(200);
    expect((await verTurma(paula.token)).status).toBe(404);
    const matricula = await matricularApi(requisicaoJson(`${API}/turmas/${turma.id}/matriculas`, { email: "x@y.z" }, paula.token), parametros(turma.id));
    expect(matricula.status).toBe(403);
  });

  it("AC-015-13 / INV-015-09: coordenador de curso não pode ser desativado", async () => {
    const admin = await entrar("Administrador");
    const coordenador = await criarUsuarioDeTeste("Coordenador");
    const r = await json(await desativarApi(requisicaoJson(`${API}/contas/${coordenador.id}/desativar`, {}, admin.token), parametros(coordenador.id)));
    expect(r.status).toBe(409);
    expect(r.corpo.erro).toMatch(/coordena 1 curso/);
    expect((await prisma.usuario.findUniqueOrThrow({ where: { id: coordenador.id } })).ativo).toBe(true);
  });

  it("AC-015-12 / INV-015-05: conta de Estudante pelo administrador exige curso; o banco recusa estudante sem curso", async () => {
    const admin = await entrar("Administrador");
    const curso = (await criarUsuarioDeTeste("Coordenador")).cursoId;
    const base = { nome: "Nova", senha: "senha-forte-1", perfil: "Estudante" };

    const semCurso = await json(await criarContaApi(requisicaoJson(`${API}/contas`, { ...base, email: emailDeTeste("sem-curso") }, admin.token)));
    expect(semCurso.status).toBe(400);
    expect(semCurso.corpo.campos.cursoId).toBeDefined();
    const inexistente = await json(await criarContaApi(requisicaoJson(`${API}/contas`, { ...base, email: emailDeTeste("x"), cursoId: randomUUID() }, admin.token)));
    expect(inexistente.status).toBe(400);

    const email = emailDeTeste("com-curso");
    const comCurso = await json(await criarContaApi(requisicaoJson(`${API}/contas`, { ...base, email, cursoId: curso }, admin.token)));
    expect(comCurso.status).toBe(201);
    expect((await prisma.usuario.findUniqueOrThrow({ where: { email } })).cursoId).toBe(curso);

    // CHECK da migração: curso se e somente se Estudante.
    await expect(prisma.usuario.create({ data: { nome: "X", email: emailDeTeste("check1"), senhaHash: "h", perfil: "Estudante" } })).rejects.toThrow();
    await expect(prisma.usuario.create({ data: { nome: "X", email: emailDeTeste("check2"), senhaHash: "h", perfil: "Professor", cursoId: curso } })).rejects.toThrow();
  });

  it("AC-015-14 / INV-015-08: administrador vê só estrutura dos cursos e continua sem relatório", async () => {
    const admin = await entrar("Administrador");
    const lista = await json(await listarCursosApi(requisicaoComSessao(`${API}/cursos`, admin.token)));
    expect(lista.status).toBe(200);
    for (const curso of lista.corpo) expect(Object.keys(curso).sort()).toEqual(["coordenador", "disciplinas", "estudantes", "id", "nome", "turmas"]);
    expect((await relatorioApi(requisicaoComSessao(`${API}/relatorios`, admin.token))).status).toBe(403);
  });

  it("AC-015-17: estudante, professor e coordenador não acessam Cursos", async () => {
    for (const perfil of ["Estudante", "Professor", "Coordenador"] as const) {
      const { token } = await entrar(perfil);
      expect((await listarCursosApi(requisicaoComSessao(`${API}/cursos`, token))).status).toBe(403);
      expect((await criarCursoApi(requisicaoJson(`${API}/cursos`, { nome: nomeCurso() }, token))).status).toBe(403);
    }
  });
});

describe("SPEC-015 — grade e turmas do coordenador", () => {
  it("AC-015-05: disciplina nova entra só na grade do curso escolhido", async () => {
    const marina = await entrar("Coordenador");
    const segundo = await criarCursoDeTeste(marina.usuario.id);
    const disciplinaId = await disciplinaNoCurso(marina.token, marina.usuario.cursoId);
    const grade = await prisma.cursoDisciplina.findMany({ where: { disciplinaId } });
    expect(grade.map((g) => g.cursoId)).toEqual([marina.usuario.cursoId]);
    expect(grade.map((g) => g.cursoId)).not.toContain(segundo);
  });

  it("AC-015-06 / INV-015-04: disciplina existente entra na grade de outro curso sem duplicar", async () => {
    const eco = await entrar("Coordenador");
    const ele = await entrar("Coordenador");
    const calculo = await disciplinaNoCurso(eco.token, eco.usuario.cursoId);
    const url = `${API}/cursos/${ele.usuario.cursoId}/disciplinas`;

    const primeira = await adicionarAGradeApi(requisicaoJson(url, { disciplinaId: calculo }, ele.token), parametros(ele.usuario.cursoId));
    const segunda = await json(await adicionarAGradeApi(requisicaoJson(url, { disciplinaId: calculo }, ele.token), parametros(ele.usuario.cursoId)));
    expect(primeira.status).toBe(201);
    expect(segunda.status).toBe(409);
    expect(segunda.corpo.erro).toMatch(/já faz parte/);
    expect((await prisma.cursoDisciplina.findMany({ where: { disciplinaId: calculo } })).map((g) => g.cursoId).sort()).toEqual([eco.usuario.cursoId, ele.usuario.cursoId].sort());

    // A lista do coordenador traz a disciplina com os dois cursos.
    const lista = await json(await listarDisciplinasApi(requisicaoComSessao(`${API}/disciplinas`, ele.token)));
    expect(lista.corpo.find((d: { id: string }) => d.id === calculo).cursos).toHaveLength(2);
  });

  it("AC-015-07 / RB-18: turma com disciplina fora da grade do curso é recusada", async () => {
    const eco = await entrar("Coordenador");
    const ele = await entrar("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    const soDaEco = await disciplinaNoCurso(eco.token, eco.usuario.cursoId);

    const r = await turmaNoCurso(ele.token, ele.usuario.cursoId, soDaEco, professor.id);
    expect(r.status).toBe(400);
    expect(r.corpo.campos.disciplinaId).toMatch(/grade/);
    expect(await prisma.turma.count({ where: { cursoId: ele.usuario.cursoId } })).toBe(0);
  });

  it("AC-015-08: coordenador com 2 cursos escolhe o curso da turma; outro coordenador não a vê", async () => {
    const marina = await entrar("Coordenador");
    const cc = await criarCursoDeTeste(marina.usuario.id);
    const outro = await entrar("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    const algoritmos = await disciplinaNoCurso(marina.token, cc);

    const semCurso = await json(await cadastrarTurmaApi(requisicaoJson(`${API}/turmas`, { disciplinaId: algoritmos, professorId: professor.id, nome: "T", periodo: "2026/2" }, marina.token)));
    expect(semCurso.status).toBe(400);
    expect(semCurso.corpo.campos.cursoId).toBeDefined();

    const criada = await turmaNoCurso(marina.token, cc, algoritmos, professor.id);
    expect(criada.status).toBe(201);
    expect(criada.corpo.curso.id).toBe(cc);
    const ids = async (token: string) => (await (await listarTurmasApi(requisicaoComSessao(`${API}/turmas`, token))).json()).map((t: { id: string }) => t.id);
    expect(await ids(marina.token)).toContain(criada.corpo.id);
    expect(await ids(outro.token)).not.toContain(criada.corpo.id);
  });

  it("AC-015-09 / INV-015-07: coordenador não mexe em turma nem na grade de curso que não coordena", async () => {
    const pp = await entrar("Coordenador");
    const marina = await entrar("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    const disciplinaPp = await disciplinaNoCurso(pp.token, pp.usuario.cursoId);
    const turmaPp = (await turmaNoCurso(pp.token, pp.usuario.cursoId, disciplinaPp, professor.id)).corpo;

    expect((await buscarTurmaApi(requisicaoComSessao(`${API}/turmas/${turmaPp.id}`, marina.token), parametros(turmaPp.id))).status).toBe(404);
    const grade = await adicionarAGradeApi(
      requisicaoJson(`${API}/cursos/${pp.usuario.cursoId}/disciplinas`, { disciplinaId: disciplinaPp }, marina.token),
      parametros(pp.usuario.cursoId),
    );
    expect(grade.status).toBe(403);
    expect((await turmaNoCurso(marina.token, pp.usuario.cursoId, disciplinaPp, professor.id)).status).toBe(403);
    const disciplina = await cadastrarDisciplinaApi(requisicaoJson(`${API}/disciplinas`, { cursoId: pp.usuario.cursoId, nome: nomeDisciplina(), cargaHoraria: 60 }, marina.token));
    expect(disciplina.status).toBe(403);
  });

  it("AC-015-10: estudante cadastrado na turma pertence ao curso da turma", async () => {
    const marina = await entrar("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    const disciplinaId = await disciplinaNoCurso(marina.token, marina.usuario.cursoId);
    const turma = (await turmaNoCurso(marina.token, marina.usuario.cursoId, disciplinaId, professor.id)).corpo;
    const email = emailDeTeste("novo");

    const r = await cadastrarEstudanteApi(
      requisicaoJson(`${API}/turmas/${turma.id}/estudantes`, { nome: "Novo", email, senha: "senha-inicial-1" }, marina.token),
      parametros(turma.id),
    );
    expect(r.status).toBe(201);
    expect((await prisma.usuario.findUniqueOrThrow({ where: { email } })).cursoId).toBe(marina.usuario.cursoId);
  });

  it("AC-015-11 / INV-015-06: estudante de outro curso não é matriculado", async () => {
    const marina = await entrar("Coordenador");
    const pp = await criarUsuarioDeTeste("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    const doPp = await criarUsuarioDeTeste("Estudante", { cursoId: pp.cursoId });
    const disciplinaId = await disciplinaNoCurso(marina.token, marina.usuario.cursoId);
    const turma = (await turmaNoCurso(marina.token, marina.usuario.cursoId, disciplinaId, professor.id)).corpo;

    const r = await json(await matricularApi(requisicaoJson(`${API}/turmas/${turma.id}/matriculas`, { email: doPp.email }, marina.token), parametros(turma.id)));
    expect(r.status).toBe(409);
    expect(r.corpo.erro).toMatch(/outro curso/);
    expect(await prisma.matricula.count({ where: { turmaId: turma.id } })).toBe(0);
  });
});

describe("SPEC-015 — escopo por curso nas consultas", () => {
  it("AC-015-15: relatório e histórico do coordenador só com as turmas dos seus cursos; filtro por curso", async () => {
    const marina = await entrar("Coordenador");
    const cc = await criarCursoDeTeste(marina.usuario.id);
    const outro = await entrar("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    const eco = marina.usuario.cursoId;
    const turmaEco = (await turmaNoCurso(marina.token, eco, await disciplinaNoCurso(marina.token, eco), professor.id)).corpo;
    const turmaCc = (await turmaNoCurso(marina.token, cc, await disciplinaNoCurso(marina.token, cc), professor.id)).corpo;
    const alheia = (await turmaNoCurso(outro.token, outro.usuario.cursoId, await disciplinaNoCurso(outro.token, outro.usuario.cursoId), professor.id)).corpo;

    const relatorio = async (consulta: string) => json(await relatorioApi(requisicaoComSessao(`${API}/relatorios${consulta}`, marina.token)));
    const todos = await relatorio("");
    expect(todos.corpo.resumo.map((r: { id: string }) => r.id).sort()).toEqual([turmaEco.id, turmaCc.id].sort());
    expect(todos.corpo.cursosDisponiveis.map((c: { id: string }) => c.id).sort()).toEqual([eco, cc].sort());
    expect((await relatorio(`?curso=${cc}`)).corpo.resumo.map((r: { id: string }) => r.id)).toEqual([turmaCc.id]);
    expect((await relatorio(`?curso=${outro.usuario.cursoId}`)).status).toBe(403);

    const historico = await json(await historicoApi(requisicaoComSessao(`${API}/historico-notas`, marina.token)));
    expect(historico.corpo.turmas.map((t: { id: string }) => t.id)).not.toContain(alheia.id);
    expect((await historicoApi(requisicaoComSessao(`${API}/historico-notas?turma=${alheia.id}`, marina.token))).status).toBe(403);
  });

  it("AC-015-16: professor vê as turmas que leciona nos dois cursos, com o curso indicado", async () => {
    const eco = await entrar("Coordenador");
    const ele = await entrar("Coordenador");
    const professor = await entrar("Professor");
    const a = (await turmaNoCurso(eco.token, eco.usuario.cursoId, await disciplinaNoCurso(eco.token, eco.usuario.cursoId), professor.usuario.id)).corpo;
    const b = (await turmaNoCurso(ele.token, ele.usuario.cursoId, await disciplinaNoCurso(ele.token, ele.usuario.cursoId), professor.usuario.id)).corpo;

    const turmas = await (await listarTurmasApi(requisicaoComSessao(`${API}/turmas`, professor.token))).json();
    expect(turmas.map((t: { id: string }) => t.id).sort()).toEqual([a.id, b.id].sort());
    expect(turmas.map((t: { curso: { id: string } }) => t.curso.id).sort()).toEqual([eco.usuario.cursoId, ele.usuario.cursoId].sort());
  });
});
