"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CLASSE_BOTAO_PRIMARIO, CLASSE_CAMPO, CLASSE_ROTULO, Mensagem } from "@/components/ui";

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
    <form onSubmit={enviar} className="mt-7 space-y-4" noValidate>
      <div>
        <label htmlFor="email" className={CLASSE_ROTULO}>E-mail</label>
        <input id="email" name="email" type="email" autoComplete="username" required className={CLASSE_CAMPO} />
      </div>
      <div>
        <label htmlFor="senha" className={CLASSE_ROTULO}>Senha</label>
        <input id="senha" name="senha" type="password" autoComplete="current-password" required className={CLASSE_CAMPO} />
      </div>
      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
      <button
        type="submit"
        disabled={enviando}
        className={`w-full ${CLASSE_BOTAO_PRIMARIO}`}
      >
        {enviando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
