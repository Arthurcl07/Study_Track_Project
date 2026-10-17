// SPEC-010 — administrador, gestão de contas e troca do professor da turma: regras (unitário) e API (integração).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { MENSAGEM_DESATIVAR_A_SI_MESMO, motivoParaNaoDesativar, validarNovaConta } from "@/domain/contas";
import { RECURSOS, podeAcessar } from "@/domain/autorizacao";
import { POST as desativarApi } from "@/app/api/contas/[id]/desativar/route";
import { POST as reativarApi } from "@/app/api/contas/[id]/reativar/route";
import { GET as listarApi, POST as criarApi } from "@/app/api/contas/route";
import { GET as relatoriosApi } from "@/app/api/relatorios/route";
import { GET as dashboardApi } from "@/app/api/turmas/[id]/dashboard/route";
import { POST as trocarProfessorApi } from "@/app/api/turmas/[id]/professor/route";
import { GET as turmasApi } from "@/app/api/turmas/route";
import { recalcularIndicador } from "@/server/academico/indicador";
import { prisma } from "@/server/dados/prisma";
import {
  PREFIXO_DISCIPLINA_TESTE, criarUsuarioDeTeste, emailDeTeste, entrarComo, parametros, removerUsuariosDeTeste,
  requisicaoComSessao, requisicaoJson,
} from "../apoio";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const URL_CONTAS = "http://localhost/api/contas";

async function comoAdmin() {
  const admin = await criarUsuarioDeTeste("Administrador");
  return { admin, token: await entrarComo(admin.email, admin.senha) };
}

async function criarConta(token: string, corpo: Record<string, unknown>) {
  const resposta = await criarApi(requisicaoJson(URL_CONTAS, corpo, token));
  return { status: resposta.status, corpo: await resposta.json() };
}

async function alterar(token: string, contaId: string, acao: "desativar" | "reativar") {
  const rota = acao === "desativar" ? desativarApi : reativarApi;
  const resposta = await rota(requisicaoJson(`${URL_CONTAS}/${contaId}/${acao}`, {}, token), parametros(contaId));
  return { status: resposta.status, corpo: await resposta.json() };
}

// Turma do coordenador com o professor informado e um estudante em Risco com plano ativo e plano encerrado.
async function turmaComPlanos(professorId: string, coordenadorId: string) {
  const estudante = await criarUsuarioDeTeste("Estudante");
  const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60 } });
  const turma = await prisma.turma.create({ data: { nome: "T", periodo: "2026/2", disciplinaId: disciplina.id, professorId, coordenadorId } });
  await prisma.matricula.create({ data: { estudanteId: estudante.id, turmaId: turma.id } });
  await prisma.frequencia.create({ data: { estudanteId: estudante.id, turmaId: turma.id, percentual: 60 } });
  await recalcularIndicador(estudante.id, turma.id);
  const encerrado = await prisma.planoRecuperacao.create({ data: { estudanteId: estudante.id, turmaId: turma.id, professorId, status: "Encerrado", encerradoEm: new Date() } });
  const ativo = await prisma.planoRecuperacao.create({ data: { estudanteId: estudante.id, turmaId: turma.id, professorId, itens: { create: [{ descricao: "Item", ordem: 0 }] } } });
  return { turma, estudante, ativo, encerrado };
}

describe("SPEC-010 — regras de domínio", () => {
  it("RB-01 / INV-010-01: conta nova exige nome, e-mail, senha de 8+ caracteres e um dos quatro perfis", () => {
    expect(validarNovaConta({ nome: "Júlia", email: "julia@x.com", senha: "12345678", perfil: "Professor" })).toEqual({
      ok: true, dados: { nome: "Júlia", email: "julia@x.com", senha: "12345678", perfil: "Professor" },
    });
    const invalida = validarNovaConta({ nome: "", email: "x", senha: "123", perfil: "Admin" });
    expect(invalida.ok).toBe(false);
    if (!invalida.ok) expect(Object.keys(invalida.erros).sort()).toEqual(["email", "nome", "perfil", "senha"]);
    expect(validarNovaConta({ nome: "A", email: "a@x.com", senha: "12345678" }).ok).toBe(false);
  });

  it("RB-14 / INV-010-06: não desativa a si mesmo nem professor com turma; os demais podem", () => {
    expect(motivoParaNaoDesativar({ id: "a", nome: "Admin", turmasComoProfessor: 0 }, "a")).toBe(MENSAGEM_DESATIVAR_A_SI_MESMO);
    expect(motivoParaNaoDesativar({ id: "p", nome: "Carlos", turmasComoProfessor: 2 }, "a")).toMatch(/Carlos.*2 turma/);
    expect(motivoParaNaoDesativar({ id: "e", nome: "Ana", turmasComoProfessor: 0 }, "a")).toBeNull();
  });

  it("RB-13 / INV-010-02 / INV-010-03: Administrador só tem a gestão de contas; os outros perfis não a têm", () => {
    for (const recurso of Object.values(RECURSOS)) {
      expect(podeAcessar("Administrador", recurso)).toBe(recurso === RECURSOS.gestaoContas);
    }
    for (const perfil of ["Estudante", "Professor", "Coordenador"]) expect(podeAcessar(perfil, RECURSOS.gestaoContas)).toBe(false);
  });
});

