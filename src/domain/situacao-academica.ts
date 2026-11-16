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

// SPEC-052 / RB-47 (OPEN-073): os quatro limites são configurados pela secretaria. A regra continua ÚNICA (DA-02):
// as mesmas funções, que recebem a regra vigente (ou a do período encerrado). Sem regra, valem os valores padrão.
export type RegraAvaliacao = { mediaMinima: number; limiteRisco: number; frequenciaMinima: number; notaExame: number };
export const REGRA_PADRAO: RegraAvaliacao = { mediaMinima: MEDIA_NORMAL, limiteRisco: MEDIA_RISCO, frequenciaMinima: FREQUENCIA_MINIMA, notaExame: 5 };

export const FAIXAS_DA_REGRA = {
  mediaMinima: { minimo: 5, maximo: 8 },
  frequenciaMinima: { minimo: 50, maximo: 90 },
  notaExame: { minimo: 4, maximo: 7 },
} as const;

const lerNumero = (v: unknown): number | null => {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string" || !v.trim()) return null;
  const n = Number(v.trim().replace("%", "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

// RB-47: média mínima de 5,0 a 8,0; limite de Risco de 0 até menor que a média mínima (INV-052-03); frequência
// mínima de 50% a 90%; nota final do exame de 4,0 a 7,0.
export function validarRegra(entrada: Record<string, unknown>): { ok: true; regra: RegraAvaliacao } | { ok: false; erros: Record<string, string> } {
  const erros: Record<string, string> = {};
  const mediaMinima = lerNumero(entrada.mediaMinima);
  const limiteRisco = lerNumero(entrada.limiteRisco);
  const frequenciaMinima = lerNumero(entrada.frequenciaMinima);
  const notaExame = lerNumero(entrada.notaExame);
  if (mediaMinima === null || mediaMinima < 5 || mediaMinima > 8) erros.mediaMinima = "A média mínima vai de 5,0 a 8,0.";
  if (limiteRisco === null || limiteRisco < 0) erros.limiteRisco = "Informe o limite de Risco.";
  else if (mediaMinima !== null && limiteRisco >= mediaMinima) erros.limiteRisco = "O limite de Risco precisa ser menor que a média mínima.";
  if (frequenciaMinima === null || frequenciaMinima < 50 || frequenciaMinima > 90) erros.frequenciaMinima = "A frequência mínima vai de 50% a 90%.";
  if (notaExame === null || notaExame < 4 || notaExame > 7) erros.notaExame = "A nota final do exame vai de 4,0 a 7,0.";
  if (Object.keys(erros).length > 0) return { ok: false, erros };
  return { ok: true, regra: { mediaMinima: mediaMinima!, limiteRisco: limiteRisco!, frequenciaMinima: frequenciaMinima!, notaExame: notaExame! } };
}

const umaCasa = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const semCasa = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

// "média ≥ 6,0 · freq. ≥ 75% · exame ≥ 5,0" (ata, boletim e Configurações).
export function textoDaRegra(r: RegraAvaliacao): string {
  return `média ≥ ${umaCasa(r.mediaMinima)} · freq. ≥ ${semCasa(r.frequenciaMinima)}% · exame ≥ ${umaCasa(r.notaExame)}`;
}

export const mesmaRegra = (a: RegraAvaliacao, b: RegraAvaliacao) =>
  a.mediaMinima === b.mediaMinima && a.limiteRisco === b.limiteRisco && a.frequenciaMinima === b.frequenciaMinima && a.notaExame === b.notaExame;

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

// RB-29: faz exame quem tem média menor que a mínima (6,0) e frequência de pelo menos a mínima (75%) (sem média,
// não faz). SPEC-052: com a regra configurada.
export function elegivelAoExame(media: number | null, frequencia: number | null, regra: RegraAvaliacao = REGRA_PADRAO): boolean {
  return media !== null && media < regra.mediaMinima && frequencia !== null && frequencia >= regra.frequenciaMinima;
}

export const NOTA_FINAL_MINIMA_EXAME = 5;
export const MENSAGEM_NAO_ELEGIVEL_EXAME = "Este estudante não está em exame: só faz exame quem tem média menor que 6,0 e frequência de pelo menos 75%.";
export function mensagemNaoElegivelAoExame(regra: RegraAvaliacao = REGRA_PADRAO): string {
  return `Este estudante não está em exame: só faz exame quem tem média menor que ${umaCasa(regra.mediaMinima)} e frequência de pelo menos ${semCasa(regra.frequenciaMinima)}%.`;
}

// RB-29 / INV-029-03: nota final = (média + exame) ÷ 2.
export function notaFinalComExame(media: number, exame: number): number {
  exigirNumero(media, NOTA_MINIMA, NOTA_MAXIMA, "Média");
  exigirNumero(exame, NOTA_MINIMA, NOTA_MAXIMA, "Exame");
  return (media + exame) / 2;
}

// RB-09: devolve sempre exatamente uma situação. Usa os valores exatos, sem arredondar (OPEN-002).
// Dados ausentes (null) não geram Risco nem Atenção: só o dado presente classifica.
// SPEC-052 / RB-47 (INV-052-01): os limites vêm da regra vigente (padrão 6,0 · 5,0 · 75%).
export function classificarSituacao(media: number | null, frequencia: number | null, regra: RegraAvaliacao = REGRA_PADRAO): Situacao {
  if (media !== null) exigirNumero(media, NOTA_MINIMA, NOTA_MAXIMA, "Média");
  if (frequencia !== null) exigirNumero(frequencia, 0, 100, "Frequência");

  if (frequencia !== null && frequencia < regra.frequenciaMinima) return "Risco"; // RB-05
  if (media !== null && media < regra.limiteRisco) return "Risco"; // RB-07
  if (media !== null && media < regra.mediaMinima) return "Atencao"; // RB-06
  return "Normal";
}
