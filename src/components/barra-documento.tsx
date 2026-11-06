"use client";

// Barra do documento (SPEC-020, OPEN-038): Voltar e Baixar PDF, que abre o "Salvar como PDF" do navegador.
// Não aparece no papel (classe nao-imprimir, globals.css).
import Link from "next/link";
import { Icone } from "./icones";
import { CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO } from "./ui";

export function BarraDocumento({ voltar }: { voltar: string }) {
  return (
    <div className="nao-imprimir sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-traco bg-white px-4 py-3 sm:px-5">
      <Link href={voltar} className={CLASSE_BOTAO_SECUNDARIO}>← Voltar</Link>
      <button type="button" onClick={() => window.print()} className={CLASSE_BOTAO_PRIMARIO}>
        <Icone nome="download" className="h-4 w-4" /> Baixar PDF
      </button>
    </div>
  );
}