describe("SPEC-010 — gestão de contas", () => {
  it("AC-010-01: administrador cria conta de Professor, ativa, com senha em hash, e ela consegue entrar", async () => {
    const { token } = await comoAdmin();
    const email = emailDeTeste("novo-professor");

    const { status, corpo } = await criarConta(token, { nome: "Novo Professor", email, senha: "senha-forte-1", perfil: "Professor" });

    expect(status).toBe(201);
    expect(corpo).toMatchObject({ email, perfil: "Professor", ativo: true });
    expect(corpo).not.toHaveProperty("senhaHash");
    const salvo = await prisma.usuario.findUniqueOrThrow({ where: { email } });
    expect(salvo.senhaHash).not.toBe("senha-forte-1");
    await expect(entrarComo(email, "senha-forte-1")).resolves.toBeTruthy();
  });

  it("AC-010-02: sem e-mail ou com e-mail repetido o cadastro é impedido, indica o campo e nada é gravado", async () => {
    const { admin, token } = await comoAdmin();
    const antes = await prisma.usuario.count();

    const semEmail = await criarConta(token, { nome: "X", senha: "senha-forte-1", perfil: "Estudante" });
    const repetido = await criarConta(token, { nome: "X", email: admin.email, senha: "senha-forte-1", perfil: "Estudante" });

    expect(semEmail.status).toBe(400);
    expect(semEmail.corpo.campos.email).toBeDefined();
    expect(repetido.status).toBe(400);
    expect(repetido.corpo.campos.email).toMatch(/já existe/i);
    expect(await prisma.usuario.count()).toBe(antes);
  });

  it("AC-010-03: filtro por perfil devolve só contas daquele perfil, sem hash de senha", async () => {
    const { token } = await comoAdmin();
    await criarUsuarioDeTeste("Coordenador");

    const resposta = await listarApi(requisicaoComSessao(`${URL_CONTAS}?perfil=Coordenador`, token));
    const contas = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(contas.length).toBeGreaterThan(0);
    expect(contas.every((c: { perfil: string }) => c.perfil === "Coordenador")).toBe(true);
    expect(JSON.stringify(contas)).not.toContain("senhaHash");
  });

  it("AC-010-04 / INV-010-04: conta desativada perde a sessão aberta na hora e não consegue mais entrar", async () => {
    const { token } = await comoAdmin();
    const estudante = await criarUsuarioDeTeste("Estudante");
    const sessaoDoEstudante = await entrarComo(estudante.email, estudante.senha);
    expect((await turmasApi(requisicaoComSessao("http://localhost/api/turmas", sessaoDoEstudante))).status).toBe(200);

    expect((await alterar(token, estudante.id, "desativar")).status).toBe(200);

    expect((await turmasApi(requisicaoComSessao("http://localhost/api/turmas", sessaoDoEstudante))).status).toBe(401);
    await expect(entrarComo(estudante.email, estudante.senha)).rejects.toThrow(/401/);
  });

  it("AC-010-05 / INV-010-05: reativar devolve o acesso, e os dados da conta continuam lá", async () => {
    const { token } = await comoAdmin();
    const professor = await criarUsuarioDeTeste("Professor");
    const coordenador = await criarUsuarioDeTeste("Coordenador");
    const { estudante, turma } = await turmaComPlanos(professor.id, coordenador.id);

    await alterar(token, estudante.id, "desativar");
    expect(await prisma.matricula.count({ where: { estudanteId: estudante.id, turmaId: turma.id } })).toBe(1);
    expect(await prisma.indicadorAcademico.count({ where: { estudanteId: estudante.id } })).toBe(1);

    expect((await alterar(token, estudante.id, "reativar")).corpo).toMatchObject({ ativo: true });
    await expect(entrarComo(estudante.email, estudante.senha)).resolves.toBeTruthy();
  });

  it("AC-010-06: administrador não desativa a si mesmo nem professor responsável por turma", async () => {
    const { admin, token } = await comoAdmin();
    const professor = await criarUsuarioDeTeste("Professor");
    const coordenador = await criarUsuarioDeTeste("Coordenador");
    await turmaComPlanos(professor.id, coordenador.id);

    const proprio = await alterar(token, admin.id, "desativar");
    const comTurma = await alterar(token, professor.id, "desativar");

    expect(proprio.status).toBe(409);
    expect(proprio.corpo.erro).toBe(MENSAGEM_DESATIVAR_A_SI_MESMO);
    expect(comTurma.status).toBe(409);
    expect(comTurma.corpo.erro).toMatch(/1 turma/);
    expect((await prisma.usuario.findUniqueOrThrow({ where: { id: professor.id } })).ativo).toBe(true);
  });

  it("AC-010-07 / INV-010-02: Estudante, Professor e Coordenador não usam a gestão de contas", async () => {
    for (const perfil of ["Estudante", "Professor", "Coordenador"] as const) {
      const usuario = await criarUsuarioDeTeste(perfil);
      const token = await entrarComo(usuario.email, usuario.senha);
      expect((await listarApi(requisicaoComSessao(URL_CONTAS, token))).status).toBe(403);
      expect((await criarConta(token, { nome: "X", email: emailDeTeste("x"), senha: "senha-forte-1", perfil: "Administrador" })).status).toBe(403);
    }
  });

  it("AC-010-08 / RB-13: administrador não acessa dados acadêmicos", async () => {
    const { token } = await comoAdmin();
    const professor = await criarUsuarioDeTeste("Professor");
    const coordenador = await criarUsuarioDeTeste("Coordenador");
    const { turma } = await turmaComPlanos(professor.id, coordenador.id);

    expect((await turmasApi(requisicaoComSessao("http://localhost/api/turmas", token))).status).toBe(403);
    expect((await relatoriosApi(requisicaoComSessao("http://localhost/api/relatorios", token))).status).toBe(403);
    const dashboard = await dashboardApi(requisicaoComSessao(`http://localhost/api/turmas/${turma.id}/dashboard`, token), parametros(turma.id));
    expect(dashboard.status).toBe(403);
  });
});

