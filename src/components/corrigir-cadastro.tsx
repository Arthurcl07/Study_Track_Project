"use client";

// Editar e excluir um cadastro (SPEC-026, RF-35): formulário com os campos editáveis (PATCH) e, quando o cadastro
// pode ser excluído, o botão Excluir com confirmação (DELETE). A regra (escopo, trava do período e registros
// dependentes, RB-32) vale no servidor; aqui só se mostra o motivo que ele devolver.
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO, CLASSE_CAMPO, CLASSE_ROTULO, Cartao, ErroCampo, Mensagem } from "./ui";

export type CampoEditavel = { nome: string; rotulo: string; tipo?: "text" | "number" | "date"; valor: string };

export function CorrigirCadastro({
  url,
  titulo,
  campos,
  aviso,
  excluir,
}: {
  url: string;
  titulo: string;
  campos: CampoEditavel[];
  aviso?: string;
  // Sem "excluir", o cartão não oferece exclusão. motivo: explica por que não pode (o botão fica desabilitado).
  excluir?: { rotulo: string; confirmacao: string; destino: string; motivo?: string | null };
}) {
  const router = useRouter();
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);
    setErro(null);
    setErros({});
    setSucesso(null);
    const resposta = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(evento.currentTarget))) }).catch(() => null);
    const retorno = resposta ? await resposta.json().catch(() => ({})) : {};
    setEnviando(false);
    if (!resposta?.ok) {
      setErro(retorno.erro ?? "Não foi possível salvar.");
      setErros(retorno.campos ?? {});
      return;
    }
    setSucesso("Alteração salva e registrada na auditoria.");
    router.refresh();
  }

  async function apagar() {
    if (!excluir || !window.confirm(excluir.confirmacao)) return;
    setEnviando(true);
    setErro(null);
    const resposta = await fetch(url, { method: "DELETE" }).catch(() => null);
    const retorno = resposta ? await resposta.json().catch(() => ({})) : {};
    setEnviando(false);
    if (!resposta?.ok) {
      setErro(retorno.erro ?? "Não foi possível excluir.");
      return;
    }
    router.replace(excluir.destino);
    router.refresh();
  }

  return (
    <Cartao titulo={titulo}>
      <form onSubmit={salvar} noValidate className="space-y-4">
        {campos.map((c) => (
          <div key={c.nome}>
            <label htmlFor={`corrigir-${c.nome}`} className={CLASSE_ROTULO}>{c.rotulo}</label>
            <input id={`corrigir-${c.nome}`} name={c.nome} type={c.tipo ?? "text"} defaultValue={c.valor} aria-invalid={Boolean(erros[c.nome])} className={CLASSE_CAMPO} />
            <ErroCampo mensagem={erros[c.nome]} />
          </div>
        ))}
        {aviso && <p className="text-sm text-mudo">{aviso}</p>}
        {erro && Object.keys(erros).length === 0 && <Mensagem tipo="erro">{erro}</Mensagem>}
        {sucesso && <Mensagem tipo="sucesso">{sucesso}</Mensagem>}
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={enviando} className={CLASSE_BOTAO_PRIMARIO}>{enviando ? "Salvando..." : "Salvar alterações"}</button>
          {excluir && (
            <button
              type="button"
              disabled={enviando || Boolean(excluir.motivo)}
              title={excluir.motivo ?? undefined}
              onClick={apagar}
              className={`${CLASSE_BOTAO_SECUNDARIO} text-risco`}
            >
              {excluir.rotulo}
            </button>
          )}
        </div>
        {excluir?.motivo && <p className="text-sm text-mudo">{excluir.motivo}</p>}
      </form>
    </Cartao>
  );
}
