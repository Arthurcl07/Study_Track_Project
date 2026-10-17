"use client";

// Parte interativa da casca: abre/fecha o menu no celular e faz o logout (OPEN-019).
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icone, type NomeIcone } from "./icones";
import { Logotipo } from "./marca";

type Item = { id: string; rotulo: string; href: string; icone: NomeIcone };

export function NavegacaoCasca({ itens, ativo, nome, perfil }: { itens: Item[]; ativo: string; nome: string; perfil: string }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      {/* Barra superior: só no celular */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between bg-marinho px-4 md:hidden">
        <Link href={itens[0]?.href ?? "/"} aria-label="Início"><Logotipo inverso /></Link>
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          aria-controls="menu-principal"
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          className="rounded-lg p-2 text-white hover:bg-marinho-claro"
        >
          <Icone nome={aberto ? "fechar" : "menu"} className="h-6 w-6" />
        </button>
      </div>

      <nav
        id="menu-principal"
        aria-label="Menu principal"
        className={`${aberto ? "flex" : "hidden"} fixed inset-x-0 top-14 bottom-0 z-20 flex-col gap-1 bg-marinho px-3.5 py-4 text-white md:sticky md:top-0 md:flex md:h-dvh md:py-5`}
      >
        <Link href={itens[0]?.href ?? "/"} className="mb-4 hidden px-2 md:block" aria-label="Início">
          <Logotipo inverso />
        </Link>
        {itens.map((item) => {
          const atual = item.id === ativo;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setAberto(false)}
              aria-current={atual ? "page" : undefined}
              className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[15px] transition-colors ${
                atual ? "bg-marinho-claro text-white shadow-[inset_3px_0_0_var(--color-ceu)]" : "text-slate-300 hover:bg-marinho-claro hover:text-white"
              }`}
            >
              <Icone nome={item.icone} />
              {item.rotulo}
            </Link>
          );
        })}
        <div className="mt-auto border-t border-white/15 px-2 pt-4 text-sm">
          <p className="font-semibold">{nome}</p>
          <p className="mt-0.5 text-ceu">{perfil}</p>
          <button
            type="button"
            onClick={sair}
            disabled={saindo}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] border border-white/30 px-3 py-2 font-medium hover:bg-marinho-claro disabled:opacity-60"
          >
            <Icone nome="sair" className="h-4 w-4" />
            {saindo ? "Saindo..." : "Sair"}
          </button>
        </div>
      </nav>
    </>
  );
}
