"use client";

// SPEC-034 (RF-43): campo de busca e paginação. A busca e a página ficam no endereço (?q=&pagina=), então dá para
// voltar e compartilhar o link; a busca e o recorte do escopo acontecem no servidor (INV-034-01).
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { CLASSE_BOTAO_SECUNDARIO, CLASSE_CAMPO } from "./ui";

export type Pagina = { pagina: number; paginas: number; de: number; ate: number; total: number };

function useEndereco() {
  const caminho = usePathname();
  const parametros = useSearchParams();
  return (mudancas: Record<string, string | null>) => {
    const novos = new URLSearchParams(parametros.toString());
    for (const [chave, valor] of Object.entries(mudancas)) {
      if (valor === null || valor === "") novos.delete(chave);
      else novos.set(chave, valor);
    }
    const texto = novos.toString();
    return texto ? `${caminho}?${texto}` : caminho;
  };
}

export function CampoBusca({ placeholder = "Buscar por nome, e-mail ou matrícula", rotulo = "Buscar" }: { placeholder?: string; rotulo?: string }) {
  const router = useRouter();
  const parametros = useSearchParams();
  const endereco = useEndereco();
  const [valor, setValor] = useState(parametros.get("q") ?? "");
  useEffect(() => setValor(parametros.get("q") ?? ""), [parametros]);

  function buscar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    router.push(endereco({ q: valor.trim(), pagina: null }));
  }

  return (
    <form onSubmit={buscar} role="search" className="flex min-w-0 flex-1 gap-2">
      <label htmlFor="busca" className="sr-only">{rotulo}</label>
      <input id="busca" type="search" value={valor} onChange={(e) => setValor(e.target.value)} placeholder={placeholder} className={`${CLASSE_CAMPO} mt-0 min-w-0 flex-1`} />
      <button type="submit" className={CLASSE_BOTAO_SECUNDARIO}>Buscar</button>
    </form>
  );
}

// Filtro de seleção que também fica no endereço (perfil, curso, situação).
export function FiltroSelecao({ parametro, rotulo, opcoes, todos }: { parametro: string; rotulo: string; opcoes: { valor: string; rotulo: string }[]; todos: string }) {
  const router = useRouter();
  const parametros = useSearchParams();
  const endereco = useEndereco();
  return (
    <div className="w-full sm:w-52">
      <label htmlFor={`filtro-${parametro}`} className="sr-only">{rotulo}</label>
      <select
        id={`filtro-${parametro}`}
        value={parametros.get(parametro) ?? ""}
        onChange={(e) => router.push(endereco({ [parametro]: e.target.value, pagina: null }))}
        className={`${CLASSE_CAMPO} mt-0`}
        aria-label={rotulo}
      >
        <option value="">{todos}</option>
        {opcoes.map((o) => <option key={o.valor} value={o.valor}>{o.rotulo}</option>)}
      </select>
    </div>
  );
}

export function Paginacao({ pagina, unidade = "resultado(s)" }: { pagina: Pagina; unidade?: string }) {
  const parametros = useSearchParams();
  const endereco = useEndereco();
  const busca = parametros.get("q");
  const resumo = pagina.total === 0 ? (busca ? `Nenhum resultado para "${busca}"` : "Nada para mostrar") : `${pagina.de}–${pagina.ate} de ${pagina.total} ${unidade}${busca ? ` para "${busca}"` : ""}`;
  const botao = (alvo: number, texto: string, ativo: boolean) =>
    ativo ? (
      <Link href={endereco({ pagina: alvo === 1 ? null : String(alvo) })} className={CLASSE_BOTAO_SECUNDARIO} rel={alvo < pagina.pagina ? "prev" : "next"}>{texto}</Link>
    ) : (
      <span className={`${CLASSE_BOTAO_SECUNDARIO} pointer-events-none opacity-50`} aria-disabled="true">{texto}</span>
    );
  return (
    <nav aria-label="Paginação" className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-mudo">
      <span>{resumo}</span>
      {pagina.paginas > 1 && (
        <span className="flex items-center gap-2">
          {botao(pagina.pagina - 1, "← Anterior", pagina.pagina > 1)}
          <span className="tabular-nums">{pagina.pagina} / {pagina.paginas}</span>
          {botao(pagina.pagina + 1, "Próxima →", pagina.pagina < pagina.paginas)}
        </span>
      )}
    </nav>
  );
}
