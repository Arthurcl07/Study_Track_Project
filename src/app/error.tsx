"use client";

// SPEC-047: erro inesperado em qualquer página (autenticada ou pública).
import { PaginaErro } from "@/components/pagina-erro";

export default function Erro({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PaginaErro digest={error.digest} tentarDeNovo={reset} />;
}
