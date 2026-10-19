"use client";

// Formulário de troca de senha (SPEC-011, RF-18). Usado no primeiro acesso (senha provisória, RB-15)
// e em "Alterar minha senha". As regras valem no servidor; aqui só se mostram os erros devolvidos.
// Layout aprovado em docs/layout/prototipo.html#primeiro-acesso e #minha-senha.
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO, CLASSE_CAMPO, CLASSE_ROTULO, ErroCampo, Mensagem } from "./ui";

const CAMPOS = [
  { nome: "senhaAtual", rotulo: "Senha atual", autoComplete: "current-password" },
  { nome: "novaSenha", rotulo: "Nova senha (mínimo 8 caracteres)", autoComplete: "new-password" },
  { nome: "confirmacao", rotulo: "Confirme a nova senha", autoComplete: "new-password" },
] as const;

export function FormularioSenha({ primeiroAcesso = false }: { primeiroAcesso?: boolean }) {
  const router = useRouter();
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    setErros({});
    setErro(null);
    setSucesso(null);
    setEnviando(true);
    try {
      const resposta = await fetch("/api/auth/senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(formulario))),
      });
      const corpo = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErros(corpo.campos ?? {});
        setErro(corpo.campos ? null : (corpo.erro ?? "Não foi possível trocar a senha."));
        return;
      }
      formulario.reset();
      if (primeiroAcesso) {
        router.replace(corpo.destino);
        router.refresh();
      } else {
        setSucesso("Senha alterada. Use a nova senha no próximo login.");
      }
    } catch {
      setErro("Não foi possível trocar a senha. Tente novamente.");
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
    <form onSubmit={enviar} className="space-y-4" noValidate>
      {CAMPOS.map((c) => (
        <div key={c.nome}>
          <label htmlFor={c.nome} className={CLASSE_ROTULO}>
            {primeiroAcesso && c.nome === "senhaAtual" ? "Senha atual (a provisória)" : c.rotulo}
          </label>
          <input id={c.nome} name={c.nome} type="password" autoComplete={c.autoComplete} aria-invalid={Boolean(erros[c.nome])} className={CLASSE_CAMPO} />
          <ErroCampo mensagem={erros[c.nome]} />
        </div>
      ))}
      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
      {sucesso && <Mensagem tipo="sucesso">{sucesso}</Mensagem>}
      <button type="submit" disabled={enviando} className={`w-full ${CLASSE_BOTAO_PRIMARIO}`}>
        {enviando ? "Salvando..." : primeiroAcesso ? "Salvar e entrar" : "Salvar nova senha"}
      </button>
      {primeiroAcesso && (
        <button type="button" onClick={sair} className={`w-full ${CLASSE_BOTAO_SECUNDARIO}`}>Sair</button>
      )}
    </form>
  );
}
