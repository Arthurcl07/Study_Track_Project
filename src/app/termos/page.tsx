import Link from "next/link";
import { Logotipo } from "@/components/marca";
import { TextoTermos } from "@/components/texto-termos";
import { CLASSE_LINK } from "@/components/ui";
import { DATA_TERMOS, VERSAO_TERMOS } from "@/domain/lgpd";
import { encarregadoDeDados } from "@/server/academico/lgpd";

export const dynamic = "force-dynamic";

// SPEC-045: página pública com os termos de uso e a política de privacidade vigentes.
export default async function Termos() {
  const encarregado = await encarregadoDeDados();
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="mb-6"><Logotipo /></div>
      <h1 className="text-2xl font-semibold tracking-tight">Termos de uso e política de privacidade</h1>
      <p className="mt-1 mb-6 text-mudo">{encarregado.instituicao} · versão {VERSAO_TERMOS}, de {DATA_TERMOS}</p>
      <section className="rounded-2xl border border-traco bg-white p-6">
        <TextoTermos encarregado={encarregado} />
      </section>
      <p className="mt-6 text-sm"><Link href="/" className={CLASSE_LINK}>← Voltar</Link></p>
    </main>
  );
}
