"use client";

// Tela do professor (SPEC-018, RF-27): escolher a turma, ver aulas e frequências e registrar ou corrigir a chamada.
// Todos começam presentes; o professor desmarca as faltas. Frequência e situação mostradas vêm do servidor (RB-21).
// SPEC-028: de 1 a 4 aulas na data (desmarcar na 1ª aula desmarca as seguintes; depois dá para mudar cada uma).
// SPEC-032: falta abonada pela secretaria aparece como "Abonada". SPEC-026: mudar a data e excluir uma aula.
// Layout aprovado em docs/layout/prototipo.html#prof-chamada e #chamada-aulas.
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { MAXIMO_AULAS_POR_DATA, faltaAbonada } from "@/domain/frequencia";
import { Cartao, CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO, CLASSE_CAMPO, CLASSE_ROTULO, ErroCampo, EstadoVazio, Mensagem, SeloSituacao, corDaFrequencia, formatarDataCurta } from "./ui";

export type TurmaParaChamada = {
  id: string;
  rotulo: string;
  estudantes: { id: string; nome: string; matricula: string | null; percentual: number | null; situacao: "Normal" | "Atencao" | "Risco" | null }[];
  aulas: { id: string; data: string; numero: number; presencas: { estudanteId: string; presente: boolean }[] }[];
  abonos: { estudanteId: string; inicio: string; fim: string }[];
};

const formatarPercentual = (valor: number) => `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%`;
const NUMEROS = Array.from({ length: MAXIMO_AULAS_POR_DATA }, (_, i) => i + 1);

