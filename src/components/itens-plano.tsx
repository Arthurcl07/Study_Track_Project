"use client";

// Checklist do plano de recuperação (SPEC-008, RB-12, OPEN-003): o professor marca os itens concluídos
// e o progresso é recalculado no servidor. Plano encerrado fica só para leitura (INV-008-06).
// Layout aprovado em docs/layout/prototipo.html#professor-plano.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CLASSE_BOTAO_SECUNDARIO, Mensagem } from "./ui";

type Item = { id: string; descricao: string; concluido: boolean; concluidoEm: string | null };

const diaMes = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" });

export function ItensPlano({ itens, ativo }: { itens: Item[]; ativo: boolean }) {
  const router = useRouter();
  const [salvando, setSalvando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function alternar(item: Item) {
    setErro(null);
    setSalvando(item.id);
    try {
      const resposta = await fetch(`/api/planos/itens/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concluido: !item.concluido }),
      });
      if (!resposta.ok) {
        const retorno = await resposta.json().catch(() => ({}));
        setErro(retorno.erro ?? "Não foi possível atualizar o item.");
      }
      router.refresh();
    } catch {
      setErro("Não foi possível atualizar o item. Tente novamente.");
    } finally {
      setSalvando(null);
    }
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {itens.map((item) => (
          <li key={item.id}>
            <label
              className={`flex items-center gap-3 rounded-xl border border-traco px-3.5 py-3 ${ativo ? "cursor-pointer hover:bg-nevoa" : ""} ${item.concluido ? "bg-nevoa" : "bg-white"}`}
            >
              <input
                type="checkbox"
                checked={item.concluido}
                disabled={!ativo || salvando !== null}
                onChange={() => alternar(item)}
                className="h-4.5 w-4.5 shrink-0 accent-azul"
              />
              <span className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:gap-3">
                <span className={item.concluido ? "text-mudo line-through" : ""}>{item.descricao}</span>
                {item.concluido && item.concluidoEm && (
                  <small className="shrink-0 text-xs text-mudo sm:ml-auto">concluído em {diaMes(item.concluidoEm)}</small>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>
      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
    </div>
  );
}

export function EncerrarPlano({ planoId }: { planoId: string }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function encerrar() {
    if (!window.confirm("Encerrar este plano? Os itens não poderão mais ser alterados.")) return;
    setErro(null);
    setEnviando(true);
    try {
      const resposta = await fetch(`/api/planos/${planoId}/encerrar`, { method: "POST" });
      if (!resposta.ok) {
        const retorno = await resposta.json().catch(() => ({}));
        setErro(retorno.erro ?? "Não foi possível encerrar o plano.");
      }
      router.refresh();
    } catch {
      setErro("Não foi possível encerrar o plano. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button type="button" onClick={encerrar} disabled={enviando} className={CLASSE_BOTAO_SECUNDARIO}>
        {enviando ? "Encerrando..." : "Encerrar plano"}
      </button>
      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
    </div>
  );
}
