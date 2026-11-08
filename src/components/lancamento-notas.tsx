"use client";

// Tela do professor (SPEC-004, UC-03): escolher turma, avaliação e estudante e lançar ou alterar a nota.
// Também cadastra avaliação na turma escolhida (OPEN-017). Toda validação vale no servidor; aqui só
// mostramos a mensagem de correção que a API devolve (AC-004-02).
// Layout aprovado em docs/layout/prototipo.html#professor-notas.
// SPEC-026/029: tipo da avaliação; editar e excluir avaliação; no exame final só aparecem os estudantes em exame
// (média < 6,0 e frequência ≥ 75%, RB-29), com a nota final (#correcao-avaliacao e #avaliacao-tipos).
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ROTULO_TIPO, TIPOS_AVALIACAO, temPeso, type TipoAvaliacao } from "@/domain/registro-notas";
import { elegivelAoExame, notaFinalComExame } from "@/domain/situacao-academica";
import {
  Cartao,
  CLASSE_BOTAO_PRIMARIO,
  CLASSE_BOTAO_SECUNDARIO,
  CLASSE_CAMPO,
  CLASSE_ROTULO,
  ErroCampo,
  EstadoVazio,
  Mensagem,
} from "./ui";

export type TurmaParaLancamento = {
  id: string;
  rotulo: string;
  diario: "Aberto" | "Fechado" | "Homologado";
  avaliacoes: { id: string; nome: string; peso: number; data: string; tipo: TipoAvaliacao; notas: { id: string; estudanteId: string; valor: number }[] }[];
  estudantes: { id: string; nome: string; matricula: string | null; media: number | null; frequencia: number | null }[];
};

type Retorno = { erro: string | null; campos: Record<string, string>; sucesso: string | null };
const SEM_RETORNO: Retorno = { erro: null, campos: {}, sucesso: null };

const formatarNota = (valor: number) => valor.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
const formatarData = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" });

const descreverAvaliacao = (a: { tipo: TipoAvaliacao; peso: number }) => (temPeso(a.tipo) ? `${ROTULO_TIPO[a.tipo]}, peso ${formatarNota(a.peso)}` : ROTULO_TIPO[a.tipo]);

async function enviar(url: string, metodo: "POST" | "PATCH" | "DELETE", corpo?: unknown): Promise<Retorno & { ok: boolean }> {
  try {
    const resposta = await fetch(url, { method: metodo, headers: { "Content-Type": "application/json" }, body: corpo === undefined ? undefined : JSON.stringify(corpo) });
    const retorno = await resposta.json().catch(() => ({}));
    if (!resposta.ok) return { ok: false, erro: retorno.erro ?? "Não foi possível salvar.", campos: retorno.campos ?? {}, sucesso: null };
    return { ok: true, ...SEM_RETORNO };
  } catch {
    return { ok: false, erro: "Não foi possível salvar. Tente novamente.", campos: {}, sucesso: null };
  }
}

function Mensagens({ retorno }: { retorno: Retorno }) {
  return (
    <>
      {retorno.erro && <Mensagem tipo="erro">{retorno.erro}</Mensagem>}
      {retorno.sucesso && <Mensagem tipo="sucesso">{retorno.sucesso}</Mensagem>}
    </>
  );
}

