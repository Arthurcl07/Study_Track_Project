"use client";

// SPEC-047: erro na própria casca (layout raiz). Precisa ter html e body.
import { PaginaErro } from "@/components/pagina-erro";
import "./globals.css";

export default function ErroGeral({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh">
        <PaginaErro digest={error.digest} tentarDeNovo={reset} />
      </body>
    </html>
  );
}
