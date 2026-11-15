"use client";

// Tour do primeiro acesso (SPEC-059, RF-65): destaca o item do menu de cada passo, com Próximo, Voltar e Pular.
// Teclado: Esc pula, setas avançam e voltam (RNF-07). Concluir ou pular marca o tour como visto (INV-059-01).
// Layout aprovado em docs/layout/prototipo.html#tour.
import { useCallback, useEffect, useRef, useState } from "react";
import type { PassoDoTour } from "@/domain/ajuda";
import { CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO, CLASSE_LINK } from "./ui";

type Caixa = { top: number; left: number; width: number; height: number };

export function Tour({ passos }: { passos: PassoDoTour[] }) {
  const [aberto, setAberto] = useState(true);
  const [atual, setAtual] = useState(0);
  const [caixa, setCaixa] = useState<Caixa | null>(null);
  const dialogo = useRef<HTMLDivElement>(null);
  const passo = passos[atual];

  const fechar = useCallback(() => {
    setAberto(false);
    fetch("/api/ajuda/tour", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visto: true }) }).catch(() => null);
  }, []);

  // Contorno no item do menu do passo (só quando o menu está visível: no celular ele fica recolhido).
  useEffect(() => {
    if (!aberto || !passo) return;
    const alvo = document.querySelector<HTMLElement>(`[data-tour="${passo.alvo}"]`);
    const medir = () => {
      const r = alvo?.getBoundingClientRect();
      setCaixa(r && r.width > 0 ? { top: r.top - 4, left: r.left - 4, width: r.width + 8, height: r.height + 8 } : null);
    };
    alvo?.scrollIntoView({ block: "nearest" });
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [aberto, passo]);

  useEffect(() => {
    if (!aberto) return;
    dialogo.current?.focus();
    const teclas = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar();
      if (e.key === "ArrowRight") setAtual((a) => Math.min(a + 1, passos.length - 1));
      if (e.key === "ArrowLeft") setAtual((a) => Math.max(a - 1, 0));
    };
    window.addEventListener("keydown", teclas);
    return () => window.removeEventListener("keydown", teclas);
  }, [aberto, fechar, passos.length]);

  if (!aberto || !passo) return null;
  const ultimo = atual === passos.length - 1;
  const posicao = caixa ? { top: Math.min(caixa.top, window.innerHeight - 260), left: caixa.left + caixa.width + 16 } : null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-marinho/40" aria-hidden="true" onClick={fechar} />
      {caixa && (
        <div aria-hidden="true" className="pointer-events-none absolute rounded-xl ring-4 ring-ceu" style={{ top: caixa.top, left: caixa.left, width: caixa.width, height: caixa.height }} />
      )}
      <div
        ref={dialogo}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-titulo"
        aria-describedby="tour-texto"
        tabIndex={-1}
        className="absolute w-[min(360px,calc(100vw-32px))] rounded-2xl border-2 border-azul bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.25)] outline-none"
        style={posicao ?? { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      >
        <p className="text-xs text-mudo">Passo {atual + 1} de {passos.length}</p>
        <h2 id="tour-titulo" className="mt-1 text-lg font-semibold">{passo.titulo}</h2>
        <p id="tour-texto" className="mt-2 mb-4 text-sm">{passo.texto}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={fechar} className={`text-sm ${CLASSE_LINK}`}>Pular o tour</button>
          <span className="flex gap-2">
            {atual > 0 && <button type="button" onClick={() => setAtual(atual - 1)} className={CLASSE_BOTAO_SECUNDARIO}>Voltar</button>}
            <button type="button" onClick={() => (ultimo ? fechar() : setAtual(atual + 1))} className={CLASSE_BOTAO_PRIMARIO}>{ultimo ? "Concluir" : "Próximo"}</button>
          </span>
        </div>
      </div>
    </div>
  );
}
