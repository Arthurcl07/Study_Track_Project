// SPEC-058 — importação do sistema anterior: validação das planilhas (unitário); prévia, gravação, histórico e
// integralização (integração).
import { randomInt } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { aprovadoNoAnterior, COLUNAS_ALUNOS, lerPlanilha, validarAlunos, validarHistorico } from "@/domain/importacao-anterior";
import { REGRA_PADRAO } from "@/domain/situacao-academica";
import { POST as importarApi } from "@/app/api/importacao-anterior/route";
import { consultarHistorico } from "@/server/academico/documentos";
import { integralizacaoDoEstudante } from "@/server/academico/matriz";
import { prisma } from "@/server/dados/prisma";
import { emailDeTeste, removerUsuariosDeTeste } from "../apoio";
import { disciplinaNoCurso, sessao } from "../apoio-n3";
import { API, entrar, requisicao } from "../apoio-secretaria";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

// CPF com dígitos verificadores corretos a partir de 9 dígitos aleatórios.
function cpfValido() {
  const d = Array.from({ length: 9 }, () => randomInt(10));
  for (const n of [9, 10]) {
    const resto = (d.slice(0, n).reduce((s, x, i) => s + x * (n + 1 - i), 0) * 10) % 11;
    d.push(resto === 10 ? 0 : resto);
  }
  return d.join("");
}
const matricula = () => `19${randomInt(10_000_000, 99_999_999)}`;

describe("SPEC-058 — regras puras (sem banco)", () => {
  const cursos = new Map([["administracao", { id: "c1", nome: "Administração" }]]);
  const ctx = { cursos, emails: new Set(["ja@x.test"]), matriculas: new Set(["11111111"]), cpfs: new Set<string>() };
  const linha = (n: number, v: Partial<Record<(typeof COLUNAS_ALUNOS)[number], string>>) => ({
    linha: n,
    valores: { nome: "Paulo", email: `p${n}@x.test`, curso: "Administração", matricula: `2019000${n}`, cpf: "", nascimento: "", telefone: "", ...v },
  });

  it("RB-49: e-mail ou matrícula repetidos, CPF inválido, curso inexistente apontam a linha", () => {
    const { alunos, erros } = validarAlunos(
      [linha(2, {}), linha(3, { email: "p2@x.test" }), linha(4, { cpf: "111.111.111-11" }), linha(5, { curso: "Medicina" }), linha(6, { matricula: "11111111" }), linha(7, { email: "ja@x.test" })],
      ctx,
      "2026-11-14",
    );
    expect(alunos.map((a) => a.linha)).toEqual([2]);
    expect(erros.map((e) => [e.linha, e.erro])).toEqual([
      [3, "E-mail repetido na planilha (linha 2)"], [4, "CPF inválido"], [5, 'Curso "Medicina" não existe'], [6, "Número de matrícula já existe no sistema"], [7, "Já existe uma conta com este e-mail"],
    ]);
  });

  it("RB-49 / INV-058-03: histórico só da matriz do curso, média 0–10, frequência 0–100 e período AAAA/N; aprovação pela regra", () => {
    const { alunos } = validarAlunos([linha(2, {})], ctx, "2026-11-14");
    const matrizes = new Map([["c1", new Map([["economia", { id: "d1", nome: "Economia" }]])]]);
    const h = (n: number, v: Record<string, string>) => ({ linha: n, valores: { matricula: "20190002", disciplina: "Economia", periodo: "2024/1", media: "7,5", frequencia: "90", ...v } });
    const { registros, erros } = validarHistorico([h(2, {}), h(3, { disciplina: "Cálculo III" }), h(4, { media: "11" }), h(5, { frequencia: "101" }), h(6, { periodo: "2024-1" }), h(7, { matricula: "999" })], alunos, matrizes);
    expect(registros).toHaveLength(1);
    expect(erros.map((e) => e.linha)).toEqual([3, 4, 5, 6, 7]);
    expect(erros[0].erro).toBe('"Cálculo III" não está na matriz de Administração');
    expect([aprovadoNoAnterior({ media: 6, frequencia: 75 }, REGRA_PADRAO), aprovadoNoAnterior({ media: 5.9, frequencia: 90 }, REGRA_PADRAO)]).toEqual([true, false]);
    expect(lerPlanilha("nome;email\r\n", COLUNAS_ALUNOS, "alunos")).toMatchObject({ ok: false });
  });
});

