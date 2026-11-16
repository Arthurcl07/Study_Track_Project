// SPEC-045: texto dos termos de uso e da política de privacidade, usado no aceite e na página pública /termos.
import { TERMOS_DE_USO, politicaDePrivacidade, type Encarregado } from "@/domain/lgpd";

export function TextoTermos({ encarregado, rolagem = false }: { encarregado: Encarregado; rolagem?: boolean }) {
  return (
    <div
      className={`space-y-3 text-sm leading-relaxed ${rolagem ? "max-h-64 overflow-y-auto rounded-[10px] border border-traco px-4 py-3" : ""}`}
      tabIndex={rolagem ? 0 : undefined}
      aria-label={rolagem ? "Termos de uso e política de privacidade" : undefined}
    >
      <h2 className="font-semibold">Termos de uso</h2>
      {TERMOS_DE_USO.map((p) => <p key={p}>{p}</p>)}
      <h2 className="pt-2 font-semibold">Política de privacidade</h2>
      {politicaDePrivacidade(encarregado).map((p) => <p key={p}>{p}</p>)}
    </div>
  );
}
