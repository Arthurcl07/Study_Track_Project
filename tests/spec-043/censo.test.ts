// SPEC-043 — exportação de apoio ao Censo: CSV (unitário) e exportação, acesso e auditoria (integração).
import { afterAll, describe, expect, it } from "vitest";
import { AVISO_CENSO, CABECALHO_CENSO, gerarCsvCenso, type LinhaCenso } from "@/domain/censo";
import { GET as censoApi } from "@/app/api/censo/route";
import { exportarCenso } from "@/server/academico/censo";
import { prisma } from "@/server/dados/prisma";
import { criarPeriodoDeTeste, removerUsuariosDeTeste } from "../apoio";
import { API, entrar, requisicao, turmaComEstudantes } from "../apoio-secretaria";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const linha: LinhaCenso = { matricula: "20260001", nome: 'Ana "Bia"; Souza', cpf: null, nascimento: "2005-03-09", curso: "ADS", situacaoCurso: "Ativo", periodo: "2026/2", disciplina: "Redes", turma: "T1", cargaHoraria: 60, frequencia: 87.5, resultado: "EmCurso" };

describe("SPEC-043 — regras puras (sem banco)", () => {
  it("AC-043-01 / AC-043-02: cabeçalho, ';' como separador, vírgula decimal, CPF vazio e aspas escapadas", () => {
    const csv = gerarCsvCenso([linha]);
    expect(csv.startsWith("﻿")).toBe(true);
    const [cabecalho, primeira] = csv.slice(1).trim().split("\r\n");
    expect(cabecalho).toBe(CABECALHO_CENSO.join(";"));
    expect(primeira.startsWith('20260001;"Ana ""Bia""; Souza";;09/03/2005;ADS;Ativo;2026/2;Redes;T1;60;87,5;')).toBe(true);
    expect(AVISO_CENSO).toMatch(/Não é o layout oficial/);
  });
});

describe("SPEC-043 — exportação (integração)", () => {
  it("AC-043-01 / AC-043-02 / AC-043-04 / INV-043-02: 12 matrículas, 12 linhas; auditoria sem nomes", async () => {
    const periodo = await criarPeriodoDeTeste();
    const { estudantes } = await turmaComEstudantes(12, periodo.nome);
    const admin = await entrar("Administrador");
    const r = await censoApi(requisicao(`${API}/censo?periodo=${encodeURIComponent(periodo.nome)}`, "GET", admin.token));
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toMatch(/text\/csv/);
    const linhas = (await r.text()).slice(1).trim().split("\r\n");
    expect(linhas).toHaveLength(13);
    expect(linhas.slice(1).every((l) => l.split(";")[2] === "")).toBe(true);

    const registro = await prisma.registroAuditoria.findFirstOrThrow({ where: { acao: "censo.exportado", autorId: admin.usuario.id } });
    expect(registro.depois).toEqual({ periodo: periodo.nome, linhas: 12 });
    expect(registro.descricao).toContain(periodo.nome);
    for (const e of estudantes) expect(JSON.stringify(registro)).not.toContain(e.email);
    expect(registro.descricao).not.toContain(estudantes[0].nome);
  });

  it("AC-043-03 / INV-043-01: só a secretaria exporta; período inexistente é 400", async () => {
    const coordenador = await entrar("Coordenador");
    expect((await censoApi(requisicao(`${API}/censo?periodo=2026/2`, "GET", coordenador.token))).status).toBe(403);
    const admin = await entrar("Administrador");
    expect((await censoApi(requisicao(`${API}/censo?periodo=1800/9`, "GET", admin.token))).status).toBe(400);
    expect((await exportarCenso("1800/9", admin.usuario.id)).ok).toBe(false);
  });
});
