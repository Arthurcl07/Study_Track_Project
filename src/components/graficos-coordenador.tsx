// Gráficos do painel do coordenador (SPEC-014, RF-21). Desenhados no servidor, sem biblioteca externa,
// como o gráfico de evolução (SPEC-007). Situações sempre com cor, símbolo e rótulo (RNF-06); os limites
// 5,0, 6,0 e 75% vêm da regra única (DA-02). Layout aprovado em docs/layout/prototipo.html#coordenador-painel.
import type { ResumoTurma } from "@/domain/relatorio";
import { FREQUENCIA_MINIMA, MEDIA_NORMAL, MEDIA_RISCO, NOTA_MAXIMA } from "@/domain/situacao-academica";
import { formatarNumero as numero } from "./ui";

type Turma = { id: string; rotulo: string } & ResumoTurma;

// INV-014-03 / RNF-06: cada faixa tem cor, símbolo e rótulo; exportado para o teste.
export const FAIXAS = [
  { chave: "Normal", simbolo: "●", rotulo: "Normal", barra: "bg-normal", selo: "bg-normal-fundo text-normal" },
  { chave: "Atencao", simbolo: "▲", rotulo: "Atenção", barra: "bg-atencao", selo: "bg-atencao-fundo text-atencao" },
  { chave: "Risco", simbolo: "■", rotulo: "Risco", barra: "bg-risco", selo: "bg-risco-fundo text-risco" },
  { chave: "SemDados", simbolo: "–", rotulo: "Sem dados", barra: "bg-slate-400", selo: "bg-slate-100 text-slate-600" },
] as const;

export function SituacaoPorTurma({ turmas }: { turmas: Turma[] }) {
  return (
    <div className="space-y-4">
      {turmas.map((t) => (
        <div key={t.id}>
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">{t.rotulo}</span>
            <span className="shrink-0 text-mudo">{t.estudantes} estudante(s)</span>
          </div>
          {t.estudantes === 0 ? (
            <div className="h-[22px] rounded-lg bg-traco" />
          ) : (
            <div
              className="flex h-[22px] overflow-hidden rounded-lg bg-traco"
              role="img"
              aria-label={FAIXAS.map((f) => `${f.rotulo}: ${t.contagem[f.chave]}`).join(", ")}
            >
              {FAIXAS.filter((f) => t.contagem[f.chave] > 0).map((f) => (
                <span
                  key={f.chave}
                  className={`flex items-center justify-center text-xs font-bold text-white ${f.barra}`}
                  style={{ width: `${(t.contagem[f.chave] / t.estudantes) * 100}%` }}
                >
                  {t.contagem[f.chave]}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
      <div className="flex flex-wrap gap-2 text-[13px]">
        {FAIXAS.map((f) => (
          <span key={f.chave} className={`inline-flex rounded-full px-2.5 py-0.5 font-semibold ${f.selo}`}>{f.simbolo} {f.rotulo}</span>
        ))}
      </div>
    </div>
  );
}

// Média (0–10) e frequência (0–100%) na mesma altura: 6,0 fica na mesma linha de 60%.
const LARGURA = 340;
const ALTURA = 200;
const BASE = 165;
const TOPO = 20;
const ESQUERDA = 36;
const altura = (fracao: number) => fracao * (BASE - TOPO);
const umaCasa = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 1 });

export function MediaFrequenciaPorTurma({ turmas }: { turmas: Turma[] }) {
  const passo = (LARGURA - ESQUERDA - 8) / Math.max(turmas.length, 1);
  const larguraBarra = Math.min(22, passo / 2.6);
  const linhas = [
    { y: BASE - altura(FREQUENCIA_MINIMA / 100), rotulo: `${FREQUENCIA_MINIMA}%`, cor: "#93C5FD" },
    { y: BASE - altura(MEDIA_NORMAL / NOTA_MAXIMA), rotulo: umaCasa(MEDIA_NORMAL), cor: "#FCD34D" },
    { y: BASE - altura(MEDIA_RISCO / NOTA_MAXIMA), rotulo: umaCasa(MEDIA_RISCO), cor: "#FCA5A5" },
  ];
  return (
    <div>
      <svg viewBox={`0 0 ${LARGURA} ${ALTURA}`} width="100%" className="mx-auto block max-w-[480px]" role="img" aria-label="Média e frequência média por turma">
        {linhas.map((l) => (
          <g key={l.rotulo}>
            <line x1={ESQUERDA} x2={LARGURA - 4} y1={l.y} y2={l.y} stroke={l.cor} strokeDasharray="4 4" />
            <text x={ESQUERDA - 4} y={l.y + 3} fontSize="9" textAnchor="end" fill="#64748B">{l.rotulo}</text>
          </g>
        ))}
        <line x1={ESQUERDA} x2={LARGURA - 4} y1={BASE} y2={BASE} stroke="#E2E8F0" />
        {turmas.map((t, i) => {
          const centro = ESQUERDA + passo * i + passo / 2;
          const hm = t.mediaTurma === null ? 0 : altura(t.mediaTurma / NOTA_MAXIMA);
          const hf = t.frequenciaMedia === null ? 0 : altura(t.frequenciaMedia / 100);
          const nome = t.rotulo.split(" · ")[0];
          return (
            <g key={t.id}>
              <rect x={centro - larguraBarra - 1} y={BASE - hm} width={larguraBarra} height={hm} rx="3" fill="#2563EB" />
              <rect x={centro + 1} y={BASE - hf} width={larguraBarra} height={hf} rx="3" fill="#93C5FD" />
              <text x={centro - larguraBarra / 2 - 1} y={BASE - hm - 4} fontSize="9" textAnchor="middle" fill="#0F172A">
                {t.mediaTurma === null ? "—" : numero(t.mediaTurma)}
              </text>
              <text x={centro + larguraBarra / 2 + 1} y={BASE - hf - 4} fontSize="9" textAnchor="middle" fill="#0F172A">
                {t.frequenciaMedia === null ? "—" : `${numero(t.frequenciaMedia)}%`}
              </text>
              <text x={centro} y={BASE + 14} fontSize="10" textAnchor="middle" fill="#0F172A">
                {nome.length > 14 ? `${nome.slice(0, 13)}…` : nome}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex flex-wrap gap-4 text-[13px] text-mudo">
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-azul" /> Média (0–10)</span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-ceu" /> Frequência (0–100%)</span>
      </div>
    </div>
  );
}
