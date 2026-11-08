// Classificação da situação acadêmica (RB-05, RB-06, RB-07, RB-09) e cálculo da média (OPEN-002).
// ÚNICO lugar do código com esta regra (INV-003-06, DA-02): sem Next.js, sem Prisma, sem banco.

export const SITUACOES = ["Normal", "Atencao", "Risco"] as const;
export type Situacao = (typeof SITUACOES)[number];

export const FREQUENCIA_MINIMA = 75; // RB-05: abaixo disso é Risco, independentemente da média.
export const MEDIA_RISCO = 5; // RB-07: abaixo disso é Risco.
export const MEDIA_NORMAL = 6; // RB-06: de 5,0 até antes de 6,0 é Atenção.
export const NOTA_MINIMA = 0;
export const NOTA_MAXIMA = 10;

export class DadosAcademicosInvalidos extends Error {}

export type NotaPonderada = { valor: number; peso: number };

function exigirNumero(valor: number, minimo: number, maximo: number, descricao: string) {
  if (!Number.isFinite(valor) || valor < minimo || valor > maximo) {
    throw new DadosAcademicosInvalidos(`${descricao} fora da faixa de ${minimo} a ${maximo}.`);
  }
}

// OPEN-002: média ponderada pelos pesos das avaliações que já têm nota. Sem nota, a média é null.
export function calcularMedia(notas: readonly NotaPonderada[]): number | null {
  if (notas.length === 0) return null;
  let somaPonderada = 0;
  let somaPesos = 0;
  for (const { valor, peso } of notas) {
    exigirNumero(valor, NOTA_MINIMA, NOTA_MAXIMA, "Nota");
    if (!Number.isFinite(peso) || peso <= 0) throw new DadosAcademicosInvalidos("Peso de avaliação deve ser maior que zero.");
    somaPonderada += valor * peso;
    somaPesos += peso;
  }
  return somaPonderada / somaPesos;
}

// SPEC-029 (OPEN-051): avaliações da turma para a média do estudante, com o tipo e a nota dele (null = sem nota).
export type TipoDaAvaliacao = "Prova" | "Trabalho" | "Substitutiva" | "Exame";
export type AvaliacaoDaMedia = { tipo: TipoDaAvaliacao; peso: number; valor: number | null };

// OPEN-002 + RB-28: média ponderada das provas e trabalhos com nota. Com nota na substitutiva, a prova de menor nota
// (prova sem nota conta como zero; empate: a primeira) é trocada pela substitutiva, com o peso dela, se isso aumentar
// a média (INV-029-01). O exame final não entra na média (RB-29).
export function calcularMediaDaTurma(avaliacoes: readonly AvaliacaoDaMedia[]): number | null {
  const regulares = avaliacoes.filter((a) => a.tipo === "Prova" || a.tipo === "Trabalho");
  const comNota = (lista: readonly AvaliacaoDaMedia[]) => lista.flatMap((a) => (a.valor === null ? [] : [{ valor: a.valor, peso: a.peso }]));
  const base = calcularMedia(comNota(regulares));
  const substitutiva = avaliacoes.find((a) => a.tipo === "Substitutiva" && a.valor !== null);
  const provas = regulares.filter((a) => a.tipo === "Prova");
  if (!substitutiva || provas.length === 0) return base;
  const menor = provas.reduce((m, p) => ((p.valor ?? 0) < (m.valor ?? 0) ? p : m));
  const trocada = calcularMedia(comNota(regulares.map((a) => (a === menor ? { ...a, valor: substitutiva.valor } : a))));
  if (base === null) return trocada;
  return trocada !== null && trocada > base ? trocada : base;
}

// RB-29: faz exame quem tem média menor que 6,0 e frequência de pelo menos 75% (sem média, não faz).
export function elegivelAoExame(media: number | null, frequencia: number | null): boolean {
  return media !== null && media < MEDIA_NORMAL && frequencia !== null && frequencia >= FREQUENCIA_MINIMA;
}

export const NOTA_FINAL_MINIMA_EXAME = 5;
export const MENSAGEM_NAO_ELEGIVEL_EXAME = "Este estudante não está em exame: só faz exame quem tem média menor que 6,0 e frequência de pelo menos 75%.";

// RB-29 / INV-029-03: nota final = (média + exame) ÷ 2.
export function notaFinalComExame(media: number, exame: number): number {
  exigirNumero(media, NOTA_MINIMA, NOTA_MAXIMA, "Média");
  exigirNumero(exame, NOTA_MINIMA, NOTA_MAXIMA, "Exame");
  return (media + exame) / 2;
}

// RB-09: devolve sempre exatamente uma situação. Usa os valores exatos, sem arredondar (OPEN-002).
// Dados ausentes (null) não geram Risco nem Atenção: só o dado presente classifica.
export function classificarSituacao(media: number | null, frequencia: number | null): Situacao {
  if (media !== null) exigirNumero(media, NOTA_MINIMA, NOTA_MAXIMA, "Média");
  if (frequencia !== null) exigirNumero(frequencia, 0, 100, "Frequência");

  if (frequencia !== null && frequencia < FREQUENCIA_MINIMA) return "Risco"; // RB-05
  if (media !== null && media < MEDIA_RISCO) return "Risco"; // RB-07
  if (media !== null && media < MEDIA_NORMAL) return "Atencao"; // RB-06
  return "Normal";
}
