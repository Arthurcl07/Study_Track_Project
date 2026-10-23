// Apresentação dos alertas da SPEC-006 (RF-12): sempre cor + símbolo + rótulo (RNF-06).
import Link from "next/link";
import { FREQUENCIA_MINIMA, MEDIA_NORMAL, MEDIA_RISCO } from "@/domain/situacao-academica";
import type { Alerta } from "@/server/academico/painel";
import { CLASSE_LINK, Cartao, SeloSituacao } from "./ui";

const formatarNumero = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

function detalhe(alerta: Alerta) {
  const media = alerta.media === null ? "sem nota" : formatarNumero(alerta.media);
  const frequencia = alerta.frequencia === null ? "sem registro" : `${formatarNumero(alerta.frequencia)}%`;
  return `Média ${media} · Frequência ${frequencia}`;
}

// Aviso no topo do painel do estudante.
export function AvisoAlerta({ alerta }: { alerta: Alerta }) {
  const risco = alerta.nivel === "Risco";
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-[14px] border px-4 py-3.5 ${
        risco ? "border-red-300 bg-risco-fundo text-red-900" : "border-amber-300 bg-atencao-fundo text-amber-900"
      }`}
    >
      <span aria-hidden="true" className="text-lg leading-6">{risco ? "■" : "▲"}</span>
      <div>
        <p className="font-semibold">{risco ? "Risco" : "Atenção"} em {alerta.turma.disciplina}</p>
        <p className="mt-0.5 text-sm">
          {detalhe(alerta)}. Converse com {alerta.turma.professor}, responsável pela turma.
        </p>
      </div>
    </div>
  );
}

// Tabela "Alertas das minhas turmas" do professor; o valor que causou o alerta aparece em cor.
// SPEC-016: no dashboard mostra só as primeiras linhas (Risco primeiro) com o atalho "Ver todos".
export function TabelaAlertasProfessor({ alertas, limite, verTodos }: { alertas: Alerta[]; limite?: number; verTodos?: string }) {
  if (alertas.length === 0) return null;
  const visiveis = limite ? alertas.slice(0, limite) : alertas;
  const acao = verTodos && visiveis.length < alertas.length ? <Link href={verTodos} className={CLASSE_LINK}>Ver todos →</Link> : undefined;
  return (
    <Cartao titulo={`Alertas das minhas turmas (${alertas.length})`} acao={acao} className="mb-5">
      <table className="tabela-responsiva w-full text-[15px]">
        <thead>
          <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
            <th className="pr-2 pb-2.5">Situação</th>
            <th className="pr-2 pb-2.5">Estudante</th>
            <th className="pr-2 pb-2.5">Turma</th>
            <th className="pb-2.5 pl-4 text-right">Média</th>
            <th className="pb-2.5 pl-4 text-right">Frequência</th>
          </tr>
        </thead>
        <tbody>
          {visiveis.map((a) => {
            const mediaBaixa = a.media !== null && a.media < MEDIA_NORMAL;
            const frequenciaBaixa = a.frequencia !== null && a.frequencia < FREQUENCIA_MINIMA;
            return (
              <tr key={`${a.turma.id}-${a.estudante.id}`} className="border-t border-traco">
                <td data-rotulo="Situação" className="py-3 pr-2"><SeloSituacao situacao={a.nivel} /></td>
                <td data-rotulo="Estudante" className="py-3 pr-2">{a.estudante.nome}</td>
                <td data-rotulo="Turma" className="py-3 pr-2">{a.turma.nome} · {a.turma.disciplina}</td>
                <td data-rotulo="Média" className={`py-3 pl-4 text-right tabular-nums ${mediaBaixa ? `font-semibold ${a.media! < MEDIA_RISCO ? "text-risco" : "text-atencao"}` : ""}`}>
                  {a.media === null ? "—" : formatarNumero(a.media)}
                </td>
                <td data-rotulo="Frequência" className={`py-3 pl-4 text-right tabular-nums ${frequenciaBaixa ? "font-semibold text-risco" : ""}`}>
                  {a.frequencia === null ? "—" : `${formatarNumero(a.frequencia)}%`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Cartao>
  );
}