export function LancamentoNotas({ turmas }: { turmas: TurmaParaLancamento[] }) {
  const router = useRouter();
  const [turmaId, setTurmaId] = useState(turmas[0]?.id ?? "");
  const [avaliacaoId, setAvaliacaoId] = useState("");
  const [estudanteId, setEstudanteId] = useState("");
  const [valor, setValor] = useState("");
  const [retornoNota, setRetornoNota] = useState<Retorno>(SEM_RETORNO);
  const [retornoAvaliacao, setRetornoAvaliacao] = useState<Retorno>(SEM_RETORNO);
  const [enviando, setEnviando] = useState(false);
  const [tipoNova, setTipoNova] = useState<TipoAvaliacao>("Prova");
  const [editando, setEditando] = useState<string | null>(null);
  const [tipoEdicao, setTipoEdicao] = useState<TipoAvaliacao>("Prova");
  const [retornoEdicao, setRetornoEdicao] = useState<Retorno>(SEM_RETORNO);

  const turma = turmas.find((t) => t.id === turmaId);
  const avaliacao = turma?.avaliacoes.find((a) => a.id === avaliacaoId);
  const estudante = turma?.estudantes.find((e) => e.id === estudanteId);
  const notaAtual = avaliacao?.notas.find((n) => n.estudanteId === estudanteId);

  function trocarTurma(id: string) {
    setTurmaId(id);
    setAvaliacaoId("");
    setEstudanteId("");
    setValor("");
    setRetornoNota(SEM_RETORNO);
    setRetornoAvaliacao(SEM_RETORNO);
  }

  function escolherEstudante(id: string) {
    setEstudanteId(id);
    setValor("");
    setRetornoNota(SEM_RETORNO);
  }

  async function salvarNota(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);
    setRetornoNota(SEM_RETORNO);
    const resultado = notaAtual
      ? await enviar(`/api/notas/${notaAtual.id}`, "PATCH", { valor })
      : await enviar("/api/notas", "POST", { turmaId, avaliacaoId, estudanteId, valor });
    setEnviando(false);
    if (!resultado.ok) return setRetornoNota(resultado);
    setRetornoNota({ ...SEM_RETORNO, sucesso: notaAtual ? "Nota alterada. Média e situação atualizadas." : "Nota lançada. Média e situação atualizadas." });
    setValor("");
    router.refresh();
  }

  async function salvarAvaliacao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    setEnviando(true);
    setRetornoAvaliacao(SEM_RETORNO);
    const resultado = await enviar(`/api/turmas/${turmaId}/avaliacoes`, "POST", Object.fromEntries(new FormData(formulario)));
    setEnviando(false);
    if (!resultado.ok) return setRetornoAvaliacao(resultado);
    formulario.reset();
    setTipoNova("Prova");
    setRetornoAvaliacao({ ...SEM_RETORNO, sucesso: "Avaliação cadastrada." });
    router.refresh();
  }

  // SPEC-026 (AC-026-03): mudar peso ou tipo recalcula a média da turma no servidor.
  async function salvarEdicao(evento: FormEvent<HTMLFormElement>, id: string) {
    evento.preventDefault();
    setEnviando(true);
    const resultado = await enviar(`/api/avaliacoes/${id}`, "PATCH", Object.fromEntries(new FormData(evento.currentTarget)));
    setEnviando(false);
    if (!resultado.ok) return setRetornoEdicao(resultado);
    setEditando(null);
    setRetornoEdicao({ ...SEM_RETORNO, sucesso: "Avaliação alterada. Médias e situações recalculadas." });
    router.refresh();
  }

  // SPEC-026 (AC-026-04/05): só sem nota; com nota o servidor explica o motivo.
  async function excluirAvaliacao(a: TurmaParaLancamento["avaliacoes"][number]) {
    if (!window.confirm(`Excluir "${a.nome}"? A exclusão fica registrada na auditoria.`)) return;
    setEnviando(true);
    const resultado = await enviar(`/api/avaliacoes/${a.id}`, "DELETE");
    setEnviando(false);
    if (!resultado.ok) return setRetornoEdicao(resultado);
    if (avaliacaoId === a.id) setAvaliacaoId("");
    setRetornoEdicao({ ...SEM_RETORNO, sucesso: `"${a.nome}" excluída.` });
    router.refresh();
  }

  if (turmas.length === 0) return <EstadoVazio>Você ainda não leciona nenhuma turma.</EstadoVazio>;

  return (
    <div className="space-y-5">
      {turma && turma.diario !== "Aberto" && <Mensagem tipo="info">O diário desta turma está {turma.diario === "Fechado" ? "fechado, aguardando a homologação da coordenação" : "homologado"}: a turma está somente leitura. Só a coordenação devolve ou reabre o diário.</Mensagem>}
      <Cartao>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="turma" className={CLASSE_ROTULO}>Turma</label>
            <select id="turma" value={turmaId} onChange={(e) => trocarTurma(e.target.value)} className={CLASSE_CAMPO}>
              {turmas.map((t) => <option key={t.id} value={t.id}>{t.rotulo}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="avaliacao" className={CLASSE_ROTULO}>Avaliação</label>
            <select
              id="avaliacao"
              value={avaliacaoId}
              onChange={(e) => { setAvaliacaoId(e.target.value); setRetornoNota(SEM_RETORNO); }}
              className={CLASSE_CAMPO}
            >
              <option value="">Selecione...</option>
              {turma?.avaliacoes.map((a) => (
                <option key={a.id} value={a.id}>{a.nome} ({descreverAvaliacao(a)})</option>
              ))}
            </select>
          </div>
        </div>
      </Cartao>

      <div className="grid items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Cartao titulo={avaliacao ? `${avaliacao.nome} · ${descreverAvaliacao(avaliacao)} · ${formatarData(avaliacao.data)}` : "Notas da avaliação"}>
          {avaliacao?.tipo === "Exame" && (
            <p className="mb-3 text-sm text-mudo">Só aparecem os estudantes em exame: média menor que 6,0 e frequência de pelo menos 75%. Nota final = (média + exame) ÷ 2; aprovado com 5,0.</p>
          )}
          {avaliacao?.tipo === "Substitutiva" && (
            <p className="mb-3 text-sm text-mudo">A nota da substitutiva troca a menor prova de cada estudante (prova sem nota conta como zero), se isso aumentar a média.</p>
          )}
          {!turma || turma.avaliacoes.length === 0 ? (
            <EstadoVazio>Esta turma ainda não tem avaliações. Cadastre uma ao lado.</EstadoVazio>
          ) : !avaliacao ? (
            <EstadoVazio>Escolha uma avaliação para ver as notas dos estudantes.</EstadoVazio>
          ) : turma.estudantes.length === 0 ? (
            <EstadoVazio>Nenhum estudante matriculado nesta turma.</EstadoVazio>
          ) : (
            <table className="tabela-responsiva w-full text-[15px]">
              <thead>
                <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                  <th className="pb-2.5">Estudante</th>
                  <th className="pb-2.5 text-right">Nota</th>
                  <th className="pb-2.5"><span className="sr-only">Ação</span></th>
                </tr>
              </thead>
              <tbody>
                {turma.estudantes.filter((e) => avaliacao.tipo !== "Exame" || elegivelAoExame(e.media, e.frequencia) || avaliacao.notas.some((n) => n.estudanteId === e.id)).map((e) => {
                  const nota = avaliacao.notas.find((n) => n.estudanteId === e.id);
                  const selecionado = e.id === estudanteId;
                  return (
                    <tr key={e.id} className={`border-t border-traco ${selecionado ? "bg-azul-suave" : ""}`}>
                      <td data-rotulo="Estudante" className="px-2 py-3">
                        {e.nome}
                        {e.matricula && <span className="block text-xs text-mudo">{e.matricula}</span>}
                        {avaliacao.tipo === "Exame" && e.media !== null && (
                          <span className="block text-xs text-mudo">média {formatarNota(e.media)}{nota ? ` · nota final ${formatarNota(notaFinalComExame(e.media, nota.valor))}` : ""}</span>
                        )}
                      </td>
                      <td data-rotulo="Nota" className={`px-2 py-3 text-right tabular-nums ${nota ? "" : "text-mudo"}`}>
                        {nota ? formatarNota(nota.valor) : "—"}
                      </td>
                      <td className="px-2 py-3 text-right">
                        <button type="button" onClick={() => escolherEstudante(e.id)} className="font-medium text-azul hover:underline">
                          {nota ? "Alterar" : "Lançar"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Cartao>

        <div className="space-y-5">
          <Cartao titulo={estudante ? `${notaAtual ? "Alterar nota" : "Lançar nota"} · ${estudante.nome}` : "Lançar ou alterar nota"}>
            {!avaliacao || !estudante ? (
              <p className="text-sm text-mudo">Escolha a avaliação e clique em um estudante na tabela.</p>
            ) : (
              <form onSubmit={salvarNota} className="space-y-4" noValidate>
                <p className="text-sm text-mudo">
                  {notaAtual ? `Nota atual: ${formatarNota(notaAtual.valor)}. O novo valor vai sobrescrevê-la.` : "Ainda sem nota nesta avaliação."}
                </p>
                <div>
                  <label htmlFor="valor" className={CLASSE_ROTULO}>Nota (0 a 10)</label>
                  <input
                    id="valor"
                    name="valor"
                    inputMode="decimal"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    aria-invalid={Boolean(retornoNota.campos.valor)}
                    className={CLASSE_CAMPO}
                  />
                  <ErroCampo mensagem={retornoNota.campos.valor} />
                </div>
                <ErroCampo mensagem={retornoNota.campos.selecao} />
                <Mensagens retorno={retornoNota} />
                <button type="submit" disabled={enviando} className={`w-full ${CLASSE_BOTAO_PRIMARIO}`}>
                  {enviando ? "Salvando..." : notaAtual ? "Alterar nota" : "Lançar nota"}
                </button>
              </form>
            )}
            {(!avaliacao || !estudante) && <div className="mt-3"><Mensagens retorno={retornoNota} /></div>}
          </Cartao>

          <Cartao titulo="Nova avaliação nesta turma">
            <form onSubmit={salvarAvaliacao} className="space-y-4" noValidate>
              <div>
                <label htmlFor="nome-avaliacao" className={CLASSE_ROTULO}>Nome</label>
                <input id="nome-avaliacao" name="nome" aria-invalid={Boolean(retornoAvaliacao.campos.nome)} className={CLASSE_CAMPO} />
                <ErroCampo mensagem={retornoAvaliacao.campos.nome} />
              </div>
              <div>
                <label htmlFor="tipo-avaliacao" className={CLASSE_ROTULO}>Tipo</label>
                <select id="tipo-avaliacao" name="tipo" value={tipoNova} onChange={(e) => setTipoNova(e.target.value as TipoAvaliacao)} className={CLASSE_CAMPO}>
                  {TIPOS_AVALIACAO.map((t) => <option key={t} value={t}>{ROTULO_TIPO[t]}</option>)}
                </select>
                <ErroCampo mensagem={retornoAvaliacao.campos.tipo} />
              </div>
              {!temPeso(tipoNova) && <p className="text-sm text-mudo">Substitutiva e exame final não têm peso. Cada turma tem no máximo uma de cada.</p>}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {temPeso(tipoNova) && (
                  <div>
                    <label htmlFor="peso-avaliacao" className={CLASSE_ROTULO}>Peso (maior que zero)</label>
                    <input id="peso-avaliacao" name="peso" inputMode="decimal" aria-invalid={Boolean(retornoAvaliacao.campos.peso)} className={CLASSE_CAMPO} />
                    <ErroCampo mensagem={retornoAvaliacao.campos.peso} />
                  </div>
                )}
                <div>
                  <label htmlFor="data-avaliacao" className={CLASSE_ROTULO}>Data</label>
                  <input id="data-avaliacao" name="data" type="date" aria-invalid={Boolean(retornoAvaliacao.campos.data)} className={CLASSE_CAMPO} />
                  <ErroCampo mensagem={retornoAvaliacao.campos.data} />
                </div>
              </div>
              <Mensagens retorno={retornoAvaliacao} />
              <button type="submit" disabled={enviando} className={`w-full ${CLASSE_BOTAO_SECUNDARIO}`}>
                {enviando ? "Salvando..." : "Cadastrar avaliação"}
              </button>
            </form>
          </Cartao>

          {turma && turma.avaliacoes.length > 0 && (
            <Cartao titulo={`Avaliações da turma (${turma.avaliacoes.length})`}>
              <div className="mb-3"><Mensagens retorno={retornoEdicao} /></div>
              <ul className="space-y-2">
                {turma.avaliacoes.map((a) =>
                  editando === a.id ? (
                    <li key={a.id}>
                      <form onSubmit={(e) => salvarEdicao(e, a.id)} noValidate className="space-y-3 rounded-xl border border-azul-suave bg-nevoa p-3">
                        <div>
                          <label htmlFor={`nome-${a.id}`} className={CLASSE_ROTULO}>Nome</label>
                          <input id={`nome-${a.id}`} name="nome" defaultValue={a.nome} className={CLASSE_CAMPO} />
                          <ErroCampo mensagem={retornoEdicao.campos.nome} />
                        </div>
                        <div>
                          <label htmlFor={`tipo-${a.id}`} className={CLASSE_ROTULO}>Tipo</label>
                          <select id={`tipo-${a.id}`} name="tipo" value={tipoEdicao} onChange={(e) => setTipoEdicao(e.target.value as TipoAvaliacao)} className={CLASSE_CAMPO}>
                            {TIPOS_AVALIACAO.map((t) => <option key={t} value={t}>{ROTULO_TIPO[t]}</option>)}
                          </select>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {temPeso(tipoEdicao) && (
                            <div>
                              <label htmlFor={`peso-${a.id}`} className={CLASSE_ROTULO}>Peso</label>
                              <input id={`peso-${a.id}`} name="peso" inputMode="decimal" defaultValue={String(a.peso).replace(".", ",")} className={CLASSE_CAMPO} />
                              <ErroCampo mensagem={retornoEdicao.campos.peso} />
                            </div>
                          )}
                          <div>
                            <label htmlFor={`data-${a.id}`} className={CLASSE_ROTULO}>Data</label>
                            <input id={`data-${a.id}`} name="data" type="date" defaultValue={a.data.slice(0, 10)} className={CLASSE_CAMPO} />
                          </div>
                        </div>
                        {a.notas.length > 0 && temPeso(tipoEdicao) && <p className="text-xs text-mudo">Mudar o peso recalcula a média e a situação de {a.notas.length} estudante(s).</p>}
                        <div className="flex flex-wrap gap-2">
                          <button type="submit" disabled={enviando} className={CLASSE_BOTAO_PRIMARIO}>Salvar</button>
                          <button type="button" onClick={() => { setEditando(null); setRetornoEdicao(SEM_RETORNO); }} className={CLASSE_BOTAO_SECUNDARIO}>Cancelar</button>
                        </div>
                      </form>
                    </li>
                  ) : (
                    <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-traco pt-2 first:border-t-0 first:pt-0">
                      <span className="min-w-0">
                        <span className="font-medium">{a.nome}</span>
                        <span className="block text-xs text-mudo">{descreverAvaliacao(a)} · {formatarData(a.data)} · {a.notas.length} nota(s)</span>
                      </span>
                      <span className="flex gap-3 text-sm">
                        <button type="button" onClick={() => { setEditando(a.id); setTipoEdicao(a.tipo); setRetornoEdicao(SEM_RETORNO); }} className="font-medium text-azul hover:underline">Editar</button>
                        <button type="button" disabled={enviando} onClick={() => excluirAvaliacao(a)} className="font-medium text-risco hover:underline disabled:opacity-60" title={a.notas.length > 0 ? "Já tem notas" : undefined}>Excluir</button>
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </Cartao>
          )}
        </div>
      </div>
    </div>
  );
}