describe("SPEC-058 — importação (integração)", () => {
  async function cenario() {
    const admin = await entrar("Administrador");
    const coordenador = await entrar("Coordenador");
    const cursoId = coordenador.usuario.cursoId;
    const curso = await prisma.curso.findUniqueOrThrow({ where: { id: cursoId } });
    const disciplinas = [];
    for (let i = 0; i < 4; i++) disciplinas.push(await disciplinaNoCurso(cursoId, 60, { semestre: 1, obrigatoria: true }));
    const mat = matricula();
    const email = emailDeTeste("anterior");
    const alunos = `nome;email;curso;matricula;cpf;nascimento;telefone\r\nPaulo Reis;${email};${curso.nome};${mat};${cpfValido()};2001-05-14;(11) 98888-0000\r\n`;
    const linhas = disciplinas.map((d, i) => `${mat};${d.nome};2024/1;${i < 3 ? "7,5" : "4,0"};90`);
    const historico = `matricula;disciplina;periodo;media;frequencia\r\n${linhas.join("\r\n")}\r\n`;
    return { admin, cursoId, mat, email, alunos, historico, disciplinas };
  }
  const importar = (token: string, corpo: Record<string, unknown>) => importarApi(requisicao(`${API}/importacao-anterior`, "POST", token, corpo));

  it("AC-058-01: a prévia mostra as contagens sem gravar", async () => {
    const { admin, alunos, historico, email } = await cenario();
    const r = await importar(admin.token, { alunos, historico });
    expect(r.status).toBe(200);
    const corpo = await r.json();
    expect(corpo).toMatchObject({ gravado: false, resumo: { alunos: 1, registros: 4, aprovados: 3, erros: 0 } });
    expect(corpo.previa[0].integralizacao).toBe(75);
    expect(await prisma.usuario.count({ where: { email } })).toBe(0);
  });

  it("AC-058-02 / AC-058-05 / AC-058-06: confirmar grava conta, ficha e histórico; as 3 aprovadas contam na integralização e aparecem no histórico", async () => {
    const { admin, alunos, historico, email, mat, cursoId } = await cenario();
    const r = await importar(admin.token, { alunos, historico, confirmar: true });
    expect(r.status).toBe(201);
    expect((await r.json()).senhas).toHaveLength(1);
    const conta = await prisma.usuario.findUniqueOrThrow({ where: { email }, include: { ficha: true } });
    expect(conta).toMatchObject({ perfil: "Estudante", trocarSenha: true, cursoId });
    expect(conta.ficha?.numeroMatricula).toBe(mat);
    expect(await prisma.historicoAnterior.count({ where: { estudanteId: conta.id } })).toBe(4);
    const { integralizacao } = await integralizacaoDoEstudante(conta.id, cursoId);
    expect(integralizacao.percentual).toBe(75);
    const historicoEscolar = await consultarHistorico(sessao(admin.usuario.id, "Administrador"), { estudante: conta.id });
    expect(historicoEscolar!.anterior.map((a) => a.resultado).sort()).toEqual(["Aprovado", "Aprovado", "Aprovado", "ReprovadoNota"]);
    expect(historicoEscolar!.resumo.disciplinasAprovadas).toBe(3);
    expect(await prisma.registroAuditoria.count({ where: { autorId: admin.usuario.id, acao: "importacao.anterior", cursoId } })).toBe(1);
  });

  it("AC-058-03 / AC-058-04 / INV-058-01: uma linha com erro e nada é gravado", async () => {
    const { admin, alunos, historico, email } = await cenario();
    const comErro = historico.replace(/\r\n$/, "") + `\r\n${alunos.split("\r\n")[1].split(";")[3]};Cálculo III;2024/1;7;90\r\n`;
    const previa = await (await importar(admin.token, { alunos, historico: comErro })).json();
    expect(previa.erros).toEqual([expect.objectContaining({ planilha: "historico", erro: expect.stringContaining("Cálculo III") })]);
    expect((await importar(admin.token, { alunos, historico: comErro, confirmar: true })).status).toBe(400);
    const cpfInvalido = alunos.replace(/;(\d{11});/, ";11111111111;");
    expect((await (await importar(admin.token, { alunos: cpfInvalido, historico })).json()).erros[0].erro).toBe("CPF inválido");
    expect(await prisma.usuario.count({ where: { email } })).toBe(0);
    const coordenador = await entrar("Coordenador");
    expect((await importar(coordenador.token, { alunos, historico })).status).toBe(403);
  });
});
