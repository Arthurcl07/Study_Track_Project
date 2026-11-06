// SPEC-021 — importação de estudantes por planilha: leitura e validação (unitário) e rota + banco (integração).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { csvDasSenhas, lerCsv, preverImportacao, resumoDaPrevia, type ContaExistente } from "@/domain/importacao";
import { POST as importarApi } from "@/app/api/turmas/[id]/importacao/route";
import { gerarSenhaProvisoria } from "@/server/academico/importacao";
import { conferirSenha } from "@/server/auth/senha";
import { prisma } from "@/server/dados/prisma";
import {
  PREFIXO_DISCIPLINA_TESTE,
  criarPeriodoDeTeste,
  criarUsuarioDeTeste,
  emailDeTeste,
  entrarComo,
  parametros,
  removerUsuariosDeTeste,
  requisicaoJson,
} from "../apoio";

const API = "http://localhost/api";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

async function cenario(periodo = "2026/2") {
  const coordenador = await criarUsuarioDeTeste("Coordenador");
  const professor = await criarUsuarioDeTeste("Professor");
  const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 60, cursos: { create: { cursoId: coordenador.cursoId } } } });
  const turma = await prisma.turma.create({ data: { nome: "CAL", periodo, disciplinaId: disciplina.id, professorId: professor.id, cursoId: coordenador.cursoId } });
  return { coordenador, turma, token: await entrarComo(coordenador.email, coordenador.senha) };
}

function importar(turmaId: string, csv: string, confirmar: boolean, token: string) {
  return importarApi(requisicaoJson(`${API}/turmas/${turmaId}/importacao`, { csv, confirmar }, token), parametros(turmaId));
}

describe("SPEC-021 — leitura e validação (sem banco)", () => {
  it("AC-021-07: separador vírgula, BOM, aspas e cabeçalho com e-mail", () => {
    const lido = lerCsv('﻿Nome,E-mail\r\n"Silva, Ana",ANA@X.COM\r\n\r\nBruno;b@x.com\n');
    expect(lido).toEqual({ ok: true, linhas: [{ linha: 2, nome: "Silva, Ana", email: "ana@x.com" }, { linha: 4, nome: "Bruno;b@x.com", email: "" }] });
    expect(lerCsv("nome;email\nAna;ana@x.com")).toEqual({ ok: true, linhas: [{ linha: 2, nome: "Ana", email: "ana@x.com" }] });
  });

  it("AC-021-05: sem cabeçalho, vazia ou com mais de 500 linhas é recusada", () => {
    expect(lerCsv("Ana;ana@x.com").ok).toBe(false);
    expect(lerCsv("  \n").ok).toBe(false);
    expect(lerCsv("nome;email\n").ok).toBe(false);
    const grande = ["nome;email", ...Array.from({ length: 501 }, (_, i) => `E${i};e${i}@x.com`)].join("\n");
    const r = lerCsv(grande);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erro).toContain("500");
  });

  it("INV-021-03 / INV-021-05: o que acontece com cada linha", () => {
    const contas = new Map<string, ContaExistente>([
      ["prof@x.com", { perfil: "Professor", ativo: true, cursoId: null, matriculado: false }],
      ["off@x.com", { perfil: "Estudante", ativo: false, cursoId: "c1", matriculado: false }],
      ["outro@x.com", { perfil: "Estudante", ativo: true, cursoId: "c2", matriculado: false }],
      ["ja@x.com", { perfil: "Estudante", ativo: true, cursoId: "c1", matriculado: true }],
      ["cur@x.com", { perfil: "Estudante", ativo: true, cursoId: "c1", matriculado: false }],
    ]);
    const linhas = ["nova@x.com", "nova@x.com", "invalido@", "prof@x.com", "off@x.com", "outro@x.com", "ja@x.com", "cur@x.com"].map((email, i) => ({ linha: i + 2, nome: "N", email }));
    linhas.push({ linha: 10, nome: "", email: "semnome@x.com" });
    const previa = preverImportacao(linhas, contas, "c1");
    expect(previa.map((l) => l.acao)).toEqual(["criar", "erro", "erro", "erro", "erro", "erro", "ja-matriculado", "matricular", "erro"]);
    expect(previa[1].erro).toBe("E-mail repetido na planilha (linha 2)");
    expect(previa[5].erro).toBe("Estudante de outro curso");
    expect(resumoDaPrevia(previa)).toEqual({ criar: 1, matricular: 1, jaMatriculados: 1, erros: 6 });
  });

  it("INV-021-04: senha provisória aleatória com 12 caracteres úteis; CSV das senhas", () => {
    const senhas = new Set(Array.from({ length: 50 }, () => gerarSenhaProvisoria()));
    expect(senhas.size).toBe(50);
    for (const s of senhas) expect(s).toMatch(/^[a-zA-Z2-9]{4}-[a-zA-Z2-9]{4}-[a-zA-Z2-9]{4}$/);
    expect(csvDasSenhas([{ nome: "Silva; Ana", email: "a@x.com", senha: "abc" }])).toBe('nome;email;senha provisória\r\n"Silva; Ana";a@x.com;abc');
  });
});

