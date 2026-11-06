"use client";

// Tela do professor (SPEC-018, RF-27): escolher a turma, ver aulas e frequências e registrar ou corrigir a
// chamada de uma aula. Todos começam presentes; o professor desmarca as faltas. Frequência e situação mostradas
// vêm do servidor (RB-21, SPEC-003). Layout aprovado em docs/layout/prototipo.html#prof-chamada.
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Cartao, CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO, CLASSE_CAMPO, CLASSE_ROTULO, ErroCampo, EstadoVazio, Mensagem, SeloSituacao, corDaFrequencia, formatarDataCurta } from "./ui";

export type TurmaParaChamada = {
  id: string;
  rotulo: string;
  estudantes: { id: string; nome: string; percentual: number | null; situacao: "Normal" | "Atencao" | "Risco" | null }[];
  aulas: { data: string; presencas: { estudanteId: string; presente: boolean }[] }[];
};

const formatarPercentual = (valor: number) => `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%`;

export function RegistroChamada({ turmas, hoje }: { turmas: TurmaParaChamada[]; hoje: string }) {
  const router = useRouter();
  const [turmaId, setTurmaId] = useState(turmas[0]?.id ?? "");
  const turma = turmas.find((t) => t.id === turmaId);
  const todosPresentes = (t?: TurmaParaChamada) => Object.fromEntries((t?.estudantes ?? []).map((e) => [e.id, true]));
  const [data, setData] = useState(hoje);
  const [presentes, setPresentes] = useState<Record<string, boolean>>(() => todosPresentes(turma));
  const [corrigindo, setCorrigindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [errosCampo, setErrosCampo] = useState<Record<string, string>>({});
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function nova(t = turma) {
    setData(hoje);
    setPresentes(todosPresentes(t));
    setCorrigindo(false);
    setErro(null);
    setErrosCampo({});
  }

  function corrigir(aula: TurmaParaChamada["aulas"][number]) {
    setData(aula.data);
    setPresentes(Object.fromEntries((turma?.estudantes ?? []).map((e) => [e.id, aula.presencas.find((p) => p.estudanteId === e.id)?.presente ?? true])));
    setCorrigindo(true);
    setSucesso(null);
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro(null);
    setErrosCampo({});
    setSucesso(null);
    setEnviando(true);
    try {
      const resposta = await fetch("/api/aulas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turmaId, data, presencas: (turma?.estudantes ?? []).map((e) => ({ estudanteId: e.id, presente: presentes[e.id] ?? true })) }),
      });
      const retorno = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(retorno.erro ?? "Não foi possível salvar a chamada.");
        setErrosCampo(retorno.campos ?? {});
        return;
      }
      setSucesso(`${retorno.corrigida ? "Chamada corrigida" : "Chamada registrada"}: ${retorno.presentes} de ${retorno.total} presentes. Frequências e situações atualizadas.`);
      nova();
      router.refresh();
    } catch {
      setErro("Não foi possível salvar a chamada. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (turmas.length === 0) return <EstadoVazio>Você não leciona nenhuma turma de período aberto.</EstadoVazio>;

  const estudantes = turma?.estudantes ?? [];
  const aulas = turma?.aulas ?? [];
  const faltas = estudantes.filter((e) => presentes[e.id] === false).length;
  const presencasDe = (id: string) => aulas.filter((a) => a.presencas.some((p) => p.estudanteId === id && p.presente)).length;
  const aulasDe = (id: string) => aulas.filter((a) => a.presencas.some((p) => p.estudanteId === id)).length;

  return (
    <div className="space-y-5">
      <Cartao>
        <label htmlFor="turma" className={CLASSE_ROTULO}>Turma</label>
        <select
          id="turma"
          value={turmaId}
          onChange={(e) => { const t = turmas.find((x) => x.id === e.target.value); setTurmaId(e.target.value); nova(t); setSucesso(null); }}
          className={`${CLASSE_CAMPO} sm:max-w-md`}
        >
          {turmas.map((t) => <option key={t.id} value={t.id}>{t.rotulo}</option>)}
        </select>
      </Cartao>

      <div className="grid items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <Cartao titulo={`Estudantes (${estudantes.length})`}>
            {estudantes.length === 0 ? (
              <EstadoVazio>Nenhum estudante matriculado nesta turma.</EstadoVazio>
            ) : (
              <table className="tabela-responsiva w-full text-[15px]">
                <thead>
                  <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                    <th className="pb-2.5">Estudante</th>
                    <th className="pb-2.5 text-right">Presenças</th>
                    <th className="pb-2.5 text-right">Frequência</th>
                    <th className="pb-2.5 pl-3">Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {estudantes.map((e) => (
                    <tr key={e.id} className="border-t border-traco">
                      <td data-rotulo="Estudante" className="px-2 py-3">{e.nome}</td>
                      <td data-rotulo="Presenças" className="px-2 py-3 text-right tabular-nums">{aulasDe(e.id) === 0 ? "—" : `${presencasDe(e.id)} de ${aulasDe(e.id)}`}</td>
                      <td data-rotulo="Frequência" className={`px-2 py-3 text-right tabular-nums ${e.percentual === null ? "text-mudo" : `font-semibold ${corDaFrequencia(e.percentual)}`}`}>
                        {e.percentual === null ? "—" : formatarPercentual(e.percentual)}
                      </td>
                      <td data-rotulo="Situação" className="px-2 py-3 pl-3">
                        {e.situacao ? <SeloSituacao situacao={e.situacao} /> : <span className="text-mudo">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Cartao>
          <Cartao titulo={`Aulas registradas (${aulas.length})`}>
            {aulas.length === 0 ? (
              <EstadoVazio>Nenhuma chamada registrada nesta turma.</EstadoVazio>
            ) : (
              <table className="tabela-responsiva w-full text-[15px]">
                <thead>
                  <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                    <th className="pb-2.5">Data</th>
                    <th className="pb-2.5 text-right">Presentes</th>
                    <th className="pb-2.5"><span className="sr-only">Ação</span></th>
                  </tr>
                </thead>
                <tbody>
                  {aulas.map((a) => (
                    <tr key={a.data} className={`border-t border-traco ${corrigindo && a.data === data ? "bg-azul-suave" : ""}`}>
                      <td data-rotulo="Data" className="px-2 py-3">{formatarDataCurta(a.data)}</td>
                      <td data-rotulo="Presentes" className="px-2 py-3 text-right tabular-nums">{a.presencas.filter((p) => p.presente).length} de {a.presencas.length}</td>
                      <td className="px-2 py-3 text-right">
                        <button type="button" onClick={() => corrigir(a)} className="font-medium text-azul hover:underline">Corrigir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Cartao>
        </div>

        <Cartao titulo={corrigindo ? `Corrigir chamada · ${formatarDataCurta(data)}` : "Nova chamada"}>
          {estudantes.length === 0 ? (
            <p className="text-sm text-mudo">Matricule estudantes na turma para fazer a chamada.</p>
          ) : (
            <form onSubmit={salvar} className="space-y-4" noValidate>
              <div>
                <label htmlFor="data" className={CLASSE_ROTULO}>Data da aula</label>
                <input id="data" type="date" max={hoje} value={data} disabled={corrigindo} onChange={(e) => setData(e.target.value)} aria-invalid={Boolean(errosCampo.data)} className={CLASSE_CAMPO} />
                <ErroCampo mensagem={errosCampo.data} />
              </div>
              <div>
                <p className="mb-1 text-sm text-mudo">Todos começam presentes. Desmarque quem faltou.</p>
                <ul>
                  {estudantes.map((e) => (
                    <li key={e.id} className="border-t border-traco first:border-t-0">
                      <label className="flex cursor-pointer items-center gap-3 py-2.5 text-[15px]">
                        <input
                          type="checkbox"
                          checked={presentes[e.id] ?? true}
                          onChange={(ev) => setPresentes((atual) => ({ ...atual, [e.id]: ev.target.checked }))}
                          className="h-5 w-5 accent-azul"
                        />
                        <span className="flex-1">{e.nome}</span>
                        {presentes[e.id] === false && <span className="text-[13px] font-semibold text-risco">Falta</span>}
                      </label>
                    </li>
                  ))}
                </ul>
                <ErroCampo mensagem={errosCampo.presencas} />
              </div>
              <p className="rounded-[10px] bg-info-fundo px-3 py-2.5 text-sm text-info">{estudantes.length - faltas} presente(s) · {faltas} falta(s)</p>
              {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
              {sucesso && <Mensagem tipo="sucesso">{sucesso}</Mensagem>}
              <button type="submit" disabled={enviando} className={`w-full ${CLASSE_BOTAO_PRIMARIO}`}>
                {enviando ? "Salvando..." : corrigindo ? "Salvar correção" : "Salvar chamada"}
              </button>
              {corrigindo && (
                <button type="button" onClick={() => nova()} className={`w-full ${CLASSE_BOTAO_SECUNDARIO}`}>Cancelar correção</button>
              )}
            </form>
          )}
          {estudantes.length > 0 && sucesso === null && !corrigindo && <p className="mt-3 text-xs text-mudo">Abaixo de 75% de frequência a situação vira Risco.</p>}
        </Cartao>
      </div>
    </div>
  );
}
