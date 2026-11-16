// Documentos oficiais da turma (SPEC-048, RF-57, OPEN-069): ata de resultados finais, diário de classe e lista de
// presença. Funções puras: sem Next.js nem Prisma. O resultado é o da regra única do histórico (RB-24, INV-048-02).
import { resultadoDaTurma, type Resultado } from "./documentos";
import { faltaAbonada, type IntervaloAbono } from "./frequencia";
import { notaFinalComExame, type RegraAvaliacao } from "./situacao-academica";

// INV-048-01: a ata só sai com o diário homologado ou o período encerrado.
export function ataLiberada(diario: "Aberto" | "Fechado" | "Homologado", periodoEncerrado: boolean): boolean {
  return diario === "Homologado" || periodoEncerrado;
}

export type EstudanteDaAta = {
  nome: string;
  numeroMatricula: string | null;
  media: number | null;
  frequencia: number | null;
  exame: number | null;
  matricula: "Cursando" | "Trancada" | "Cancelada";
};

// Com o diário homologado, o resultado já é o final (mesma regra do histórico, com a regra do período).
export function linhasDaAta(estudantes: readonly EstudanteDaAta[], regra: RegraAvaliacao) {
  const linhas = estudantes.map((e) => ({
    ...e,
    notaFinal: e.media !== null && e.exame !== null ? notaFinalComExame(e.media, e.exame) : e.media,
    resultado: resultadoDaTurma({ encerrado: true, media: e.media, frequencia: e.frequencia, exame: e.exame, matricula: e.matricula, regra }) as Resultado,
  }));
  const totais = new Map<Resultado, number>();
  for (const l of linhas) totais.set(l.resultado, (totais.get(l.resultado) ?? 0) + 1);
  return { linhas, totais: [...totais.entries()].map(([resultado, quantidade]) => ({ resultado, quantidade })) };
}

// Diário de classe: P presente, F falta, A falta abonada (RB-31), "" sem registro.
export type MarcaPresenca = "P" | "F" | "A" | "";

export function marcaDaPresenca(presente: boolean | undefined, data: string, abonos: readonly IntervaloAbono[]): MarcaPresenca {
  if (presente === undefined) return "";
  if (presente) return "P";
  return faltaAbonada(data, abonos) ? "A" : "F";
}

// Divide as aulas em blocos para a grade caber na folha.
export function emBlocos<T>(itens: readonly T[], tamanho: number): T[][] {
  const blocos: T[][] = [];
  for (let i = 0; i < itens.length; i += tamanho) blocos.push(itens.slice(i, i + tamanho));
  return blocos;
}
