"use client";

// SPEC-027: envia o pedido e mostra sempre a mesma mensagem (INV-027-01).
import { useState, type FormEvent } from "react";
import { CLASSE_BOTAO_PRIMARIO, CLASSE_CAMPO, CLASSE_ROTULO, ErroCampo, Mensagem } from "@/components/ui";

export function FormularioEsqueci() {
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const email = new FormData(evento.currentTarget).get("email");
    setEnviando(true);
    setErro(null);
    setMensagem(null);
    try {
      const resposta = await fetch("/api/auth/esqueci", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const corpo = await resposta.json().catch(() => ({}));
      if (!resposta.ok) setErro(corpo.campos?.email ?? corpo.erro ?? "Não foi possível enviar o pedido.");
      else setMensagem(corpo.mensagem);
    } catch {
      setErro("Não foi possível enviar o pedido. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="mt-7 space-y-4" noValidate>
      <div>
        <label htmlFor="email" className={CLASSE_ROTULO}>E-mail</label>
        <input id="email" name="email" type="email" autoComplete="username" required aria-invalid={Boolean(erro)} className={CLASSE_CAMPO} />
        <ErroCampo mensagem={erro ?? undefined} />
      </div>
      {mensagem && <Mensagem tipo="sucesso">{mensagem}</Mensagem>}
      <button type="submit" disabled={enviando} className={`w-full ${CLASSE_BOTAO_PRIMARIO}`}>
        {enviando ? "Enviando..." : "Enviar pedido"}
      </button>
    </form>
  );
}
