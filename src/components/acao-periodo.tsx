"use client";

// Encerrar ou reabrir um período letivo (SPEC-017, RF-26). A confirmação explica a trava (RB-20); a regra
// vale no servidor, aqui só se mostra o resultado.
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AcaoPeriodo({ id, nome, aberto, turmas }: { id: string; nome: string; aberto: boolean; turmas: number }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function alternar() {
    const pergunta = aberto
      ? `Encerrar ${nome}? As ${turmas} turma(s) dele ficam somente leitura: ninguém lança nota, chamada, atividade, entrega ou plano.`
      : `Reabrir ${nome}? As turmas dele voltam a aceitar lançamentos.`;
    if (!window.confirm(pergunta)) return;
    setEnviando(true);
    setErro(null);
    const resposta = await fetch(`/api/periodos/${id}/${aberto ? "encerrar" : "reabrir"}`, { method: "POST" }).catch(() => null);
    setEnviando(false);
    if (!resposta?.ok) {
      setErro("Não foi possível alterar o período.");
      return;
    }
    router.refresh();
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button type="button" onClick={alternar} disabled={enviando} className="font-medium text-azul hover:text-azul-escuro hover:underline disabled:opacity-60">
        {enviando ? "Salvando..." : aberto ? "Encerrar" : "Reabrir"}
      </button>
      {erro && <span role="alert" className="text-xs text-risco">{erro}</span>}
    </span>
  );
}
