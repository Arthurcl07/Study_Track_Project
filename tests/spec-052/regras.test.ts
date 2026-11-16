// SPEC-052 — regras de avaliação configuráveis: classificação com a regra (unitário, uma por RB); prévia, recálculo
// e período encerrado (integração). A regra da instituição volta à de antes ao fim do arquivo.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { resultadoDaTurma } from "@/domain/documentos";
import { classificarSituacao, elegivelAoExame, REGRA_PADRAO, textoDaRegra, validarRegra, type RegraAvaliacao } from "@/domain/situacao-academica";
import { POST as previaApi } from "@/app/api/instituicao/regras/previa/route";
import { PUT as salvarApi } from "@/app/api/instituicao/regras/route";
import { mudarStatusDoPeriodo } from "@/server/academico/periodos";
import { consultarBoletim } from "@/server/academico/documentos";
import { prisma } from "@/server/dados/prisma";
import { regraVigente } from "@/server/dados/regras";
import { criarPeriodoDeTeste, removerUsuariosDeTeste } from "../apoio";
import { sessao } from "../apoio-n3";
import { API, entrar, requisicao, turmaComEstudantes } from "../apoio-secretaria";

const SETE: RegraAvaliacao = { mediaMinima: 7, limiteRisco: 5, frequenciaMinima: 75, notaExame: 5 };
let anterior: RegraAvaliacao = REGRA_PADRAO;
let criouInstituicao = false;

beforeAll(async () => {
  const instituicao = await prisma.instituicao.findUnique({ where: { id: 1 } });
  if (!instituicao) {
    await prisma.instituicao.create({ data: { id: 1, nome: "Instituição de teste" } });
    criouInstituicao = true;
  }
  anterior = await regraVigente();
});

