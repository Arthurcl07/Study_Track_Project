"use client";

// SPEC-045 / RB-43: aceite dos termos (caixa de confirmação + Aceitar e continuar) e botão de baixar os próprios dados.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CLASSE_BOTAO_PRIMARIO, CLASSE_LINK, Mensagem } from "./ui";

export function AceiteTermos({ versao }: { versao: string }) {
  const router = useRouter();
  const [marcado, setMarcado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function aceitar() {
    setEnviando(true);
    setErro(null);
    try {
      const resposta = await fetch("/api/termos/aceite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ versao }) });
      const corpo = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(corpo.erro ?? "Não foi possível registrar o aceite.");
        return;
      }
      router.replace(corpo.destino);
      router.refresh();
    } catch {
      setErro("Não foi possível registrar o aceite.");
    } finally {
      setEnviando(false);
    }
  }

  async function sair() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="mt-4 space-y-4">
      <label className="flex items-start gap-2.5 text-sm">
        <input type="checkbox" checked={marcado} onChange={(e) => setMarcado(e.target.checked)} className="mt-0.5 h-4 w-4 accent-azul" />
        <span>Li e aceito os Termos de uso e a Política de privacidade.</span>
      </label>
      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={sair} className={CLASSE_LINK}>Sair</button>
        <button type="button" onClick={aceitar} disabled={!marcado || enviando} className={CLASSE_BOTAO_PRIMARIO}>
          {enviando ? "Registrando..." : "Aceitar e continuar"}
        </button>
      </div>
    </div>
  );
}

export function BaixarMeusDados() {
  return (
    <a href="/api/meus-dados" download className={`w-full ${CLASSE_BOTAO_PRIMARIO}`}>
      ⬇ Baixar meus dados (JSON)
    </a>
  );
}
