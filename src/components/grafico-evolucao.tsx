// Gráfico de evolução das notas (SPEC-007, OPEN-011): linha das notas em ordem de data, escala 0–10,
// com as linhas de referência de 5 (Risco) e 6 (Normal). SVG puro, renderizado no servidor.
import type { PontoEvolucao } from "@/domain/alertas";
import { MEDIA_NORMAL, MEDIA_RISCO, NOTA_MAXIMA } from "@/domain/situacao-academica";

const LARGURA = 300;
const ALTURA = 120;
const MARGEM = 26;

const formatar = (nota: number) => nota.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

export function GraficoEvolucao({ pontos }: { pontos: PontoEvolucao[] }) {
  if (pontos.length === 0) {
    return <p className="rounded-[10px] bg-nevoa px-3 py-4 text-center text-sm text-mudo">Ainda sem notas lançadas.</p>;
  }
  const passo = pontos.length > 1 ? (LARGURA - 2 * MARGEM) / (pontos.length - 1) : 0;
  const x = (i: number) => (pontos.length > 1 ? MARGEM + i * passo : LARGURA / 2);
  const y = (nota: number) => ALTURA - 22 - (nota / NOTA_MAXIMA) * (ALTURA - 40);
  const linha = pontos.map((p, i) => `${x(i)},${y(p.nota)}`).join(" ");
  const descricao = pontos.map((p) => `${p.avaliacao}: ${formatar(p.nota)}`).join("; ");

  return (
    <svg viewBox={`0 0 ${LARGURA} ${ALTURA}`} className="w-full" role="img" aria-label={`Evolução das notas — ${descricao}`}>
      <line x1={MARGEM} x2={LARGURA - MARGEM} y1={y(0)} y2={y(0)} stroke="var(--color-traco)" />
      <line x1={MARGEM} x2={LARGURA - MARGEM} y1={y(MEDIA_RISCO)} y2={y(MEDIA_RISCO)} stroke="#FCA5A5" strokeDasharray="4 4" />
      <line x1={MARGEM} x2={LARGURA - MARGEM} y1={y(MEDIA_NORMAL)} y2={y(MEDIA_NORMAL)} stroke="#FCD34D" strokeDasharray="4 4" />
      {pontos.length > 1 && <polyline points={linha} fill="none" stroke="var(--color-azul)" strokeWidth={2.5} strokeLinejoin="round" />}
      {pontos.map((p, i) => (
        <g key={`${p.avaliacao}-${i}`}>
          <circle cx={x(i)} cy={y(p.nota)} r={4} fill="var(--color-azul)" />
          <text x={x(i)} y={y(p.nota) - 9} fontSize={11} textAnchor="middle" fill="var(--color-texto)">{formatar(p.nota)}</text>
          <text x={x(i)} y={ALTURA - 5} fontSize={10} textAnchor="middle" fill="var(--color-mudo)">
            {p.avaliacao.length > 14 ? `${p.avaliacao.slice(0, 13)}…` : p.avaliacao}
          </text>
        </g>
      ))}
    </svg>
  );
}
