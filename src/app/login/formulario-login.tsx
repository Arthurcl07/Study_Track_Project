"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const CLASSE_CAMPO =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

export function FormularioLogin() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    setErro(null);
    setEnviando(true);
    try {
      const resposta = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: dados.get("email"), senha: dados.get("senha") }),
      });
      const corpo = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(corpo.erro ?? "Não foi possível entrar. Tente novamente.");
        return;
      }
      router.replace(corpo.destino);
      router.refresh();
    } catch {
      setErro("Não foi possível entrar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="mt-6 space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="block text-sm font-medium">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="username" required className={CLASSE_CAMPO} />
      </div>
      <div>
        <label htmlFor="senha" className="block text-sm font-medium">Senha</label>
        <input id="senha" name="senha" type="password" autoComplete="current-password" required className={CLASSE_CAMPO} />
      </div>
      {erro && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {enviando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