describe("SPEC-021 — importação (integração)", () => {
  it("AC-021-01 / INV-021-02: a prévia mostra contas novas e só matrícula e não grava nada", async () => {
    const { coordenador, turma, token } = await cenario();
    const existente = await criarUsuarioDeTeste("Estudante", { cursoId: coordenador.cursoId });
    const [a, b] = [emailDeTeste("imp-a"), emailDeTeste("imp-b")];
    const r = await importar(turma.id, `nome;email\nAna;${a}\nBruno;${b}\nExistente;${existente.email}`, false, token);
    expect(r.status).toBe(200);
    const corpo = await r.json();
    expect(corpo).toMatchObject({ gravado: false, resumo: { criar: 2, matricular: 1, jaMatriculados: 0, erros: 0 }, senhas: [] });
    expect(await prisma.usuario.count({ where: { email: { in: [a, b] } } })).toBe(0);
    expect(await prisma.matricula.count({ where: { turmaId: turma.id } })).toBe(0);
  });

  it("AC-021-02 / INV-021-01 / INV-021-04: confirmar cria contas com troca obrigatória e matricula todos; senhas devolvidas uma vez", async () => {
    const { coordenador, turma, token } = await cenario();
    const existente = await criarUsuarioDeTeste("Estudante", { cursoId: coordenador.cursoId });
    const [a, b] = [emailDeTeste("imp-a"), emailDeTeste("imp-b")];
    const r = await importar(turma.id, `nome;email\nAna;${a}\nBruno;${b}\nExistente;${existente.email}`, true, token);
    const corpo = await r.json();
    expect(corpo.gravado).toBe(true);
    expect(corpo.senhas).toHaveLength(2);
    const novas = await prisma.usuario.findMany({ where: { email: { in: [a, b] } }, select: { email: true, perfil: true, trocarSenha: true, cursoId: true, senhaHash: true } });
    expect(novas).toHaveLength(2);
    for (const n of novas) {
      expect(n).toMatchObject({ perfil: "Estudante", trocarSenha: true, cursoId: coordenador.cursoId });
      const senha = corpo.senhas.find((s: { email: string }) => s.email === n.email).senha;
      expect(n.senhaHash).not.toContain(senha);
      expect(await conferirSenha(senha, n.senhaHash)).toBe(true);
    }
    expect(await prisma.matricula.count({ where: { turmaId: turma.id } })).toBe(3);
    const registro = await prisma.registroAuditoria.findFirst({ where: { turmaId: turma.id, acao: "importacao" } });
    expect(registro?.descricao).toContain("2 conta(s) nova(s), 3 matrícula(s)");
    expect(JSON.stringify(registro)).not.toContain(corpo.senhas[0].senha);
  });

  it("AC-021-03: com erros, a confirmação é recusada e nada é gravado", async () => {
    const { turma, token } = await cenario();
    const deOutroCurso = await criarUsuarioDeTeste("Estudante");
    const a = emailDeTeste("imp-a");
    const csv = `nome;email\nAna;${a}\nAna de novo;${a}\nCaio;caio@\nDuda;${deOutroCurso.email}`;
    const previa = await (await importar(turma.id, csv, false, token)).json();
    expect(previa.linhas.map((l: { acao: string }) => l.acao)).toEqual(["criar", "erro", "erro", "erro"]);
    const r = await importar(turma.id, csv, true, token);
    expect(r.status).toBe(400);
    expect(await prisma.usuario.count({ where: { email: a } })).toBe(0);
    expect(await prisma.matricula.count({ where: { turmaId: turma.id } })).toBe(0);
  });

  it("AC-021-04: estudante já matriculado não duplica nem gera erro", async () => {
    const { coordenador, turma, token } = await cenario();
    const ja = await criarUsuarioDeTeste("Estudante", { cursoId: coordenador.cursoId });
    await prisma.matricula.create({ data: { estudanteId: ja.id, turmaId: turma.id } });
    const a = emailDeTeste("imp-a");
    const corpo = await (await importar(turma.id, `nome;email\nJá;${ja.email}\nAna;${a}`, true, token)).json();
    expect(corpo.resumo).toMatchObject({ jaMatriculados: 1, criar: 1, erros: 0 });
    expect(await prisma.matricula.count({ where: { turmaId: turma.id } })).toBe(2);
  });

  it("AC-021-05: arquivo sem cabeçalho é recusado com explicação", async () => {
    const { turma, token } = await cenario();
    const r = await importar(turma.id, "Ana;ana@x.com", false, token);
    expect(r.status).toBe(400);
    expect((await r.json()).campos.csv).toContain("nome e email");
  });

  it("AC-021-06: turma de outro coordenador é negada; período encerrado dá 409", async () => {
    const { turma } = await cenario();
    const intruso = await criarUsuarioDeTeste("Coordenador");
    const tokenIntruso = await entrarComo(intruso.email, intruso.senha);
    expect((await importar(turma.id, "nome;email\nA;a@x.com", false, tokenIntruso)).status).toBe(403);
    const encerrado = await criarPeriodoDeTeste("Encerrado");
    const fechado = await cenario(encerrado.nome);
    expect((await importar(fechado.turma.id, "nome;email\nA;a@x.com", false, fechado.token)).status).toBe(409);
  });
});
