// Planos de recuperação vistos pelo próprio estudante (SPEC-012, RF-19, OPEN-027). Só leitura:
// quem marca os itens é o professor (OPEN-003). Layout aprovado em docs/layout/prototipo.html#estudante-plano.
import type { PlanoDoEstudante } from "@/server/academico/painel";
import { Icone } from "./icones";

const data = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

function PlanoAtivo({ plano }: { plano: PlanoDoEstudante }) {
  const { concluidos, total, percentual } = plano.progresso;
  return (
    <section className="rounded-2xl border border-traco bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-semibold">Seu plano de recuperação</h2>
          <p className="mt-1 text-sm text-mudo">{plano.disciplina} · Prof. {plano.professor} · criado em {data(plano.criadoEm)}</p>
        </div>
        <div className="ml-auto text-right">
          <strong className="block text-2xl font-bold tabular-nums">{percentual}%</strong>
          <span className="text-sm text-mudo">{concluidos} de {total} concluídos</span>
        </div>
      </div>
      <div className="mt-3 mb-2 h-2 overflow-hidden rounded-full bg-traco" role="progressbar" aria-valuenow={percentual} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso do plano">
        <span className="block h-full rounded-full bg-azul" style={{ width: `${percentual}%` }} />
      </div>
      <ul>
        {plano.itens.map((item) => (
          <li key={item.id} className="flex items-center gap-2.5 border-t border-traco py-2.5 text-[15px]">
            <span
              aria-hidden="true"
              className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2 ${item.concluido ? "border-normal bg-normal text-white" : "border-traco"}`}
            >
              {item.concluido && <Icone nome="check" className="h-3 w-3" />}
            </span>
            <span className={item.concluido ? "text-mudo line-through" : ""}>{item.descricao}</span>
            <span className="sr-only">{item.concluido ? "(concluído)" : "(pendente)"}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm text-mudo">Quem marca os itens como concluídos é o professor da turma.</p>
    </section>
  );
}

export function PlanosDoEstudante({ planos }: { planos: PlanoDoEstudante[] }) {
  if (planos.length === 0) return null;
  const ativos = planos.filter((p) => p.status === "Ativo");
  const encerrados = planos.filter((p) => p.status === "Encerrado");
  return (
    <div className="mb-5 space-y-3">
      {ativos.map((p) => <PlanoAtivo key={p.id} plano={p} />)}
      {encerrados.length > 0 && (
        <details className="rounded-2xl border border-traco bg-white px-5 py-3">
          <summary className="cursor-pointer font-medium text-azul">Planos encerrados ({encerrados.length})</summary>
          <ul className="mt-2 space-y-1.5 text-sm">
            {encerrados.map((p) => (
              <li key={p.id}>
                {p.disciplina} · encerrado em {p.encerradoEm ? data(p.encerradoEm) : "—"} · {p.progresso.concluidos} de {p.progresso.total} concluídos ({p.progresso.percentual}%)
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
