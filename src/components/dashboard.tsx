// Peças dos dashboards por perfil (SPEC-016). Desenhadas no servidor, sem biblioteca externa.
// Layout aprovado em docs/layout/prototipo.html#dash-estudante, #dash-professor, #dash-coordenador e #dash-admin.
import { formatarDataCurta } from "./ui";

const DIAS_DA_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

// Dia do prazo em destaque ("hoje" em âmbar); a data é "AAAA-MM-DD" no horário de Brasília (OPEN-010).
function DiaDoPrazo({ prazo, hoje }: { prazo: string; hoje: string }) {
  const ehHoje = prazo === hoje;
  const semana = DIAS_DA_SEMANA[new Date(`${prazo}T00:00:00Z`).getUTCDay()];
  return (
    <span
      className={`flex w-12 shrink-0 flex-col items-center rounded-[10px] py-1 leading-tight ${ehHoje ? "bg-atencao-fundo text-atencao" : "bg-azul-suave text-azul-escuro"}`}
      title={formatarDataCurta(prazo)}
    >
      <strong className="text-[17px] tabular-nums">{prazo.slice(8, 10)}</strong>
      <small className="text-[11px] uppercase">{ehHoje ? "hoje" : semana}</small>
    </span>
  );
}

export function ListaPrazos({ itens, hoje, vazio }: { itens: { id: string; titulo: string; detalhe: string; prazo: string }[]; hoje: string; vazio: string }) {
  if (itens.length === 0) return <p className="text-mudo">{vazio}</p>;
  return (
    <ul className="divide-y divide-traco">
      {itens.map((i) => (
        <li key={i.id} className="flex items-center gap-3 py-2.5 first:pt-0">
          <DiaDoPrazo prazo={i.prazo} hoje={hoje} />
          <div className="min-w-0">
            <p className="font-medium">{i.titulo}</p>
            <p className="text-sm text-mudo">{i.detalhe}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

// Barra de progresso do plano (RB-12: concluídos ÷ previstos).
export function BarraProgresso({ percentual }: { percentual: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-traco" role="progressbar" aria-valuenow={percentual} aria-valuemin={0} aria-valuemax={100}>
        <span className="block h-full rounded-full bg-azul" style={{ width: `${percentual}%` }} />
      </div>
      <span className="w-10 text-right text-[13px] tabular-nums">{percentual}%</span>
    </div>
  );
}

// Barras horizontais simples de contagem (contas por perfil, RF-25).
export function BarrasHorizontais({ itens }: { itens: { rotulo: string; valor: number; cor: string }[] }) {
  const maximo = Math.max(1, ...itens.map((i) => i.valor));
  return (
    <ul className="space-y-3.5">
      {itens.map((i) => (
        <li key={i.rotulo}>
          <div className="mb-1 flex justify-between text-sm">
            <span>{i.rotulo}</span>
            <strong className="tabular-nums">{i.valor}</strong>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-traco">
            <span className={`block h-full rounded-full ${i.cor}`} style={{ width: `${(i.valor / maximo) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
