// Comparativo entre semestres no dashboard do coordenador (SPEC-024, RF-33). Gráfico desenhado no servidor (o mesmo
// de média e frequência) e tabela com a tendência de cada indicador. Layout em docs/layout/prototipo.html#coord-comparativo.
import { tendencia, type ResumoPeriodo } from "@/domain/comparativo";
import type { ComparativoCoordenador } from "@/server/academico/comparativo";
import { MediaFrequenciaPorTurma } from "./graficos-coordenador";
import { Cartao, formatarNumero as numero } from "./ui";

const pct = (v: number | null) => (v === null ? "—" : `${Math.round(v)}%`);

// Seta com cor: subir é bom para média, frequência e aprovação; para Risco, subir é ruim.
function Seta({ anterior, atual, menorMelhor = false }: { anterior: number | null; atual: number | null; menorMelhor?: boolean }) {
  const t = tendencia(anterior, atual);
  if (!t || t === "igual") return null;
  const bom = (t === "sobe") !== menorMelhor;
  return <span className={bom ? "text-normal" : "text-risco"} aria-label={t === "sobe" ? "subiu" : "desceu"}> {t === "sobe" ? "▲" : "▼"}</span>;
}

const INDICADORES: { rotulo: string; valor: (p: ResumoPeriodo) => number | null; texto: (p: ResumoPeriodo) => string; menorMelhor?: boolean }[] = [
  { rotulo: "Média", valor: (p) => p.media, texto: (p) => (p.media === null ? "—" : numero(p.media)) },
  { rotulo: "Frequência média", valor: (p) => p.frequencia, texto: (p) => pct(p.frequencia) },
  { rotulo: "■ Em Risco", valor: (p) => p.percentualRisco, texto: (p) => pct(p.percentualRisco), menorMelhor: true },
  { rotulo: "Aprovação", valor: (p) => p.percentualAprovacao, texto: (p) => (p.encerrado ? pct(p.percentualAprovacao) : "em curso") },
];

export function ComparativoSemestres({ comparativo, curso }: { comparativo: ComparativoCoordenador; curso: string }) {
  const { periodos, porDisciplina } = comparativo;
  if (periodos.length === 0) return null;
  return (
    <Cartao titulo="Comparativo entre semestres" acao={<span className="text-[13px] text-mudo">{curso}</span>} className="mt-5">
      {periodos.length === 1 && <p className="mb-3 text-sm text-mudo">Só há turmas em {periodos[0].periodo}. A comparação aparece quando houver outro semestre.</p>}
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
        <MediaFrequenciaPorTurma
          descricao="Média e frequência média por semestre"
          turmas={periodos.map((p) => ({ id: p.periodo, rotulo: p.periodo, mediaTurma: p.media, frequenciaMedia: p.frequencia }))}
        />
        <table className="w-full text-[15px]">
          <thead>
            <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
              <th className="pr-2 pb-2.5">Indicador</th>
              {periodos.map((p) => <th key={p.periodo} className="px-2 pb-2.5 text-right">{p.periodo}</th>)}
            </tr>
          </thead>
          <tbody>
            {INDICADORES.map((ind) => (
              <tr key={ind.rotulo} className="border-t border-traco">
                <td className="py-2.5 pr-2">{ind.rotulo}</td>
                {periodos.map((p, i) => (
                  <td key={p.periodo} className={`px-2 py-2.5 text-right tabular-nums ${!p.encerrado && ind.rotulo === "Aprovação" ? "text-mudo" : ""}`}>
                    {ind.texto(p)}
                    {i > 0 && <Seta anterior={ind.valor(periodos[i - 1])} atual={ind.valor(p)} menorMelhor={ind.menorMelhor} />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {porDisciplina.linhas.length > 0 && (
        <>
          <h3 className="mt-5 mb-2.5 text-[15px] font-semibold">Média por disciplina</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-[15px]">
              <thead>
                <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                  <th className="pr-2 pb-2.5">Disciplina</th>
                  {porDisciplina.periodos.map((p) => <th key={p} className="px-2 pb-2.5 text-right">{p}</th>)}
                </tr>
              </thead>
              <tbody>
                {porDisciplina.linhas.map((l) => (
                  <tr key={l.disciplina} className="border-t border-traco">
                    <td className="py-2.5 pr-2">{l.disciplina}</td>
                    {l.medias.map((m, i) => <td key={i} className="px-2 py-2.5 text-right tabular-nums">{m === null ? "—" : numero(m)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <p className="mt-3 text-xs text-mudo">Médias simples das matrículas, como no relatório. Aprovação só nos semestres encerrados (média ≥ 6,0 e frequência ≥ 75%).</p>
    </Cartao>
  );
}
