// SPEC-053 — trocar perfil e importar professores: regra da troca (unitário); troca e importação (integração).
import { afterAll, describe, expect, it } from "vitest";
import { motivoParaNaoTrocarPerfil, preverProfessores } from "@/domain/contas";
import { POST as importarApi } from "@/app/api/contas/importar/route";
import { PUT as perfilApi } from "@/app/api/contas/[id]/perfil/route";
import { prisma } from "@/server/dados/prisma";
import { criarUsuarioDeTeste, emailDeTeste, removerUsuariosDeTeste } from "../apoio";
import { API, contexto, entrar, requisicao, turmaComEstudantes } from "../apoio-secretaria";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

describe("SPEC-053 — regras puras (sem banco)", () => {
  const conta = { id: "c1", nome: "Larissa", perfil: "Professor" as const, turmas: [], cursos: [], matriculas: 0 };

  it("RB-48 / INV-053-01: vínculo incompatível, Estudante sem curso e o próprio perfil são recusados", () => {
    expect(motivoParaNaoTrocarPerfil({ ...conta, turmas: ["Turma A", "Turma B", "Turma C"] }, "Estudante", "curso", "admin")).toMatchObject({ tipo: "conflito", erro: expect.stringContaining("leciona 3 turma(s)") });
    expect(motivoParaNaoTrocarPerfil({ ...conta, cursos: ["Administração"] }, "Professor" === conta.perfil ? "Coordenador" : "Professor", null, "admin")).toMatchObject({ tipo: "conflito" });
    expect(motivoParaNaoTrocarPerfil(conta, "Estudante", null, "admin")).toMatchObject({ tipo: "invalido" });
    expect(motivoParaNaoTrocarPerfil(conta, "Coordenador", null, "c1")).toMatchObject({ tipo: "conflito" });
    expect(motivoParaNaoTrocarPerfil(conta, "Coordenador", null, "admin")).toBeNull();
  });

  it("INV-053-02: e-mail repetido na planilha ou já cadastrado aponta a linha", () => {
    const linhas = preverProfessores(
      [{ linha: 2, nome: "Rita", email: "rita@x.test" }, { linha: 3, nome: "Hugo", email: "rita@x.test" }, { linha: 4, nome: "Vera", email: "vera@x.test" }, { linha: 5, nome: "", email: "a@x.test" }],
      new Set(["vera@x.test"]),
    );
    expect(linhas.map((l) => l.erro ?? "ok")).toEqual(["ok", "E-mail repetido na planilha (linha 2)", "Já existe uma conta com este e-mail", "Nome vazio"]);
  });
});

describe("SPEC-053 — troca de perfil e importação (integração)", () => {
  const trocar = (token: string, id: string, corpo: Record<string, unknown>) => perfilApi(requisicao(`${API}/contas/${id}/perfil`, "PUT", token, corpo), contexto({ id }));

  it("AC-053-01: professor com turmas não vira estudante (409 com as turmas)", async () => {
    const { professor, cursoId } = await turmaComEstudantes(0);
    const admin = await entrar("Administrador");
    const r = await trocar(admin.token, professor.id, { perfil: "Estudante", cursoId });
    expect(r.status).toBe(409);
    expect((await r.json()).erro).toMatch(/leciona 1 turma/);
  });

  it("AC-053-02: professor sem turma vira coordenador, com auditoria", async () => {
    const professor = await criarUsuarioDeTeste("Professor");
    const admin = await entrar("Administrador");
    const r = await trocar(admin.token, professor.id, { perfil: "Coordenador" });
    expect(r.status).toBe(200);
    expect((await prisma.usuario.findUniqueOrThrow({ where: { id: professor.id } })).perfil).toBe("Coordenador");
    expect(await prisma.registroAuditoria.count({ where: { autorId: admin.usuario.id, acao: "conta.perfil" } })).toBe(1);
  });

  it("AC-053-03 / AC-053-04: para Estudante sem curso é 400; com curso, ganha a ficha; trocar o próprio perfil é 409", async () => {
    const professor = await criarUsuarioDeTeste("Professor");
    const admin = await entrar("Administrador");
    expect((await trocar(admin.token, professor.id, { perfil: "Estudante" })).status).toBe(400);
    const { cursoId } = await turmaComEstudantes(0);
    expect((await trocar(admin.token, professor.id, { perfil: "Estudante", cursoId })).status).toBe(200);
    expect(await prisma.fichaEstudante.findUnique({ where: { estudanteId: professor.id } })).not.toBeNull();
    expect((await trocar(admin.token, admin.usuario.id, { perfil: "Coordenador" })).status).toBe(409);
  });

  it("AC-053-05 / INV-053-03: CSV com professores, prévia sem gravar e confirmação com senhas provisórias", async () => {
    const admin = await entrar("Administrador");
    const emails = [emailDeTeste("rita"), emailDeTeste("hugo")];
    const csv = `nome;email\r\nRita Paes;${emails[0]}\r\nHugo Leme;${emails[1]}\r\n`;
    const previa = await (await importarApi(requisicao(`${API}/contas/importar`, "POST", admin.token, { csv }))).json();
    expect(previa).toMatchObject({ gravado: false, novos: 2, erros: 0 });
    expect(await prisma.usuario.count({ where: { email: { in: emails } } })).toBe(0);
    const r = await importarApi(requisicao(`${API}/contas/importar`, "POST", admin.token, { csv, confirmar: true }));
    expect(r.status).toBe(201);
    const corpo = await r.json();
    expect(corpo.senhas).toHaveLength(2);
    const criadas = await prisma.usuario.findMany({ where: { email: { in: emails } } });
    expect(criadas.every((c) => c.perfil === "Professor" && c.trocarSenha)).toBe(true);
    expect(criadas.every((c) => c.senhaHash !== corpo.senhas[0].senha)).toBe(true);
  });

  it("AC-053-06: e-mail repetido recusa a importação inteira (400) com a linha", async () => {
    const admin = await entrar("Administrador");
    const email = emailDeTeste("repetido");
    const csv = `nome;email\r\nA;${email}\r\nB;${email}\r\n`;
    const previa = await (await importarApi(requisicao(`${API}/contas/importar`, "POST", admin.token, { csv }))).json();
    expect(previa.linhas[1].erro).toMatch(/linha 2/);
    expect((await importarApi(requisicao(`${API}/contas/importar`, "POST", admin.token, { csv, confirmar: true }))).status).toBe(400);
    expect(await prisma.usuario.count({ where: { email } })).toBe(0);
  });
});
