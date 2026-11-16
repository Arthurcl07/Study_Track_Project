"use client";

// SPEC-047 / RF-56: página de erro com a identidade, a mensagem, o código e o caminho de volta. Nunca mostra a
// mensagem técnica nem a pilha (INV-047-01). Layout aprovado em docs/layout/prototipo.html#erro.
import { codigoDoErro } from "@/domain/erros";
import { Logotipo } from "./marca";
import { CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO } from "./ui";

export function PaginaErro({ digest, tentarDeNovo }: { digest?: string; tentarDeNovo: () => void }) {
  const codigo = codigoDoErro(digest ?? "sem-digest");
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-12 text-center">
      <div className="max-w-md">
        <div className="flex justify-center"><Logotipo /></div>
        <div className="mt-8 text-5xl" aria-hidden="true">⚠️</div>
        <h1 className="mt-2 text-2xl font-semibold">Algo deu errado</h1>
        <p className="mt-2 text-mudo">Não foi culpa sua. Tente de novo; se continuar, informe à secretaria o código abaixo.</p>
        <p className="mt-4 inline-block rounded-lg border border-traco bg-white px-3 py-2 font-mono text-lg" aria-label={`Código do erro: ${codigo}`}>{codigo}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={tentarDeNovo} className={CLASSE_BOTAO_PRIMARIO}>Tentar de novo</button>
          {/* Link comum (não o do Next.js): recarrega a casca inteira. */}
          <a href="/" className={CLASSE_BOTAO_SECUNDARIO}>Voltar ao início</a>
        </div>
      </div>
    </main>
  );
}
