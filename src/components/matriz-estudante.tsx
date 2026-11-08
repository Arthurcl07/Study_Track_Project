// "Meu curso": matriz por semestre com a situação de cada disciplina e a integralização (SPEC-037, RB-35).
// Só apresentação. Layout aprovado em docs/layout/prototipo.html#meu-curso.
import type { SituacaoNaMatriz } from "@/domain/matriz";
import type { CursoDoEstudante } from "@/server/academico/matriz";
import { Cartao, EstadoVazio } from "./ui";

const COR: Record<SituacaoNaMatriz, string> = {
  Aprovada: "text-normal",
  Aproveitada: "text-normal",
  Cursando: "text-info",
  Reprovada: "text-risco",
  Bloqueada: "text-mudo",
  Pendente: "text-texto",
};

export function BarraIntegralizacao({ percentual, horasConcluidas, horasObrigatorias, detalhe }: { percentual: number | null; horasConcluidas: number; horasObrigatorias: number; detalhe?: string }) {
  if (percentual === null) return <p className="text-sm text-mudo">A matriz do curso ainda não tem disciplina obrigatória.</p>;
  const p = Math.floor(percentual);
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <p className="text-3xl font-bold tabular-nums">{p}%</p>
        <p className="text-sm text-mudo">{horasConcluidas} de {horasObrigatorias} h obrigatórias{detalhe ? ` · ${detalhe}` : ""}</p>
      </div>
      <div className="mt-2 h-3.5 overflow-hidden rounded-full bg-traco" role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100} aria-label="Integralização">
        <span className="block h-full rounded-full bg-normal" style={{ width: `${Math.min(p, 100)}%` }} />
      </div>
    </div>
  );
}

export function MatrizDoEstudante({ curso }: { curso: CursoDoEstudante }) {
  const { integralizacao: i } = curso;
  return (
    <div className="space-y-5">
      <Cartao titulo="Integralização do curso">
        <BarraIntegralizacao percentual={i.percentual} horasConcluidas={i.horasConcluidas} horasObrigatorias={i.horasObrigatorias} detalhe={curso.aproveitamentos ? `${curso.aproveitamentos} aproveitamento(s)` : undefined} />
      </Cartao>
      {curso.semestres.length === 0 ? (
        <EstadoVazio>A grade do curso ainda não tem disciplinas.</EstadoVazio>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {curso.semestres.map((s) => (
            <section key={s.semestre ?? "sem"} className="rounded-2xl border border-traco bg-white p-4">
              <h3 className="mb-2 text-sm font-semibold text-marinho">{s.semestre ? `${s.semestre}º semestre` : "Sem semestre definido"}</h3>
              <ul>
                {s.disciplinas.map((d) => (
                  <li key={d.disciplinaId} className="flex items-start justify-between gap-3 border-t border-traco py-2 text-sm first:border-t-0">
                    <span className="min-w-0">
                      {d.nome}
                      <span className="block text-xs text-mudo">
                        {d.cargaHoraria} h · {d.obrigatoria ? "obrigatória" : "optativa"}
                        {d.requisitosNomes.length > 0 ? ` · exige ${d.requisitosNomes.join(", ")}` : ""}
                      </span>
                    </span>
                    <span className={`shrink-0 text-right text-[13px] font-semibold ${COR[d.situacao]}`}>
                      {d.rotulo}
                      {d.situacao === "Bloqueada" && <span className="block text-xs font-normal text-mudo">falta {d.faltam.join(", ")}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
