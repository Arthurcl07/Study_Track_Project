// Simulador "Quanto preciso tirar?" (SPEC-023, RF-32, RB-25, OPEN-045). Funções puras: sem Next.js nem Prisma.
// Usa a mesma média ponderada (OPEN-002) e a mesma classificação (DA-02) de situacao-academica.ts.
import { calcularMedia, classificarSituacao, FREQUENCIA_MINIMA, MEDIA_NORMAL, MEDIA_RISCO, NOTA_MAXIMA, type Situacao } from "./situacao-academica";

export type AvaliacaoSimulada = { nome: string; peso: number; nota: number | null };
export type NotaNecessaria =
  | { tipo: "nota"; valor: number }
  | { tipo: "garantida" }
  | { tipo: "inalcancavel"; valor: number }
  | { tipo: "sem-restante" };

export const METAS = { normal: MEDIA_NORMAL, saidaDoRisco: MEDIA_RISCO } as const;

// RB-25 / INV-023-01: (meta × soma dos pesos − soma de peso × nota das com nota) ÷ soma dos pesos das sem nota,
// arredondada para cima com uma casa (o estudante precisa de pelo menos esse valor).
export function notaNecessaria(avaliacoes: readonly AvaliacaoSimulada[], meta: number): NotaNecessaria {
  const restantes = avaliacoes.filter((a) => a.nota === null);
  if (restantes.length === 0) return { tipo: "sem-restante" };
  const pesoTotal = avaliacoes.reduce((s, a) => s + a.peso, 0);
  const pesoRestante = restantes.reduce((s, a) => s + a.peso, 0);
  const somaFeita = avaliacoes.reduce((s, a) => s + (a.nota === null ? 0 : a.nota * a.peso), 0);
  const bruta = (meta * pesoTotal - somaFeita) / pesoRestante;
  const valor = Math.ceil(bruta * 10 - 1e-9) / 10;
  if (valor <= 0) return { tipo: "garantida" };
  if (valor > NOTA_MAXIMA) return { tipo: "inalcancavel", valor };
  return { tipo: "nota", valor };
}

// INV-023-02: média com as notas reais e as hipotéticas (avaliação sem nota real e sem hipótese fica de fora).
export function mediaSimulada(avaliacoes: readonly AvaliacaoSimulada[], hipoteticas: readonly (number | null)[]): number | null {
  const notas = avaliacoes.flatMap((a, i) => {
    const valor = a.nota ?? hipoteticas[i] ?? null;
    return valor === null ? [] : [{ valor, peso: a.peso }];
  });
  return calcularMedia(notas);
}

export function situacaoSimulada(media: number | null, frequencia: number | null): Situacao {
  return classificarSituacao(media, frequencia);
}

// RB-25 / RB-05: abaixo de 75% de frequência a situação é Risco qualquer que seja a nota.
export const riscoPelaFrequencia = (frequencia: number | null) => frequencia !== null && frequencia < FREQUENCIA_MINIMA;

const virgula = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function textoNecessaria(n: NotaNecessaria): string {
  switch (n.tipo) {
    case "nota":
      return virgula(n.valor);
    case "garantida":
      return "garantida";
    case "inalcancavel":
      return "não alcançável";
    case "sem-restante":
      return "sem avaliação restante";
  }
}

// Nota hipotética digitada ("7,5", "10"): de 0 a 10; vazio ou inválido = sem hipótese.
export function lerNotaHipotetica(texto: string): number | null {
  const v = Number(texto.trim().replace(",", "."));
  return texto.trim() !== "" && Number.isFinite(v) && v >= 0 && v <= NOTA_MAXIMA ? v : null;
}
