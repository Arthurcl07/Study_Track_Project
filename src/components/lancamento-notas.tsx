"use client";

// Tela do professor (SPEC-004, UC-03): escolher turma, avaliação e estudante e lançar ou alterar a nota.
// Também cadastra avaliação na turma escolhida (OPEN-017). Toda validação vale no servidor; aqui só
// mostramos a mensagem de correção que a API devolve (AC-004-02).
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export type TurmaParaLancamento = {
  id: string;
  rotulo: string;
  avaliacoes: { id: string; nome: string; peso: number; data: string; notas: { id: string; estudanteId: string; valor: number }[] }[];
  estudantes: { id: string; nome: string }[];
};

const CLASSE_CAMPO =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";
const CLASSE_BOTAO =
  "w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-60 sm:w-auto";

type Retorno = { erro: string | null; campos: Record<string, string>; sucesso: string | null };
const SEM_RETORNO: Retorno = { erro: null, campos: {}, sucesso: null };

async function enviar(url: string, metodo: "POST" | "PATCH", corpo: unknown): Promise<Retorno & { ok: boolean }> {
  try {
    const resposta = await fetch(url, { method: metodo, headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
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
      {retorno.erro && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{retorno.erro}</p>}
      {retorno.sucesso && <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{retorno.sucesso}</p>}
    </>
  );
}

function ErroCampo({ mensagem }: { mensagem?: string }) {
  return mensagem ? <p className="mt-1 text-sm text-red-700">{mensagem}</p> : null;
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

  const turma = turmas.find((t) => t.id === turmaId);
  const avaliacao = turma?.avaliacoes.find((a) => a.id === avaliacaoId);
  const notaAtual = avaliacao?.notas.find((n) => n.estudanteId === estudanteId);

  function trocarTurma(id: string) {
    setTurmaId(id);
    setAvaliacaoId("");
    setEstudanteId("");
    setValor("");
    setRetornoNota(SEM_RETORNO);
    setRetornoAvaliacao(SEM_RETORNO);
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
    setRetornoAvaliacao({ ...SEM_RETORNO, sucesso: "Avaliação cadastrada." });
    router.refresh();
  }

  if (turmas.length === 0) return <p className="text-slate-600">Você ainda não leciona nenhuma turma.</p>;

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="turma" className="block text-sm font-medium">Turma</label>
        <select id="turma" value={turmaId} onChange={(e) => trocarTurma(e.target.value)} className={CLASSE_CAMPO}>
          {turmas.map((t) => <option key={t.id} value={t.id}>{t.rotulo}</option>)}
        </select>
      </div>

      <form onSubmit={salvarNota} className="space-y-3 rounded-xl border border-slate-200 p-4" noValidate>
        <h3 className="font-semibold">Lançar ou alterar nota</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="avaliacao" className="block text-sm font-medium">Avaliação</label>
            <select id="avaliacao" value={avaliacaoId} onChange={(e) => { setAvaliacaoId(e.target.value); setRetornoNota(SEM_RETORNO); }} className={CLASSE_CAMPO}>
              <option value="">Selecione...</option>
              {turma?.avaliacoes.map((a) => (
                <option key={a.id} value={a.id}>{a.nome} (peso {a.peso})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="estudante" className="block text-sm font-medium">Estudante</label>
            <select id="estudante" value={estudanteId} onChange={(e) => { setEstudanteId(e.target.value); setRetornoNota(SEM_RETORNO); }} className={CLASSE_CAMPO}>
              <option value="">Selecione...</option>
              {turma?.estudantes.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>
          </div>
        </div>
        {turma && turma.avaliacoes.length === 0 && (
          <p className="text-sm text-slate-600">Esta turma ainda não tem avaliações. Cadastre uma abaixo.</p>
        )}
        <ErroCampo mensagem={retornoNota.campos.selecao} />
        {avaliacao && estudanteId && (
          <p className="text-sm text-slate-700">
            {notaAtual ? `Nota atual: ${notaAtual.valor}. O novo valor vai sobrescrevê-la.` : "Ainda sem nota nesta avaliação."}
          </p>
        )}
        <div>
          <label htmlFor="valor" className="block text-sm font-medium">Nota (0 a 10)</label>
          <input id="valor" name="valor" inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} className={CLASSE_CAMPO} />
          <ErroCampo mensagem={retornoNota.campos.valor} />
        </div>
        <Mensagens retorno={retornoNota} />
        <button type="submit" disabled={enviando || !avaliacaoId || !estudanteId} className={CLASSE_BOTAO}>
          {enviando ? "Salvando..." : notaAtual ? "Alterar nota" : "Lançar nota"}
        </button>
      </form>

      <form onSubmit={salvarAvaliacao} className="space-y-3 rounded-xl border border-slate-200 p-4" noValidate>
        <h3 className="font-semibold">Nova avaliação nesta turma</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="nome-avaliacao" className="block text-sm font-medium">Nome</label>
            <input id="nome-avaliacao" name="nome" className={CLASSE_CAMPO} />
            <ErroCampo mensagem={retornoAvaliacao.campos.nome} />
          </div>
          <div>
            <label htmlFor="peso-avaliacao" className="block text-sm font-medium">Peso (maior que zero)</label>
            <input id="peso-avaliacao" name="peso" inputMode="decimal" className={CLASSE_CAMPO} />
            <ErroCampo mensagem={retornoAvaliacao.campos.peso} />
          </div>
          <div>
            <label htmlFor="data-avaliacao" className="block text-sm font-medium">Data</label>
            <input id="data-avaliacao" name="data" type="date" className={CLASSE_CAMPO} />
            <ErroCampo mensagem={retornoAvaliacao.campos.data} />
          </div>
        </div>
        <Mensagens retorno={retornoAvaliacao} />
        <button type="submit" disabled={enviando} className={CLASSE_BOTAO}>
          {enviando ? "Salvando..." : "Cadastrar avaliação"}
        </button>
      </form>
    </div>
  );
}
