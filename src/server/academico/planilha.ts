// Relatório acadêmico em .xlsx (SPEC-049, RF-58, ADR-005). As linhas são EXATAMENTE as da tela, com os mesmos
// filtros (INV-049-01): a planilha é montada a partir do mesmo Relatorio consolidado (SPEC-009).
import ExcelJS from "exceljs";
import type { SituacaoRelatorio } from "@/domain/relatorio";
import type { Relatorio } from "./relatorios";

const MARINHO = "FF0F2A4A";
const COR_SITUACAO: Record<SituacaoRelatorio, { fundo: string; texto: string; rotulo: string }> = {
  Normal: { fundo: "FFDCFCE7", texto: "FF15803D", rotulo: "Normal" },
  Atencao: { fundo: "FFFEF3C7", texto: "FFB45309", rotulo: "Atenção" },
  Risco: { fundo: "FFFEE2E2", texto: "FFB91C1C", rotulo: "Risco" },
  SemDados: { fundo: "FFF1F5F9", texto: "FF64748B", rotulo: "Sem dados" },
};

function cabecalho(aba: ExcelJS.Worksheet) {
  const linha = aba.getRow(1);
  linha.font = { bold: true, color: { argb: "FFFFFFFF" } };
  linha.fill = { type: "pattern", pattern: "solid", fgColor: { argb: MARINHO } };
  linha.alignment = { vertical: "middle" };
  linha.height = 22;
  aba.views = [{ state: "frozen", ySplit: 1 }];
}

export async function planilhaDoRelatorio(relatorio: Relatorio, instituicao: string): Promise<Buffer> {
  const livro = new ExcelJS.Workbook();
  livro.creator = "StudyTrack";
  livro.title = `Relatório acadêmico — ${instituicao}`;
  livro.created = new Date();

  // Aba Resumo: uma linha por turma, com totais e as cores da situação.
  const resumo = livro.addWorksheet("Resumo");
  resumo.columns = [
    { header: "Turma", key: "turma", width: 42 },
    { header: "Estudantes", key: "estudantes", width: 12 },
    { header: "Média da turma", key: "media", width: 15, style: { numFmt: "0.0" } },
    { header: "Frequência média (%)", key: "frequencia", width: 20, style: { numFmt: "0.0" } },
    { header: "Normal", key: "Normal", width: 10 },
    { header: "Atenção", key: "Atencao", width: 10 },
    { header: "Risco", key: "Risco", width: 10 },
    { header: "Sem dados", key: "SemDados", width: 11 },
    { header: "Entregas atrasadas", key: "atrasadas", width: 18 },
  ];
  for (const r of relatorio.resumo) {
    resumo.addRow({ turma: r.rotulo, estudantes: r.estudantes, media: r.mediaTurma, frequencia: r.frequenciaMedia, ...r.contagem, atrasadas: r.entregasAtrasadas });
  }
  const soma = (k: SituacaoRelatorio) => relatorio.resumo.reduce((s, r) => s + r.contagem[k], 0);
  const total = resumo.addRow({
    turma: "Total",
    estudantes: relatorio.resumo.reduce((s, r) => s + r.estudantes, 0),
    Normal: soma("Normal"),
    Atencao: soma("Atencao"),
    Risco: soma("Risco"),
    SemDados: soma("SemDados"),
    atrasadas: relatorio.resumo.reduce((s, r) => s + r.entregasAtrasadas, 0),
  });
  total.font = { bold: true };
  total.border = { top: { style: "thin", color: { argb: MARINHO } } };
  cabecalho(resumo);
  for (const s of ["Normal", "Atencao", "Risco"] as const) {
    const celula = resumo.getRow(1).getCell(s);
    celula.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COR_SITUACAO[s].fundo } };
    celula.font = { bold: true, color: { argb: COR_SITUACAO[s].texto } };
  }
  resumo.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1 + relatorio.resumo.length, column: 9 } };

  // Aba Estudantes: as linhas da tela.
  const estudantes = livro.addWorksheet("Estudantes");
  estudantes.columns = [
    { header: "Turma", key: "turma", width: 42 },
    { header: "Estudante", key: "estudante", width: 30 },
    { header: "Média", key: "media", width: 10, style: { numFmt: "0.0" } },
    { header: "Frequência (%)", key: "frequencia", width: 15, style: { numFmt: "0.0" } },
    { header: "Situação", key: "situacao", width: 12 },
    { header: "Entregas atrasadas", key: "atrasadas", width: 18 },
  ];
  for (const l of relatorio.linhas) {
    const linha = estudantes.addRow({ turma: l.turma, estudante: l.estudante, media: l.media, frequencia: l.frequencia, situacao: COR_SITUACAO[l.situacao].rotulo, atrasadas: l.entregasAtrasadas });
    const cor = COR_SITUACAO[l.situacao];
    linha.getCell("situacao").fill = { type: "pattern", pattern: "solid", fgColor: { argb: cor.fundo } };
    linha.getCell("situacao").font = { bold: true, color: { argb: cor.texto } };
  }
  cabecalho(estudantes);
  estudantes.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1 + relatorio.linhas.length, column: 6 } };

  return Buffer.from(await livro.xlsx.writeBuffer());
}
