"use client";

// Rematrícula pelo estudante (SPEC-038, RF-46): turmas do curso no período com a janela aberta, com o motivo
// quando não pode. A regra (vaga, pré-requisito, choque) vale no servidor (RB-36).
// Layout aprovado em docs/layout/prototipo.html#rematricula.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { descreverHorarioCurto } from "@/domain/horarios";
import { CLASSE_BOTAO_PRIMARIO, Cartao, EstadoVazio, Mensagem } from "./ui";

export type TurmaDaRematricula = {
  id: string;
  nome: string;
  disciplina: string;
  cargaHoraria: number;
  professor: string;
  semestre: number | null;
  horarios: { diaSemana: number; inicio: string; fim: string; sala: string }[];
  vagas: number | null;
  restantes: number | null;
  matriculado: boolean;
  motivo: string | null;
};

export function Rematricula({ periodo, turmas }: { periodo: string; turmas: TurmaDaRematricula[] }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  async function acao(turma: TurmaDaRematricula, cancelar: boolean) {
    if (cancelar && !window.confirm(`Cancelar a matrícula em ${turma.disciplina}?`)) return;
    setEnviando(turma.id);
    setErro(null);
    setSucesso(null);
    const resposta = await fetch(cancelar ? `/api/rematricula/${turma.id}` : "/api/rematricula", {
      method: cancelar ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: cancelar ? undefined : JSON.stringify({ turmaId: turma.id }),
    }).catch(() => null);
    const retorno = resposta ? await resposta.json().catch(() => ({})) : {};
    setEnviando(null);
    if (!resposta?.ok) {
      setErro(retorno.erro ?? "Não foi possível concluir.");
      router.refresh();
      return;
    }
    setSucesso(cancelar ? `Matrícula em ${turma.disciplina} cancelada.` : `Você está matriculado em ${turma.disciplina}.`);
    router.refresh();
  }

  const minhas = turmas.filter((t) => t.matriculado);
  return (
    <div className="space-y-4">
      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
      {sucesso && <Mensagem tipo="sucesso">{sucesso}</Mensagem>}
      <Mensagem tipo="info">
        {minhas.length === 0
          ? `Você ainda não tem turma em ${periodo}.`
          : `Você está em ${minhas.length} turma(s) de ${periodo}: ${minhas.map((t) => `${t.disciplina}${t.horarios.length ? ` (${t.horarios.map(descreverHorarioCurto).join(", ")})` : ""}`).join("; ")}.`}
      </Mensagem>
      <Cartao titulo={`Turmas do curso em ${periodo} (${turmas.length})`}>
        {turmas.length === 0 ? (
          <EstadoVazio>Nenhuma turma do seu curso neste período.</EstadoVazio>
        ) : (
          <table className="tabela-responsiva w-full text-[15px]">
            <thead>
              <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                <th className="pr-2 pb-2.5">Disciplina</th>
                <th className="px-2 pb-2.5">Turma e horários</th>
                <th className="px-2 pb-2.5 text-right">Vagas</th>
                <th className="pb-2.5 pl-2"><span className="sr-only">Ação</span></th>
              </tr>
            </thead>
            <tbody>
              {turmas.map((t) => (
                <tr key={t.id} className="border-t border-traco">
                  <td data-rotulo="Disciplina" className="py-3 pr-2">
                    {t.disciplina}
                    <span className="block text-xs text-mudo">{t.semestre ? `${t.semestre}º semestre · ` : ""}{t.cargaHoraria} h · {t.professor}</span>
                  </td>
                  <td data-rotulo="Turma e horários" className="px-2 py-3 text-sm">
                    {t.nome}
                    <span className="block text-xs text-mudo">{t.horarios.length ? t.horarios.map((h) => `${descreverHorarioCurto(h)} · ${h.sala}`).join("; ") : "Sem horário cadastrado"}</span>
                  </td>
                  <td data-rotulo="Vagas" className="px-2 py-3 text-right whitespace-nowrap tabular-nums">{t.restantes === null ? "livre" : `${t.restantes} de ${t.vagas}`}</td>
                  <td data-rotulo="Ação" className="py-3 pl-2 text-right">
                    {t.matriculado ? (
                      <span className="inline-flex flex-wrap items-center justify-end gap-2">
                        <span className="rounded-full bg-normal-fundo px-2.5 py-0.5 text-[13px] font-semibold text-normal">● Matriculado</span>
                        <button type="button" disabled={enviando !== null} onClick={() => acao(t, true)} className="text-sm font-medium text-risco hover:underline">Cancelar</button>
                      </span>
                    ) : t.motivo ? (
                      <span className="inline-block max-w-60 text-left text-[13px] text-mudo">{t.motivo}</span>
                    ) : (
                      <button type="button" disabled={enviando !== null} onClick={() => acao(t, false)} className={CLASSE_BOTAO_PRIMARIO}>{enviando === t.id ? "Matriculando..." : "Matricular"}</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Cartao>
    </div>
  );
}
