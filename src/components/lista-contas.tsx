"use client";

// Lista de contas do Administrador (SPEC-010, RF-16): filtro por perfil e Desativar/Reativar.
// As regras (não desativar a si mesmo nem professor com turma) valem no servidor (RB-14);
// aqui só se mostra a mensagem que ele devolver. Layout aprovado em docs/layout/prototipo.html#admin-contas.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PERFIS, type Perfil } from "@/domain/perfil";
import { CLASSE_CAMPO, CLASSE_ROTULO, EstadoVazio, Etiqueta, Mensagem } from "./ui";

export type Conta = { id: string; nome: string; email: string; perfil: Perfil; ativo: boolean };

function SeloConta({ ativo }: { ativo: boolean }) {
  const classe = ativo ? "bg-normal-fundo text-normal" : "bg-slate-100 text-slate-600";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap ${classe}`}>{ativo ? "● Ativa" : "○ Inativa"}</span>;
}

export function ListaContas({ contas, perfil, usuarioId }: { contas: Conta[]; perfil: string; usuarioId: string }) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [salvando, setSalvando] = useState<string | null>(null);

  function filtrar(valor: string) {
    router.push(valor ? `/admin/contas?perfil=${valor}` : "/admin/contas");
  }

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
      setAviso(conta.ativo ? `${conta.nome} foi desativada e não consegue mais entrar.` : `${conta.nome} foi reativada.`);
      router.refresh();
    } catch {
      setErro("Não foi possível alterar a conta. Tente novamente.");
    } finally {
      setSalvando(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-[17px] font-semibold">Contas ({contas.length})</h2>
        <div className="w-full sm:w-52">
          <label htmlFor="perfil" className={CLASSE_ROTULO}>Perfil</label>
          <select id="perfil" value={perfil} onChange={(e) => filtrar(e.target.value)} className={CLASSE_CAMPO}>
            <option value="">Todos</option>
            {PERFIS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>
      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
      {aviso && <Mensagem tipo="sucesso">{aviso}</Mensagem>}
      {contas.length === 0 ? (
        <EstadoVazio>Nenhuma conta com esse perfil.</EstadoVazio>
      ) : (
        <table className="tabela-responsiva w-full text-[15px]">
          <thead>
            <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
              <th className="pr-2 pb-2.5">Conta</th>
              <th className="px-2 pb-2.5">Perfil</th>
              <th className="px-2 pb-2.5">Situação</th>
              <th className="pb-2.5 pl-2"><span className="sr-only">Ação</span></th>
            </tr>
          </thead>
          <tbody>
            {contas.map((c) => (
              <tr key={c.id} className="border-t border-traco">
                <td data-rotulo="Conta" className="py-3 pr-2">
                  <span className="block font-medium">{c.nome}</span>
                  <span className="block text-sm break-all text-mudo">{c.email}</span>
                </td>
                <td data-rotulo="Perfil" className="px-2 py-3"><Etiqueta>{c.perfil}</Etiqueta></td>
                <td data-rotulo="Situação" className="px-2 py-3"><SeloConta ativo={c.ativo} /></td>
                <td data-rotulo="Ação" className="py-3 pl-2 text-right">
                  {c.id === usuarioId ? (
                    <span className="text-mudo">(você)</span>
                  ) : (
                    <button type="button" disabled={salvando !== null} onClick={() => alternar(c)} className="font-medium text-azul hover:underline disabled:opacity-60">
                      {salvando === c.id ? "Salvando..." : c.ativo ? "Desativar" : "Reativar"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
