// Consolidação do relatório acadêmico (SPEC-009, RF-15, OPEN-005). Funções puras: sem Next.js nem Prisma.
// A situação de cada estudante vem do indicador vigente (RB-10); aqui só se agrega e se formata.
import type { Situacao } from "./situacao-academica";

export type SituacaoRelatorio = Situacao | "SemDados";
export const SITUACOES_RELATORIO: readonly SituacaoRelatorio[] = ["Normal", "Atencao", "Risco", "SemDados"];

export type LinhaEstudante = {
  turmaId: string;
  turma: string;
  estudante: string;
  media: number | null;
  frequencia: number | null;
  situacao: SituacaoRelatorio;
  entregasAtrasadas: number;
};

export type ResumoTurma = {
  estudantes: number;
  mediaTurma: number | null;
  frequenciaMedia: number | null;
  contagem: Record<SituacaoRelatorio, number>;
  entregasAtrasadas: number;
};

const mediaSimples = (valores: number[]) => (valores.length === 0 ? null : valores.reduce((a, b) => a + b, 0) / valores.length);

// Média da turma = média simples das médias existentes; idem frequência. Sem dados não entra (spec seção 5).
export function consolidarTurma(linhas: readonly LinhaEstudante[]): ResumoTurma {
  const contagem = { Normal: 0, Atencao: 0, Risco: 0, SemDados: 0 } satisfies Record<SituacaoRelatorio, number>;
  for (const l of linhas) contagem[l.situacao] += 1;
  return {
    estudantes: linhas.length,
    mediaTurma: mediaSimples(linhas.flatMap((l) => (l.media === null ? [] : [l.media]))),
    frequenciaMedia: mediaSimples(linhas.flatMap((l) => (l.frequencia === null ? [] : [l.frequencia]))),
    contagem,
    entregasAtrasadas: linhas.reduce((soma, l) => soma + l.entregasAtrasadas, 0),
  };
}

export function ehSituacaoRelatorio(valor: unknown): valor is SituacaoRelatorio {
  return typeof valor === "string" && (SITUACOES_RELATORIO as readonly string[]).includes(valor);
}

const ROTULOS: Record<SituacaoRelatorio, string> = { Normal: "Normal", Atencao: "Atenção", Risco: "Risco", SemDados: "Sem dados" };

const numeroCsv = (v: number | null) => (v === null ? "" : v.toLocaleString("pt-BR", { maximumFractionDigits: 2, useGrouping: false }));
const textoCsv = (v: string) => (/[;"\n\r]/.test(v) ? `"${v.replaceAll('"', '""')}"` : v);

// OPEN-005 / INV-009-05: CSV com as MESMAS linhas da tela; ";" e vírgula decimal para o Excel em português.
export function gerarCsv(linhas: readonly LinhaEstudante[]): string {
  const cabecalho = ["Turma", "Estudante", "Média", "Frequência (%)", "Situação", "Entregas atrasadas"];
  const corpo = linhas.map((l) =>
    [textoCsv(l.turma), textoCsv(l.estudante), numeroCsv(l.media), numeroCsv(l.frequencia), ROTULOS[l.situacao], String(l.entregasAtrasadas)].join(";"),
  );
  return "﻿" + [cabecalho.join(";"), ...corpo].join("\r\n") + "\r\n";
}
