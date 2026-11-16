// SPEC-049 — relatório em Excel: as linhas da planilha são as da tela, com os mesmos filtros e o mesmo escopo
// (integração, lendo o .xlsx gerado).
import ExcelJS from "exceljs";
import { afterAll, describe, expect, it } from "vitest";
import { GET as excelApi } from "@/app/api/relatorios/excel/route";
import { gerarRelatorio } from "@/server/academico/relatorios";
import { prisma } from "@/server/dados/prisma";
import { criarPeriodoDeTeste, entrarComo, removerUsuariosDeTeste, requisicaoComSessao } from "../apoio";
import { sessao } from "../apoio-n3";
import { API, turmaComEstudantes } from "../apoio-secretaria";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

async function lerPlanilha(resposta: Response) {
  const livro = new ExcelJS.Workbook();
  await livro.xlsx.load(await resposta.arrayBuffer());
  return livro;
}

describe("SPEC-049 — Excel (integração)", () => {
  async function cenario() {
    const periodo = await criarPeriodoDeTeste();
    const base = await turmaComEstudantes(3, periodo.nome);
    const [a, b, c] = base.estudantes;
    for (const [e, media, situacao] of [[a, 8, "Normal"], [b, 5.5, "Atencao"], [c, 3, "Risco"]] as const) {
      await prisma.indicadorAcademico.create({ data: { estudanteId: e.id, turmaId: base.turma.id, media, frequenciaAtual: 90, situacao, atualizadoEm: new Date() } });
    }
    const professor = base.professor;
    return { ...base, periodo, tokenProfessor: await entrarComo(professor.email, professor.senha) };
  }

  it("AC-049-02 / INV-049-01: o professor baixa as turmas dele; a aba Estudantes tem as mesmas linhas da tela", async () => {
    const { periodo, tokenProfessor, professor } = await cenario();
    const resposta = await excelApi(requisicaoComSessao(`${API}/relatorios/excel?periodo=${encodeURIComponent(periodo.nome)}`, tokenProfessor));
    expect(resposta.status).toBe(200);
    expect(resposta.headers.get("content-type")).toContain("spreadsheetml");
    const livro = await lerPlanilha(resposta);
    expect(livro.worksheets.map((w) => w.name)).toEqual(["Resumo", "Estudantes"]);
    const tela = await gerarRelatorio(sessao(professor.id, "Professor"), { periodo: periodo.nome });
    if (!tela.ok) throw new Error("relatório deveria sair");
    const estudantes = livro.getWorksheet("Estudantes")!;
    expect(estudantes.rowCount - 1).toBe(tela.relatorio.linhas.length);
    expect(estudantes.getRow(1).values).toContain("Situação");
    expect(estudantes.autoFilter).toBeTruthy();
    // Resumo: uma linha por turma e a linha de total.
    expect(livro.getWorksheet("Resumo")!.rowCount).toBe(tela.relatorio.resumo.length + 2);
  });

  it("AC-049-01: com o filtro Risco, a planilha só tem os estudantes em Risco", async () => {
    const { periodo, tokenProfessor } = await cenario();
    const livro = await lerPlanilha(await excelApi(requisicaoComSessao(`${API}/relatorios/excel?periodo=${encodeURIComponent(periodo.nome)}&situacao=Risco`, tokenProfessor)));
    const estudantes = livro.getWorksheet("Estudantes")!;
    expect(estudantes.rowCount).toBe(2);
    expect(estudantes.getRow(2).getCell(5).value).toBe("Risco");
  });

  it("AC-049-04 / INV-049-02: turma fora do escopo dá 403", async () => {
    const { turma } = await cenario();
    const outro = await turmaComEstudantes(1);
    const token = await entrarComo(outro.professor.email, outro.professor.senha);
    expect((await excelApi(requisicaoComSessao(`${API}/relatorios/excel?turma=${turma.id}`, token))).status).toBe(403);
  });
});
