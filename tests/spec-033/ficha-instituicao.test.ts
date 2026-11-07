// SPEC-033 — ficha do estudante e dados da instituição: CPF, CNPJ, número de matrícula e logotipo (unitário) e
// ficha, privacidade por perfil e instituição nos documentos (integração).
import { afterAll, describe, expect, it } from "vitest";
import { cnpjValido, cpfValido, numeroDeMatricula, validarLogotipo } from "@/domain/secretaria";
import { GET as fichaGet, PUT as fichaPut } from "@/app/api/estudantes/[id]/ficha/route";
import { GET as instituicaoGet, PUT as instituicaoPut } from "@/app/api/instituicao/route";
import { consultarFicha } from "@/server/academico/secretaria";
import { turmasParaLancamento } from "@/server/dados/notas";
import type { Sessao } from "@/server/auth/token";
import { prisma } from "@/server/dados/prisma";
import { criarUsuarioDeTeste, removerUsuariosDeTeste } from "../apoio";
import { API, contexto, entrar, requisicao, turmaComEstudantes } from "../apoio-secretaria";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const salvarFicha = (id: string, corpo: Record<string, unknown>, token: string) => fichaPut(requisicao(`${API}/estudantes/${id}/ficha`, "PUT", token, corpo), contexto({ id }));

describe("SPEC-033 — regras puras (sem banco)", () => {
  it("RB-33: número de matrícula, CPF, CNPJ e logotipo", () => {
    expect(numeroDeMatricula(2026, 42)).toBe("20260042");
    expect([cpfValido("123.456.789-09"), cpfValido("123.456.789-00"), cpfValido("111.111.111-11")]).toEqual([true, false, false]);
    expect([cnpjValido("12.345.678/0001-95"), cnpjValido("12.345.678/0001-00")]).toEqual([true, false]);
    expect(validarLogotipo("data:image/png;base64,iVBORw0KGgo=").ok).toBe(true);
    expect(validarLogotipo("data:image/gif;base64,R0lGOD").ok).toBe(false);
    // AC-033-07: 500 KB.
    expect(validarLogotipo(`data:image/png;base64,${"A".repeat(Math.ceil((500 * 1024 * 4) / 3))}`).ok).toBe(false);
  });
});

describe("SPEC-033 — ficha e instituição (integração)", () => {
  it("AC-033-01 / INV-033-01: todo estudante novo ganha o próximo número do ano", async () => {
    const a = await criarUsuarioDeTeste("Estudante");
    const b = await criarUsuarioDeTeste("Estudante");
    const [fa, fb] = await Promise.all([a, b].map((e) => prisma.fichaEstudante.findUniqueOrThrow({ where: { estudanteId: e.id } })));
    expect(fa.numeroMatricula).toMatch(/^\d{8}$/);
    expect(Number(fb.numeroMatricula)).toBeGreaterThan(Number(fa.numeroMatricula));
    const professor = await criarUsuarioDeTeste("Professor");
    expect(await prisma.fichaEstudante.count({ where: { estudanteId: professor.id } })).toBe(0);
  });

  it("AC-033-02 / INV-033-02: CPF inválido ou repetido é recusado; a auditoria não guarda o CPF inteiro", async () => {
    const admin = await entrar("Administrador");
    const a = await criarUsuarioDeTeste("Estudante");
    const b = await criarUsuarioDeTeste("Estudante");
    const cpf = "529.982.247-25";
    await prisma.fichaEstudante.updateMany({ where: { cpf }, data: { cpf: null } });
    expect((await salvarFicha(a.id, { cpf: "123.456.789-00" }, admin.token)).status).toBe(400);
    expect((await salvarFicha(a.id, { cpf, dataNascimento: "2005-03-14", responsavelNome: "Márcia" }, admin.token)).status).toBe(200);
    const repetido = await salvarFicha(b.id, { cpf }, admin.token);
    expect(repetido.status).toBe(400);
    expect((await repetido.json()).campos.cpf).toMatch(/outro estudante/);
    const registro = await prisma.registroAuditoria.findFirstOrThrow({ where: { autorId: admin.usuario.id, acao: "ficha.alterada" } });
    expect(JSON.stringify(registro)).not.toContain("529.982.247");
    await prisma.fichaEstudante.update({ where: { estudanteId: a.id }, data: { cpf: null } });
  });

  it("AC-033-03 / AC-033-04 / AC-033-05 / INV-033-03: coordenador do curso lê; professor só nome e matrícula; estudante a própria", async () => {
    const { coordenador, professor, estudantes: [e] } = await turmaComEstudantes(1);
    expect((await fichaGet(requisicao(`${API}/estudantes/${e.id}/ficha`, "GET", coordenador.token), contexto({ id: e.id }))).status).toBe(200);
    expect((await salvarFicha(e.id, { telefone: "(19) 99999-0000" }, coordenador.token)).status).toBe(403);
    const outro = await entrar("Coordenador");
    expect((await fichaGet(requisicao(`${API}/estudantes/${e.id}/ficha`, "GET", outro.token), contexto({ id: e.id }))).status).toBe(404);

    const turmas = await turmasParaLancamento(professor.id);
    const visto = turmas.flatMap((t) => t.matriculas.map((m) => m.estudante)).find((x) => x.id === e.id)!;
    expect(Object.keys(visto).sort()).toEqual(["ficha", "id", "nome"]);
    expect(Object.keys(visto.ficha!)).toEqual(["numeroMatricula"]);

    const propria = await consultarFicha({ usuarioId: e.id, nome: "E", perfil: "Estudante" } as Sessao, e.id);
    expect(propria?.numeroMatricula).toMatch(/^\d{8}$/);
    expect(await consultarFicha({ usuarioId: e.id, nome: "E", perfil: "Estudante" } as Sessao, coordenador.usuario.id)).toBeNull();
  });

  it("AC-033-06 / AC-033-07 / INV-033-04: a instituição é um registro único e o logotipo grande é recusado", async () => {
    const admin = await entrar("Administrador");
    const anterior = await prisma.instituicao.findUnique({ where: { id: 1 } });
    const r = await instituicaoPut(requisicao(`${API}/instituicao`, "PUT", admin.token, { nome: "Faculdade Teste", cnpj: "12.345.678/0001-95", responsavelSecretaria: "Mariana Torres" }));
    expect(r.status).toBe(200);
    expect(await prisma.instituicao.count()).toBe(1);
    const lida = await (await instituicaoGet(requisicao(`${API}/instituicao`, "GET", admin.token))).json();
    expect(lida).toMatchObject({ nome: "Faculdade Teste", cnpj: "12.345.678/0001-95" });
    const grande = await instituicaoPut(requisicao(`${API}/instituicao`, "PUT", admin.token, { nome: "X", logotipo: `data:image/png;base64,${"A".repeat(300_000)}` }));
    expect(grande.status).toBe(400);
    // Volta como estava (o seed pode ter preenchido).
    if (anterior) await prisma.instituicao.update({ where: { id: 1 }, data: { ...anterior, atualizadaEm: undefined } });
    else await prisma.instituicao.delete({ where: { id: 1 } });
  });
});
