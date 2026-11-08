"use client";

// Lista de contas do Administrador (SPEC-010, RF-16): filtro por perfil e Desativar/Reativar.
// As regras (não desativar a si mesmo nem professor com turma) valem no servidor (RB-14);
// aqui só se mostra a mensagem que ele devolver. Layout aprovado em docs/layout/prototipo.html#admin-contas.
// SPEC-026: Editar nome e e-mail. SPEC-034: busca e paginação (#correcao-conta).
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PERFIS, type Perfil } from "@/domain/perfil";
import { CampoBusca, FiltroSelecao, Paginacao, type Pagina } from "./busca-paginacao";
import { CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO, CLASSE_CAMPO, CLASSE_ROTULO, ErroCampo, EstadoVazio, Etiqueta, Mensagem } from "./ui";

export type Conta = { id: string; nome: string; email: string; perfil: Perfil; ativo: boolean; curso: { nome: string } | null };

function SeloConta({ ativo }: { ativo: boolean }) {
  const classe = ativo ? "bg-normal-fundo text-normal" : "bg-slate-100 text-slate-600";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap ${classe}`}>{ativo ? "● Ativa" : "○ Inativa"}</span>;
}

// SPEC-026 (AC-026-01/02): nome e e-mail; o perfil não muda. Erros de campo vêm do servidor.
function EditarConta({ conta, aoFechar }: { conta: Conta; aoFechar: (aviso?: string) => void }) {
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const dados = Object.fromEntries(new FormData(evento.currentTarget));
    setEnviando(true);
    setErro(null);
    setErros({});
    const resposta = await fetch(`/api/contas/${conta.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dados) }).catch(() => null);
    const retorno = resposta ? await resposta.json().catch(() => ({})) : {};
    setEnviando(false);
    if (!resposta?.ok) {
      setErro(retorno.erro ?? "Não foi possível salvar.");
      setErros(retorno.campos ?? {});
      return;
    }
    aoFechar(`Conta de ${retorno.nome} atualizada.`);
  }

  return (
    <form onSubmit={salvar} noValidate className="space-y-3 rounded-xl border border-azul-suave bg-nevoa p-4">
      <p className="font-semibold">Editar conta · <span className="font-normal text-mudo">{conta.perfil}</span></p>
      <div>
        <label htmlFor={`nome-${conta.id}`} className={CLASSE_ROTULO}>Nome</label>
        <input id={`nome-${conta.id}`} name="nome" defaultValue={conta.nome} aria-invalid={Boolean(erros.nome)} className={CLASSE_CAMPO} />
        <ErroCampo mensagem={erros.nome} />
      </div>
      <div>
        <label htmlFor={`email-${conta.id}`} className={CLASSE_ROTULO}>E-mail</label>
        <input id={`email-${conta.id}`} name="email" type="email" defaultValue={conta.email} aria-invalid={Boolean(erros.email)} className={CLASSE_CAMPO} />
        <ErroCampo mensagem={erros.email} />
      </div>
      <p className="text-sm text-mudo">O perfil não muda. A alteração fica na auditoria com o valor antigo e o novo.</p>
      {erro && Object.keys(erros).length === 0 && <Mensagem tipo="erro">{erro}</Mensagem>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={enviando} className={CLASSE_BOTAO_PRIMARIO}>{enviando ? "Salvando..." : "Salvar alterações"}</button>
        <button type="button" onClick={() => aoFechar()} className={CLASSE_BOTAO_SECUNDARIO}>Cancelar</button>
      </div>
    </form>
  );
}

export function ListaContas({ contas, pagina, usuarioId }: { contas: Conta[]; pagina: Pagina; usuarioId: string }) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [salvando, setSalvando] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);

  async function alternar(conta: Conta) {
    setErro(null);
    setAviso(null);
    setSalvando(conta.id);
    try {
      const resposta = await fetch(`/api/contas/${conta.id}/${conta.ativo ? "desativar" : "reativar"}`, { method: "POST" });
      const retorno = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(retorno.erro ?? "Não foi possível alterar a conta.");
        return;
      }
      setAviso(conta.ativo ? `A conta de ${conta.nome} foi desativada e não entra mais no sistema.` : `A conta de ${conta.nome} foi reativada.`);
      router.refresh();
    } catch {
      setErro("Não foi possível alterar a conta. Tente novamente.");
    } finally {
      setSalvando(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="w-full text-[17px] font-semibold">Contas ({pagina.total})</h2>
        <CampoBusca />
        <FiltroSelecao parametro="perfil" rotulo="Perfil" todos="Todos os perfis" opcoes={PERFIS.map((p) => ({ valor: p, rotulo: p }))} />
      </div>
      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
      {aviso && <Mensagem tipo="sucesso">{aviso}</Mensagem>}
      {contas.length === 0 ? (
        <EstadoVazio>Nenhuma conta encontrada.</EstadoVazio>
      ) : (
        <table className="tabela-responsiva w-full text-[15px]">
          <thead>
            <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
              <th className="pr-2 pb-2.5">Conta</th>
              <th className="px-2 pb-2.5">Perfil</th>
              <th className="px-2 pb-2.5">Situação</th>
              <th className="pb-2.5 pl-2"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody>
            {contas.map((c) =>
              editando === c.id ? (
                <tr key={c.id} className="border-t border-traco">
                  <td colSpan={4} className="py-3">
                    <EditarConta
                      conta={c}
                      aoFechar={(texto) => {
                        setEditando(null);
                        if (texto) {
                          setAviso(texto);
                          router.refresh();
                        }
                      }}
                    />
                  </td>
                </tr>
              ) : (
                <tr key={c.id} className="border-t border-traco">
                  <td data-rotulo="Conta" className="py-3 pr-2">
                    <div className="min-w-0">
                      <span className="block font-medium">{c.nome}</span>
                      <span className="block text-sm break-all text-mudo">{c.email}</span>
                    </div>
                  </td>
                  <td data-rotulo="Perfil" className="px-2 py-3">
                    <Etiqueta>{c.perfil}</Etiqueta>
                    {/* SPEC-015: o curso do estudante (RB-19). */}
                    {c.curso && <span className="mt-1 block text-xs text-mudo">{c.curso.nome}</span>}
                  </td>
                  <td data-rotulo="Situação" className="px-2 py-3"><SeloConta ativo={c.ativo} /></td>
                  <td data-rotulo="Ações" className="py-3 pl-2 text-right">
                    <span className="inline-flex flex-wrap justify-end gap-3">
                      <button type="button" onClick={() => { setEditando(c.id); setAviso(null); setErro(null); }} className="font-medium text-azul hover:underline">Editar</button>
                      {c.id === usuarioId ? (
                        <span className="text-mudo">(você)</span>
                      ) : (
                        <button type="button" disabled={salvando !== null} onClick={() => alternar(c)} className="font-medium text-azul hover:underline disabled:opacity-60">
                          {salvando === c.id ? "Salvando..." : c.ativo ? "Desativar" : "Reativar"}
                        </button>
                      )}
                    </span>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      )}
      <Paginacao pagina={pagina} unidade="conta(s)" />
    </div>
  );
}