describe("SPEC-010 — troca do professor da turma (RF-17)", () => {
  async function trocar(token: string, turmaId: string, professorId: string) {
    const resposta = await trocarProfessorApi(requisicaoJson(`http://localhost/api/turmas/${turmaId}/professor`, { professorId }, token), parametros(turmaId));
    return { status: resposta.status, corpo: await resposta.json() };
  }

  it("AC-010-09 / INV-010-07: turma e plano ativo passam ao novo professor; o encerrado fica com o anterior; aí o anterior pode ser desativado", async () => {
    const anterior = await criarUsuarioDeTeste("Professor");
    const novo = await criarUsuarioDeTeste("Professor");
    const coordenador = await criarUsuarioDeTeste("Coordenador");
    const { turma, ativo, encerrado } = await turmaComPlanos(anterior.id, coordenador.id);
    const tokenCoordenador = await entrarComo(coordenador.email, coordenador.senha);

    const { status, corpo } = await trocar(tokenCoordenador, turma.id, novo.id);

    expect(status).toBe(200);
    expect(corpo.professor.id).toBe(novo.id);
    expect((await prisma.planoRecuperacao.findUniqueOrThrow({ where: { id: ativo.id } })).professorId).toBe(novo.id);
    expect((await prisma.planoRecuperacao.findUniqueOrThrow({ where: { id: encerrado.id } })).professorId).toBe(anterior.id);

    const tokenAnterior = await entrarComo(anterior.email, anterior.senha);
    const tokenNovo = await entrarComo(novo.email, novo.senha);
    const url = `http://localhost/api/turmas/${turma.id}/dashboard`;
    expect((await dashboardApi(requisicaoComSessao(url, tokenAnterior), parametros(turma.id))).status).toBe(403);
    expect((await dashboardApi(requisicaoComSessao(url, tokenNovo), parametros(turma.id))).status).toBe(200);

    const { token: tokenAdmin } = await comoAdmin();
    expect((await alterar(tokenAdmin, anterior.id, "desativar")).status).toBe(200);
  });

  it("AC-010-10: troca para professor desativado, para quem não é Professor ou em turma de outro coordenador é impedida", async () => {
    const atual = await criarUsuarioDeTeste("Professor");
    const inativo = await criarUsuarioDeTeste("Professor");
    const estudante = await criarUsuarioDeTeste("Estudante");
    const coordenador = await criarUsuarioDeTeste("Coordenador");
    const outroCoordenador = await criarUsuarioDeTeste("Coordenador");
    const { turma } = await turmaComPlanos(atual.id, coordenador.id);
    await prisma.usuario.update({ where: { id: inativo.id }, data: { ativo: false } });
    const token = await entrarComo(coordenador.email, coordenador.senha);

    expect((await trocar(token, turma.id, inativo.id)).status).toBe(400);
    expect((await trocar(token, turma.id, estudante.id)).status).toBe(400);
    const tokenOutro = await entrarComo(outroCoordenador.email, outroCoordenador.senha);
    expect((await trocar(tokenOutro, turma.id, inativo.id)).status).toBe(403);
    expect((await prisma.turma.findUniqueOrThrow({ where: { id: turma.id } })).professorId).toBe(atual.id);
  });
});
