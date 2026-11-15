// Pendências do professor (SPEC-051, RF-60, RB-46, OPEN-072). Funções puras: sem Next.js nem Prisma. Calculadas
// na leitura, nunca gravadas (INV-051-01). Datas "AAAA-MM-DD".
import { dataBR } from "./auditoria";

export const DIAS_SEM_CHAMADA = 7;
export const DIAS_PARA_NOTA = 7;

export type TurmaParaAcompanhar = {
  inicioAulas: string | null;
  fimAulas: string | null;
  ultimaAula: string | null;
  diario: "Aberto" | "Fechado" | "Homologado";
  cursando: number;
  avaliacoes: readonly { nome: string; data: string; tipo: string; notas: number }[];
};

export type Pendencia = { tipo: "Chamada" | "Nota" | "Diario"; texto: string };

const DIA_MS = 24 * 60 * 60 * 1000;
export const diasEntre = (de: string, ate: string) => Math.round((Date.parse(`${ate}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / DIA_MS);

// RB-46: chamada atrasada (sem aula nos últimos 7 dias, entre o início e o fim das aulas), nota atrasada (prova ou
// trabalho com data há mais de 7 dias sem nota de todos os cursando) e diário não fechado (fim das aulas passou).
export function pendenciasDaTurma(t: TurmaParaAcompanhar, hoje: string): Pendencia[] {
  const pendencias: Pendencia[] = [];
  const emAulas = (!t.inicioAulas || t.inicioAulas <= hoje) && (!t.fimAulas || hoje <= t.fimAulas);
  const referencia = t.ultimaAula ?? t.inicioAulas;
  if (emAulas && referencia && diasEntre(referencia, hoje) > DIAS_SEM_CHAMADA) {
    const dias = diasEntre(referencia, hoje);
    pendencias.push({ tipo: "Chamada", texto: t.ultimaAula ? `Chamada atrasada há ${dias} dias` : `Nenhuma chamada desde o início das aulas (${dias} dias)` });
  }
  if (t.cursando > 0) {
    for (const a of t.avaliacoes) {
      if ((a.tipo === "Prova" || a.tipo === "Trabalho") && diasEntre(a.data, hoje) > DIAS_PARA_NOTA && a.notas < t.cursando) {
        const faltam = t.cursando - a.notas;
        pendencias.push({ tipo: "Nota", texto: `${a.nome} de ${dataBR(a.data).slice(0, 5)} sem ${faltam} ${faltam === 1 ? "nota" : "notas"}` });
      }
    }
  }
  if (t.fimAulas && t.fimAulas < hoje && t.diario === "Aberto") {
    pendencias.push({ tipo: "Diario", texto: `Diário não fechado (aulas terminaram em ${dataBR(t.fimAulas)})` });
  }
  return pendencias;
}
