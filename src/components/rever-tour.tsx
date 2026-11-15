"use client";

// SPEC-059 (AC-059-03): "Rever o tour" volta o tour a aparecer e leva ao dashboard.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CLASSE_BOTAO_SECUNDARIO } from "./ui";

export function ReverTour({ destino }: { destino: string }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  async function rever() {
    setEnviando(true);
    await fetch("/api/ajuda/tour", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visto: false }) }).catch(() => null);
    router.push(destino);
    router.refresh();
  }
  return (
    <button type="button" onClick={rever} disabled={enviando} className={CLASSE_BOTAO_SECUNDARIO}>
      ↻ {enviando ? "Abrindo..." : "Rever o tour"}
    </button>
  );
}