export function RegistroChamada({ turmas, hoje }: { turmas: TurmaParaChamada[]; hoje: string }) {
  const router = useRouter();
  const [turmaId, setTurmaId] = useState(turmas[0]?.id ?? "");
  const turma = turmas.find((t) => t.id === turmaId);
  const estudantes = turma?.estudantes ?? [];
  const aulas = turma?.aulas ?? [];
  const abonada = (estudanteId: string, data: string) => faltaAbonada(data, (turma?.abonos ?? []).filter((a) => a.estudanteId === estudanteId));

  // Presenças de uma data: aulas já registradas vêm com o que foi gravado; o resto começa presente.
  const presencasDaData = (d: string, t = turma) => {
    const existentes = (t?.aulas ?? []).filter((a) => a.data === d);
    return {
      quantidade: Math.max(existentes.length, 1),
      presentes: Object.fromEntries(
        (t?.estudantes ?? []).map((e) => [e.id, NUMEROS.map((n) => existentes.find((a) => a.numero === n)?.presencas.find((p) => p.estudanteId === e.id)?.presente ?? true)]),
      ),
    };
  };
  const [data, setData] = useState(hoje);
  const [quantidade, setQuantidade] = useState(() => presencasDaData(hoje).quantidade);
  // presentes[estudanteId][i] = presença na (i+1)ª aula.
  const [presentes, setPresentes] = useState<Record<string, boolean[]>>(() => presencasDaData(hoje).presentes);
  const [erro, setErro] = useState<string | null>(null);
  const [errosCampo, setErrosCampo] = useState<Record<string, string>>({});
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const daData = (d: string) => aulas.filter((a) => a.data === d);
  const registradas = daData(data).length;
  const corrigindo = registradas > 0;

  // Carrega a data: aulas já registradas vêm com as presenças gravadas; o resto começa presente.
  function carregar(novaData: string, t = turma) {
    const estado = presencasDaData(novaData, t);
    setData(novaData);
    setQuantidade(estado.quantidade);
    setPresentes(estado.presentes);
    setErro(null);
    setErrosCampo({});
  }

  const presente = (id: string, i: number) => presentes[id]?.[i] ?? true;
  function marcar(id: string, i: number, valor: boolean) {
    setPresentes((atual) => {
      const linha = [...(atual[id] ?? NUMEROS.map(() => true))];
      if (i === 0) for (let k = 0; k < linha.length; k++) linha[k] = valor;
      else linha[i] = valor;
      return { ...atual, [id]: linha };
    });
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro(null);
    setErrosCampo({});
    setSucesso(null);
    setEnviando(true);
    try {
      const corpo = {
        turmaId,
        data,
        aulas: Array.from({ length: quantidade }, (_, i) => estudantes.map((e) => ({ estudanteId: e.id, presente: abonada(e.id, data) ? false : presente(e.id, i) }))),
      };
      const resposta = await fetch("/api/aulas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
      const retorno = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(retorno.erro ?? "Não foi possível salvar a chamada.");
        setErrosCampo(retorno.campos ?? {});
        return;
      }
      setSucesso(`${retorno.corrigida ? "Chamada corrigida" : "Chamada registrada"}: ${retorno.quantidade} aula(s) em ${formatarDataCurta(data)}. Frequências e situações atualizadas.`);
      carregar(hoje);
      router.refresh();
    } catch {
      setErro("Não foi possível salvar a chamada. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  async function acaoNaAula(aula: TurmaParaChamada["aulas"][number], acao: "excluir" | "data") {
    setErro(null);
    setSucesso(null);
    let resposta: Response | null = null;
    if (acao === "excluir") {
      if (!window.confirm(`Excluir a ${aula.numero}ª aula de ${formatarDataCurta(aula.data)}? As presenças dela são apagadas e a frequência é recalculada.`)) return;
      resposta = await fetch(`/api/aulas/${aula.id}`, { method: "DELETE" }).catch(() => null);
    } else {
      const nova = window.prompt("Nova data da aula (AAAA-MM-DD):", aula.data);
      if (!nova || nova === aula.data) return;
      resposta = await fetch(`/api/aulas/${aula.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: nova }) }).catch(() => null);
    }
    const retorno = resposta ? await resposta.json().catch(() => ({})) : {};
    if (!resposta?.ok) {
      setErro(retorno.campos?.data ?? retorno.erro ?? "Não foi possível alterar a aula.");
      return;
    }
    setSucesso(acao === "excluir" ? "Aula excluída. Frequências recalculadas." : `Aula movida para ${formatarDataCurta(retorno.data)}.`);
    router.refresh();
  }

  if (turmas.length === 0) return <EstadoVazio>Você não leciona nenhuma turma de período aberto.</EstadoVazio>;

  // Presenças de cada estudante nas aulas registradas (falta abonada conta como presença, RB-31).
  const contagem = (id: string) => {
    const constou = aulas.filter((a) => a.presencas.some((p) => p.estudanteId === id));
    return { aulas: constou.length, presencas: constou.filter((a) => a.presencas.some((p) => p.estudanteId === id && p.presente) || abonada(id, a.data)).length };
  };
  const resumoDaAula = (i: number) => {
    const ab = estudantes.filter((e) => abonada(e.id, data)).length;
    const faltas = estudantes.filter((e) => !abonada(e.id, data) && !presente(e.id, i)).length;
    return `${i + 1}ª aula: ${estudantes.length - faltas - ab} presente(s), ${faltas} falta(s)${ab ? `, ${ab} abonada(s)` : ""}`;
  };

  return (
    <div className="space-y-5">
      <Cartao>
        <label htmlFor="turma" className={CLASSE_ROTULO}>Turma</label>
        <select
          id="turma"
          value={turmaId}
          onChange={(e) => { const t = turmas.find((x) => x.id === e.target.value); setTurmaId(e.target.value); carregar(hoje, t); setSucesso(null); }}
          className={`${CLASSE_CAMPO} sm:max-w-md`}
        >
          {turmas.map((t) => <option key={t.id} value={t.id}>{t.rotulo}</option>)}
        </select>
      </Cartao>

      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
      {sucesso && <Mensagem tipo="sucesso">{sucesso}</Mensagem>}

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_1.15fr]">
        <div className="space-y-5">
          <Cartao titulo={`Estudantes (${estudantes.length})`}>
            {estudantes.length === 0 ? (
              <EstadoVazio>Nenhum estudante cursando esta turma.</EstadoVazio>
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
                  {estudantes.map((e) => {
                    const c = contagem(e.id);
                    return (
                      <tr key={e.id} className="border-t border-traco">
                        <td data-rotulo="Estudante" className="px-2 py-3">{e.nome}{e.matricula && <span className="block text-xs text-mudo">{e.matricula}</span>}</td>
                        <td data-rotulo="Presenças" className="px-2 py-3 text-right tabular-nums">{c.aulas === 0 ? "—" : `${c.presencas} de ${c.aulas}`}</td>
                        <td data-rotulo="Frequência" className={`px-2 py-3 text-right tabular-nums ${e.percentual === null ? "text-mudo" : `font-semibold ${corDaFrequencia(e.percentual)}`}`}>
                          {e.percentual === null ? "—" : formatarPercentual(e.percentual)}
                        </td>
                        <td data-rotulo="Situação" className="px-2 py-3 pl-3">{e.situacao ? <SeloSituacao situacao={e.situacao} /> : <span className="text-mudo">—</span>}</td>
                      </tr>
                    );
                  })}
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
                    <th className="pb-2.5">Aula</th>
                    <th className="pb-2.5 text-right">Presentes</th>
                    <th className="pb-2.5"><span className="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody>
                  {aulas.map((a) => (
                    <tr key={a.id} className={`border-t border-traco ${a.data === data && corrigindo ? "bg-azul-suave" : ""}`}>
                      <td data-rotulo="Data" className="px-2 py-3">{formatarDataCurta(a.data)}</td>
                      <td data-rotulo="Aula" className="px-2 py-3">{a.numero}ª</td>
                      <td data-rotulo="Presentes" className="px-2 py-3 text-right tabular-nums">{a.presencas.filter((p) => p.presente).length} de {a.presencas.length}</td>
                      <td className="px-2 py-3 text-right">
                        <span className="inline-flex flex-wrap justify-end gap-3 text-sm">
                          <button type="button" onClick={() => { carregar(a.data); setSucesso(null); }} className="font-medium text-azul hover:underline">Corrigir</button>
                          <button type="button" onClick={() => acaoNaAula(a, "data")} className="font-medium text-azul hover:underline">Mudar data</button>
                          <button type="button" onClick={() => acaoNaAula(a, "excluir")} className="font-medium text-risco hover:underline">Excluir</button>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {aulas.length > 0 && <p className="mt-3 text-xs text-mudo">Excluir uma aula apaga as presenças dela e recalcula a frequência.</p>}
          </Cartao>
        </div>

        <Cartao titulo={corrigindo ? `Chamada de ${formatarDataCurta(data)} · corrigir ou acrescentar aulas` : "Nova chamada"}>
          {estudantes.length === 0 ? (
            <p className="text-sm text-mudo">Matricule estudantes na turma para fazer a chamada.</p>
          ) : (
            <form onSubmit={salvar} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="data" className={CLASSE_ROTULO}>Data</label>
                  <input id="data" type="date" max={hoje} value={data} onChange={(e) => carregar(e.target.value)} aria-invalid={Boolean(errosCampo.data)} className={CLASSE_CAMPO} />
                  <ErroCampo mensagem={errosCampo.data} />
                </div>
                <div>
                  <label htmlFor="quantidade" className={CLASSE_ROTULO}>Aulas nesta data</label>
                  <select id="quantidade" value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} className={CLASSE_CAMPO}>
                    {NUMEROS.filter((n) => n >= registradas).map((n) => <option key={n} value={n}>{n} aula{n > 1 ? "s" : ""}</option>)}
                  </select>
                  <ErroCampo mensagem={errosCampo.aulas} />
                </div>
              </div>
              <p className="text-sm text-mudo">Todos começam presentes. Desmarcar na 1ª aula desmarca as seguintes; depois dá para mudar cada uma.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-[15px]">
                  <thead>
                    <tr className="text-xs font-semibold tracking-wide text-mudo uppercase">
                      <th className="pb-2 text-left">Estudante</th>
                      {Array.from({ length: quantidade }, (_, i) => <th key={i} className="pb-2 text-center">{i + 1}ª aula</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {estudantes.map((e) => (
                      <tr key={e.id} className="border-t border-traco">
                        <td className="py-2.5 pr-2">{e.nome}</td>
                        {Array.from({ length: quantidade }, (_, i) => (
                          <td key={i} className="py-2.5 text-center">
                            {abonada(e.id, data) ? (
                              <span className="rounded-full bg-info-fundo px-2 py-0.5 text-xs font-semibold text-info">Abonada</span>
                            ) : (
                              <input
                                type="checkbox"
                                aria-label={`${e.nome}: presença na ${i + 1}ª aula`}
                                checked={presente(e.id, i)}
                                onChange={(ev) => marcar(e.id, i, ev.target.checked)}
                                className="h-5 w-5 accent-azul"
                              />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ErroCampo mensagem={errosCampo.presencas} />
              <p className="rounded-[10px] bg-info-fundo px-3 py-2.5 text-sm text-info">{Array.from({ length: quantidade }, (_, i) => resumoDaAula(i)).join(" · ")}</p>
              <button type="submit" disabled={enviando} className={`w-full ${CLASSE_BOTAO_PRIMARIO}`}>
                {enviando ? "Salvando..." : corrigindo ? "Salvar chamada" : "Registrar chamada"}
              </button>
              {corrigindo && (
                <button type="button" onClick={() => carregar(hoje)} className={`w-full ${CLASSE_BOTAO_SECUNDARIO}`}>Nova chamada (hoje)</button>
              )}
            </form>
          )}
          {estudantes.length > 0 && <p className="mt-3 text-xs text-mudo">Abaixo de 75% de frequência a situação vira Risco.</p>}
        </Cartao>
      </div>
    </div>
  );
}
