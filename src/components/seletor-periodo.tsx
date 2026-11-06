"use client";

// Escolha do período letivo na URL (?periodo=), mantendo os outros filtros (SPEC-017, dashboard do coordenador).
// Sem escolha, o servidor usa só as turmas de períodos abertos (INV-017-05); o seletor só orienta.
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CLASSE_CAMPO, CLASSE_ROTULO } from "./ui";

export function SeletorPeriodo({ periodos, valor }: { periodos: { nome: string; status: "Aberto" | "Encerrado" }[]; valor: string }) {
  const router = useRouter();
  const caminho = usePathname();
  const atuais = useSearchParams();

  function ir(periodo: string) {
    const consulta = new URLSearchParams(atuais.toString());
    if (periodo) consulta.set("periodo", periodo);
    else consulta.delete("periodo");
    const texto = consulta.toString();
    router.push(texto ? `${caminho}?${texto}` : caminho);
  }

  return (
    <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 sm:w-auto">
      <label htmlFor="periodo" className={CLASSE_ROTULO}>Período</label>
      <select id="periodo" value={valor} onChange={(e) => ir(e.target.value)} className={`${CLASSE_CAMPO} mt-0 sm:w-56`}>
        <option value="">Períodos abertos</option>
        {periodos.map((p) => (
          <option key={p.nome} value={p.nome}>{p.nome}{p.status === "Encerrado" ? " (encerrado)" : ""}</option>
        ))}
      </select>
    </div>
  );
}
