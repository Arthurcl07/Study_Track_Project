"use client";

// Editar e excluir disciplina da grade (SPEC-026, AC-026-10/11). Disciplina compartilhada com curso de outra
// coordenação ou com turma: o servidor recusa e explica (RB-32).
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO, CLASSE_CAMPO, CLASSE_ROTULO, ErroCampo } from "./ui";

export function AcoesDisciplina({ id, nome, cargaHoraria }: { id: string; nome: string; cargaHoraria: number }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});

  async function chamar(metodo: "PATCH" | "DELETE", corpo?: unknown) {
    setEnviando(true);
    setErro(null);
    setErros({});
    const resposta = await fetch(`/api/disciplinas/${id}`, { method: metodo, headers: { "Content-Type": "application/json" }, body: corpo ? JSON.stringify(corpo) : undefined }).catch(() => null);
    const retorno = resposta ? await resposta.json().catch(() => ({})) : {};
    setEnviando(false);
    if (!resposta?.ok) {
      setErro(retorno.erro ?? "Não foi possível salvar.");
      setErros(retorno.campos ?? {});
      return false;
    }
    router.refresh();
    return true;
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (await chamar("PATCH", Object.fromEntries(new FormData(evento.currentTarget)))) setEditando(false);
  }

  if (editando) {
    return (
      <form onSubmit={salvar} noValidate className="mt-2 space-y-3 rounded-xl border border-azul-suave bg-nevoa p-3 text-left">
        <div>
          <label htmlFor={`nome-${id}`} className={CLASSE_ROTULO}>Nome</label>
          <input id={`nome-${id}`} name="nome" defaultValue={nome} className={CLASSE_CAMPO} />
          <ErroCampo mensagem={erros.nome} />
        </div>
        <div>
          <label htmlFor={`carga-${id}`} className={CLASSE_ROTULO}>Carga horária (horas)</label>
          <input id={`carga-${id}`} name="cargaHoraria" inputMode="numeric" defaultValue={cargaHoraria} className={CLASSE_CAMPO} />
          <ErroCampo mensagem={erros.cargaHoraria} />
        </div>
        {erro && Object.keys(erros).length === 0 && <p role="alert" className="text-sm text-risco">{erro}</p>}
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={enviando} className={CLASSE_BOTAO_PRIMARIO}>Salvar</button>
          <button type="button" onClick={() => { setEditando(false); setErro(null); }} className={CLASSE_BOTAO_SECUNDARIO}>Cancelar</button>
        </div>
      </form>
    );
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <span className="flex gap-3 text-sm">
        <button type="button" onClick={() => setEditando(true)} className="font-medium text-azul hover:underline">Editar</button>
        <button
          type="button"
          disabled={enviando}
          onClick={() => window.confirm(`Excluir ${nome}? Ela sai da grade dos cursos.`) && chamar("DELETE")}
          className="font-medium text-risco hover:underline disabled:opacity-60"
        >
          Excluir
        </button>
      </span>
      {erro && <span role="alert" className="max-w-64 text-left text-xs text-risco">{erro}</span>}
    </span>
  );
}
