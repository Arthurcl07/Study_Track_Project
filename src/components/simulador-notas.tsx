"use client";

// "Quanto preciso tirar?" no cartão da turma do painel do estudante (SPEC-023, RF-32, RB-25). A simulação roda no
// navegador com as mesmas funções puras do servidor e nada é enviado nem gravado (INV-023-03).
// Layout aprovado em docs/layout/prototipo.html#est-simulador.
import { useState } from "react";
import {
  lerNotaHipotetica, mediaSimulada, riscoPelaFrequencia, situacaoSimulada, textoNecessaria, type AvaliacaoSimulada, type NotaNecessaria,
} from "@/domain/simulador";
import { CLASSE_CAMPO, formatarNumero as numero, SeloSituacao } from "./ui";

const COR = { nota: "text-atencao", garantida: "text-normal", inalcancavel: "text-risco", "sem-restante": "text-mudo" } as const;

function Meta({ n, alvo, legenda }: { n: NotaNecessaria; alvo: string; legenda: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-nevoa px-3 py-2.5 text-sm">
      <strong className={`min-w-[64px] text-lg tabular-nums ${n.tipo === "nota" ? (alvo === "6,0" ? COR.nota : "text-texto") : COR[n.tipo]}`}>{textoNecessaria(n)}</strong>
      <span>para chegar a <b>{alvo}</b> {legenda}</span>
    </div>
  );
}

export function SimuladorNotas({
  avaliacoes,
  necessaria,
  frequencia,
}: {
  avaliacoes: AvaliacaoSimulada[];
  necessaria: { normal: NotaNecessaria; saidaDoRisco: NotaNecessaria };
  frequencia: number | null;
}) {
  const [aberto, setAberto] = useState(false);
  const [hipoteses, setHipoteses] = useState<string[]>(() => avaliacoes.map(() => ""));
  const restantes = avaliacoes.filter((a) => a.nota === null);
  if (avaliacoes.length === 0) return null;

  const media = mediaSimulada(avaliacoes, hipoteses.map(lerNotaHipotetica));
  const algumaHipotese = hipoteses.some((h) => lerNotaHipotetica(h) !== null);

  return (
    <div className="mt-4 border-t border-traco pt-4">
      <h4 className="mb-1 text-[15px] font-semibold">🎯 Quanto preciso tirar?</h4>
      {restantes.length === 0 ? (
        <p className="text-sm text-mudo">Não há avaliação restante nesta turma.</p>
      ) : (
        <>
          <p className="mb-2.5 text-[13px] text-mudo">
            Nota igual nas avaliações que faltam: {restantes.map((a) => `${a.nome} (peso ${numero(a.peso)})`).join(", ")}.
          </p>
          <div className="space-y-2">
            <Meta n={necessaria.normal} alvo="6,0" legenda="(Normal)" />
            <Meta n={necessaria.saidaDoRisco} alvo="5,0" legenda="(sair do Risco por nota)" />
          </div>
          <button type="button" onClick={() => setAberto((v) => !v)} aria-expanded={aberto} className="mt-3 text-sm font-medium text-azul hover:underline">
            {aberto ? "Fechar simulação" : "Simular minhas notas"}
          </button>
          {aberto && (
            <div className="mt-3 space-y-2 text-sm">
              <p className="text-[13px] text-mudo">Digite notas para as avaliações que faltam. Nada é gravado.</p>
              {avaliacoes.map((a, i) => (
                <div key={a.nome + i} className="grid grid-cols-[minmax(0,1fr)_88px] items-center gap-3">
                  <label htmlFor={`sim-${a.nome}-${i}`} className="min-w-0 truncate">{a.nome} (peso {numero(a.peso)})</label>
                  {a.nota === null ? (
                    <input
                      id={`sim-${a.nome}-${i}`}
                      inputMode="decimal"
                      value={hipoteses[i]}
                      placeholder="0 a 10"
                      onChange={(e) => setHipoteses((h) => h.map((v, k) => (k === i ? e.target.value : v)))}
                      className={`${CLASSE_CAMPO} mt-0 py-1.5 text-right`}
                    />
                  ) : (
                    <strong className="text-right tabular-nums">{numero(a.nota)}</strong>
                  )}
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-2 rounded-[10px] bg-info-fundo px-3 py-2.5 text-info" aria-live="polite">
                {algumaHipotese && media !== null ? (
                  <>Média simulada <b className="tabular-nums">{numero(media)}</b> <SeloSituacao situacao={situacaoSimulada(media, frequencia)} /></>
                ) : (
                  "Digite ao menos uma nota para ver a média simulada."
                )}
              </div>
            </div>
          )}
        </>
      )}
      {riscoPelaFrequencia(frequencia) && (
        <p className="mt-3 text-[13px] text-risco">■ Frequência em {numero(frequencia!)}%: abaixo de 75% a situação continua Risco, qualquer que seja a nota.</p>
      )}
    </div>
  );
}
