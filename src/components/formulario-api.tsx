"use client";

// Formulário genérico que envia JSON para uma rota da API e mostra o campo pendente (RF-03, AC-002-02).
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO, CLASSE_CAMPO, CLASSE_ROTULO, ErroCampo, Mensagem } from "./ui";

export type Campo = {
  nome: string;
  rotulo: string;
  tipo?: "text" | "email" | "password" | "number" | "select";
  opcoes?: { valor: string; rotulo: string }[];
};

export function FormularioApi({
  url,
  campos,
  textoBotao,
  mensagemSucesso,
  secundario = false,
}: {
  url: string;
  campos: Campo[];
  textoBotao: string;
  mensagemSucesso: string;
  secundario?: boolean;
}) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [errosCampo, setErrosCampo] = useState<Record<string, string>>({});
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const corpo = Object.fromEntries(new FormData(formulario));
    setErro(null);
    setErrosCampo({});
    setSucesso(null);
    setEnviando(true);
    try {
      const resposta = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });
      const retorno = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(retorno.erro ?? "Não foi possível salvar.");
        setErrosCampo(retorno.campos ?? {});
        return;
      }
      formulario.reset();
      setSucesso(mensagemSucesso);
      router.refresh();
    } catch {
      setErro("Não foi possível salvar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4" noValidate>
      {campos.map((campo) => {
        const id = `${url}-${campo.nome}`;
        const invalido = Boolean(errosCampo[campo.nome]);
        return (
          <div key={campo.nome}>
            <label htmlFor={id} className={CLASSE_ROTULO}>{campo.rotulo}</label>
            {campo.tipo === "select" ? (
              <select id={id} name={campo.nome} defaultValue="" aria-invalid={invalido} className={CLASSE_CAMPO}>
                <option value="">Selecione...</option>
                {campo.opcoes?.map((opcao) => (
                  <option key={opcao.valor} value={opcao.valor}>{opcao.rotulo}</option>
                ))}
              </select>
            ) : (
              <input id={id} name={campo.nome} type={campo.tipo ?? "text"} aria-invalid={invalido} className={CLASSE_CAMPO} />
            )}
            <ErroCampo mensagem={errosCampo[campo.nome]} />
          </div>
        );
      })}
      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
      {sucesso && <Mensagem tipo="sucesso">{sucesso}</Mensagem>}
      <button type="submit" disabled={enviando} className={`w-full ${secundario ? CLASSE_BOTAO_SECUNDARIO : CLASSE_BOTAO_PRIMARIO}`}>
        {enviando ? "Salvando..." : textoBotao}
      </button>
    </form>
  );
}
