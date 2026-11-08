// Calendário do mês e grade da semana (SPEC-040, SPEC-041). Só apresentação: os dados vêm do servidor.
// Layout aprovado em docs/layout/prototipo.html#calendario.
import Link from "next/link";
import { diasDaGradeDoMes, mesVizinho } from "@/domain/calendario";
import { DIAS_CURTOS, DIAS_SEMANA } from "@/domain/horarios";
import type { ItemDoMes } from "@/server/academico/calendario";
import { CLASSE_BOTAO_SECUNDARIO, Cartao, EstadoVazio, formatarDataCurta } from "./ui";

const NOMES_MES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
export const nomeDoMes = (mes: string) => `${NOMES_MES[Number(mes.slice(5, 7)) - 1]} de ${mes.slice(0, 4)}`;

const COR: Record<ItemDoMes["tipo"], string> = {
  Feriado: "bg-risco-fundo text-risco",
  Recesso: "bg-risco-fundo text-risco",
  SemanaProvas: "bg-atencao-fundo text-atencao",
  Avaliacao: "bg-atencao-fundo text-atencao",
  Prazo: "bg-info-fundo text-info",
  InicioAulas: "bg-normal-fundo text-normal",
  FimAulas: "bg-normal-fundo text-normal",
  Outro: "bg-slate-100 text-slate-700",
};

export function NavegacaoMes({ mes, base }: { mes: string; base: string }) {
  const link = (m: string) => `${base}${base.includes("?") ? "&" : "?"}mes=${m}`;
  return (
    <span className="flex gap-2">
      <Link href={link(mesVizinho(mes, -1))} className={CLASSE_BOTAO_SECUNDARIO}>← Anterior</Link>
      <Link href={link(mesVizinho(mes, 1))} className={CLASSE_BOTAO_SECUNDARIO}>Próximo →</Link>
    </span>
  );
}

export function CalendarioMes({ mes, itens }: { mes: string; itens: ItemDoMes[] }) {
  const dias = diasDaGradeDoMes(mes);
  const doDia = (data: string) => itens.filter((i) => i.data <= data && data <= i.ate);
  return (
    <Cartao titulo={`Calendário · ${nomeDoMes(mes)}`}>
      <div className="hidden grid-cols-7 gap-1 text-xs sm:grid">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => <div key={d} className="py-1 text-center font-semibold text-mudo">{d}</div>)}
        {dias.map(({ data, doMes }) => {
          const doDiaItens = doDia(data);
          const folga = doDiaItens.some((i) => i.tipo === "Feriado" || i.tipo === "Recesso");
          return (
            <div key={data} className={`min-h-20 rounded-lg border border-traco p-1 ${doMes ? (folga ? "bg-risco-fundo/60" : "bg-white") : "bg-nevoa text-slate-400"}`}>
              <span className="tabular-nums">{Number(data.slice(8))}</span>
              {doMes && doDiaItens.slice(0, 3).map((i, k) => <span key={k} className={`mt-0.5 block truncate rounded px-1 text-[11px] leading-snug ${COR[i.tipo]}`} title={i.titulo}>{i.titulo}</span>)}
              {doMes && doDiaItens.length > 3 && <span className="block text-[11px] text-mudo">+{doDiaItens.length - 3}</span>}
            </div>
          );
        })}
      </div>
      {/* No celular, a lista do mês no lugar da grade. */}
      <ul className="space-y-2 sm:hidden">
        {itens.length === 0 ? <EstadoVazio>Nada neste mês.</EstadoVazio> : itens.map((i, k) => (
          <li key={k} className="flex items-start gap-3 text-sm">
            <span className="w-24 shrink-0 tabular-nums text-mudo">{formatarDataCurta(i.data)}{i.ate !== i.data ? `–${i.ate.slice(8)}` : ""}</span>
            <span className={`rounded px-1.5 ${COR[i.tipo]}`}>{i.titulo}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex flex-wrap gap-3 text-xs text-mudo">
        <span><span className="rounded bg-risco-fundo px-1 text-risco">■</span> feriado/recesso</span>
        <span><span className="rounded bg-atencao-fundo px-1 text-atencao">■</span> provas</span>
        <span><span className="rounded bg-info-fundo px-1 text-info">■</span> prazos</span>
        <span><span className="rounded bg-normal-fundo px-1 text-normal">■</span> aulas</span>
      </p>
    </Cartao>
  );
}

export type HorarioDaGrade = { id: string; diaSemana: number; inicio: string; fim: string; sala: string; turma: string; disciplina: string };

export function GradeDaSemana({ horarios }: { horarios: HorarioDaGrade[] }) {
  if (horarios.length === 0) return <Cartao titulo="Grade da semana"><EstadoVazio>Suas turmas ainda não têm horário cadastrado.</EstadoVazio></Cartao>;
  return (
    <Cartao titulo="Grade da semana">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((dia) => {
          const doDia = horarios.filter((h) => h.diaSemana === dia);
          return (
            <div key={dia}>
              <p className="mb-1.5 text-xs font-semibold tracking-wide text-mudo uppercase"><span className="sm:hidden">{DIAS_SEMANA[dia]}</span><span className="hidden sm:inline">{DIAS_CURTOS[dia]}</span></p>
              {doDia.length === 0 ? <p className="text-xs text-slate-400">—</p> : doDia.map((h) => (
                <div key={h.id} className="mb-2 rounded-lg border-l-3 border-azul bg-azul-suave px-2 py-1.5 text-sm">
                  <p className="font-semibold">{h.disciplina}</p>
                  <p className="text-xs text-mudo">{h.inicio}–{h.fim} · {h.sala}</p>
                  <p className="text-xs text-mudo">{h.turma}</p>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </Cartao>
  );
}
