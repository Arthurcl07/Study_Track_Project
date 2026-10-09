"use client";

// Formulário genérico que envia JSON para uma rota da API e mostra o campo pendente (RF-03, AC-002-02).
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export type Campo = {
  nome: string;
  rotulo: string;
  tipo?: "text" | "email" | "password" | "number" | "select";
  opcoes?: { valor: string; rotulo: string }[];
};

const CLASSE_CAMPO =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

export function FormularioApi({
  url,
  campos,
  textoBotao,
  mensagemSucesso,
}: {
  url: string;
  campos: Campo[];
  textoBotao: string;
  mensagemSucesso: string;
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
    <form onSubmit={enviar} className="space-y-3" noValidate>
      {campos.map((campo) => (
        <div key={campo.nome}>
          <label htmlFor={`${url}-${campo.nome}`} className="block text-sm font-medium">{campo.rotulo}</label>
          {campo.tipo === "select" ? (
            <select id={`${url}-${campo.nome}`} name={campo.nome} defaultValue="" className={CLASSE_CAMPO}>
              <option value="">Selecione...</option>
              {campo.opcoes?.map((opcao) => (
                <option key={opcao.valor} value={opcao.valor}>{opcao.rotulo}</option>
              ))}
            </select>
          ) : (
            <input id={`${url}-${campo.nome}`} name={campo.nome} type={campo.tipo ?? "text"} className={CLASSE_CAMPO} />
          )}
          {errosCampo[campo.nome] && <p className="mt-1 text-sm text-red-700">{errosCampo[campo.nome]}</p>}
        </div>
      ))}
      {erro && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
      {sucesso && <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{sucesso}</p>}
      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-60 sm:w-auto"
      >
        {enviando ? "Salvando..." : textoBotao}
      </button>
    </form>
  );
}
