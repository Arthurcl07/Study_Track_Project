// Exportação de apoio ao Censo (SPEC-043, RF-52, OPEN-065). Funções puras: linhas e CSV. NÃO é o layout oficial
// do Educacenso/INEP: é um arquivo de apoio para conferência.
import { ROTULO_RESULTADO, type Resultado } from "./documentos";

export type LinhaCenso = {
  matricula: string;
  nome: string;
  cpf: string | null;
  nascimento: string | null;
  curso: string;
  situacaoCurso: string;
  periodo: string;
  disciplina: string;
  turma: string;
  cargaHoraria: number;
  frequencia: number | null;
  resultado: Resultado;
};

export const AVISO_CENSO = "Arquivo de apoio para o Censo Escolar. Não é o layout oficial do Educacenso/INEP.";
export const CABECALHO_CENSO = ["matricula", "nome", "cpf", "data_nascimento", "curso", "situacao_curso", "periodo", "disciplina", "turma", "carga_horaria", "frequencia", "resultado"];

const campo = (v: string) => (/[;"\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const numero = (v: number | null) => (v === null ? "" : v.toLocaleString("pt-BR", { maximumFractionDigits: 1, useGrouping: false }));

// AC-043-01 / AC-043-02: cabeçalho e uma linha por matrícula; separador ";", vírgula decimal, UTF-8 com BOM.
export function gerarCsvCenso(linhas: readonly LinhaCenso[]): string {
  const corpo = linhas.map((l) =>
    [l.matricula, l.nome, l.cpf ?? "", l.nascimento ? l.nascimento.split("-").reverse().join("/") : "", l.curso, l.situacaoCurso, l.periodo, l.disciplina, l.turma, String(l.cargaHoraria), numero(l.frequencia), ROTULO_RESULTADO[l.resultado]]
      .map(campo)
      .join(";"),
  );
  return "﻿" + [CABECALHO_CENSO.join(";"), ...corpo].join("\r\n") + "\r\n";
}