afterAll(async () => {
  const admin = await entrar("Administrador");
  await salvarApi(requisicao(`${API}/instituicao/regras`, "PUT", admin.token, anterior));
  if (criouInstituicao) await prisma.instituicao.delete({ where: { id: 1 } });
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

describe("SPEC-052 — regras puras (sem banco)", () => {
  it("RB-47 / INV-052-03: faixas e limite de Risco menor que a média mínima", () => {
    expect(validarRegra({ mediaMinima: "7,0", limiteRisco: "5", frequenciaMinima: "80%", notaExame: "5,0" })).toEqual({ ok: true, regra: { mediaMinima: 7, limiteRisco: 5, frequenciaMinima: 80, notaExame: 5 } });
    expect(validarRegra({ mediaMinima: 6, limiteRisco: 6.5, frequenciaMinima: 75, notaExame: 5 })).toMatchObject({ ok: false, erros: { limiteRisco: expect.any(String) } });
    expect(validarRegra({ mediaMinima: 9, limiteRisco: 5, frequenciaMinima: 95, notaExame: 8 })).toMatchObject({ ok: false, erros: { mediaMinima: expect.any(String), frequenciaMinima: expect.any(String), notaExame: expect.any(String) } });
  });

  it("RB-06 com a regra: média 6,5 é Normal na padrão e Atenção com mínima 7,0", () => {
    expect(classificarSituacao(6.5, 90)).toBe("Normal");
    expect(classificarSituacao(6.5, 90, SETE)).toBe("Atencao");
  });

  it("RB-05 com a regra (AC-052-05): frequência mínima 80%, 78% é Risco", () => {
    expect(classificarSituacao(9, 78)).toBe("Normal");
    expect(classificarSituacao(9, 78, { ...REGRA_PADRAO, frequenciaMinima: 80 })).toBe("Risco");
  });

  it("RB-07 com a regra: limite de Risco 4,0, média 4,5 é Atenção", () => {
    expect(classificarSituacao(4.5, 90)).toBe("Risco");
    expect(classificarSituacao(4.5, 90, { ...REGRA_PADRAO, limiteRisco: 4 })).toBe("Atencao");
  });

  it("RB-29 com a regra: exame e nota final mínima seguem a regra; RB-24 o resultado também", () => {
    expect(elegivelAoExame(6.5, 80, SETE)).toBe(true);
    expect(elegivelAoExame(6.5, 80)).toBe(false);
    expect(resultadoDaTurma({ encerrado: true, media: 5, frequencia: 80, exame: 4.5, regra: { ...REGRA_PADRAO, notaExame: 4.5 } })).toBe("AprovadoExame");
    expect(resultadoDaTurma({ encerrado: true, media: 5, frequencia: 80, exame: 4.5 })).toBe("ReprovadoNota");
    expect(textoDaRegra(REGRA_PADRAO)).toBe("média ≥ 6,0 · freq. ≥ 75% · exame ≥ 5,0");
  });
});

describe("SPEC-052 — prévia, recálculo e período encerrado (integração)", () => {
  async function cenario() {
    const aberto = await criarPeriodoDeTeste();
    const base = await turmaComEstudantes(1, aberto.nome);
    const [estudante] = base.estudantes;
    await prisma.indicadorAcademico.create({ data: { estudanteId: estudante.id, turmaId: base.turma.id, media: 6.5, frequenciaAtual: 90, situacao: "Normal", atualizadoEm: new Date() } });
    return { ...base, estudante, admin: await entrar("Administrador") };
  }

  it("AC-052-01: a prévia conta quem muda de situação e não grava nada", async () => {
    const { admin, estudante, turma } = await cenario();
    await salvarApi(requisicao(`${API}/instituicao/regras`, "PUT", admin.token, REGRA_PADRAO));
    const r = await previaApi(requisicao(`${API}/instituicao/regras/previa`, "POST", admin.token, SETE));
    expect(r.status).toBe(200);
    const { mudancas } = await r.json();
    expect(mudancas.transicoes.find((t: { de: string; para: string }) => t.de === "Normal" && t.para === "Atencao").quantidade).toBeGreaterThanOrEqual(1);
    expect((await prisma.indicadorAcademico.findUniqueOrThrow({ where: { estudanteId_turmaId: { estudanteId: estudante.id, turmaId: turma.id } } })).situacao).toBe("Normal");
    expect((await regraVigente()).mediaMinima).toBe(REGRA_PADRAO.mediaMinima);
  });

  it("AC-052-02 / INV-052-01: salvar 7,0 recalcula os períodos abertos (6,5 vira Atenção) e audita", async () => {
    const { admin, estudante, turma } = await cenario();
    const r = await salvarApi(requisicao(`${API}/instituicao/regras`, "PUT", admin.token, SETE));
    expect(r.status).toBe(200);
    expect((await prisma.indicadorAcademico.findUniqueOrThrow({ where: { estudanteId_turmaId: { estudanteId: estudante.id, turmaId: turma.id } } })).situacao).toBe("Atencao");
    const auditoria = await prisma.registroAuditoria.findFirst({ where: { autorId: admin.usuario.id, acao: "regras.alteradas" } });
    expect(auditoria?.depois).toMatchObject({ mediaMinima: 7 });
    await salvarApi(requisicao(`${API}/instituicao/regras`, "PUT", admin.token, REGRA_PADRAO));
    expect((await prisma.indicadorAcademico.findUniqueOrThrow({ where: { estudanteId_turmaId: { estudanteId: estudante.id, turmaId: turma.id } } })).situacao).toBe("Normal");
  });

  it("AC-052-04: limite de Risco maior que a média mínima é recusado (400) e nada muda", async () => {
    const { admin } = await cenario();
    const antes = await regraVigente();
    const r = await salvarApi(requisicao(`${API}/instituicao/regras`, "PUT", admin.token, { mediaMinima: 6, limiteRisco: 6.5, frequenciaMinima: 75, notaExame: 5 }));
    expect(r.status).toBe(400);
    expect(await regraVigente()).toEqual(antes);
    const coordenador = await entrar("Coordenador");
    expect((await salvarApi(requisicao(`${API}/instituicao/regras`, "PUT", coordenador.token, SETE))).status).toBe(403);
  });

  it("AC-052-03 / INV-052-02: o período encerrado guarda a regra do encerramento; mudar a regra não muda o boletim dele", async () => {
    const periodo = await criarPeriodoDeTeste();
    const base = await turmaComEstudantes(1, periodo.nome);
    const [estudante] = base.estudantes;
    await prisma.indicadorAcademico.create({ data: { estudanteId: estudante.id, turmaId: base.turma.id, media: 6.5, frequenciaAtual: 90, situacao: "Normal", atualizadoEm: new Date() } });
    const admin = await entrar("Administrador");
    await salvarApi(requisicao(`${API}/instituicao/regras`, "PUT", admin.token, REGRA_PADRAO));
    await mudarStatusDoPeriodo(periodo.id, "Encerrado", admin.usuario.id);
    expect(await prisma.periodoLetivo.findUniqueOrThrow({ where: { id: periodo.id } })).toMatchObject({ regraMediaMinima: 6, regraFrequenciaMinima: 75 });
    await salvarApi(requisicao(`${API}/instituicao/regras`, "PUT", admin.token, SETE));
    const boletim = await consultarBoletim(sessao(admin.usuario.id, "Administrador"), { estudante: estudante.id, periodo: periodo.nome });
    expect(boletim!.turmas[0].resultado).toBe("Aprovado");
    expect((await prisma.indicadorAcademico.findUniqueOrThrow({ where: { estudanteId_turmaId: { estudanteId: estudante.id, turmaId: base.turma.id } } })).situacao).toBe("Normal");
    await salvarApi(requisicao(`${API}/instituicao/regras`, "PUT", admin.token, REGRA_PADRAO));
  });
});
