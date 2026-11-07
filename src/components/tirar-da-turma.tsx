"use client";

// Tirar da turma quem foi matriculado por engano (SPEC-026, AC-026-08/09). Com nota, presença, entrega ou plano o
// servidor recusa e explica (RB-32); trancamento e cancelamento são da secretaria (SPEC-031).
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TirarDaTurma({ turmaId, estudanteId, nome }: { turmaId: string; estudanteId: string; nome: string }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function tirar() {
    if (!window.confirm(`Tirar ${nome} da turma? Use só para matrícula feita por engano.`)) return;
    setEnviando(true);
    setErro(null);
    const resposta = await fetch(`/api/turmas/${turmaId}/matriculas/${estudanteId}`, { method: "DELETE" }).catch(() => null);
    const retorno = resposta ? await resposta.json().catch(() => ({})) : {};
    setEnviando(false);
    if (!resposta?.ok) {
      setErro(retorno.erro ?? "Não foi possível tirar da turma.");
      return;
    }
    router.refresh();
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button type="button" onClick={tirar} disabled={enviando} className="text-sm font-medium whitespace-nowrap text-risco hover:underline disabled:opacity-60">
        {enviando ? "Saindo..." : "Tirar da turma"}
      </button>
      {erro && <span role="alert" className="max-w-56 text-left text-xs text-risco">{erro}</span>}
    </span>
  );
}
