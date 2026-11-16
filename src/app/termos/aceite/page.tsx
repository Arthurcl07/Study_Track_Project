import { redirect } from "next/navigation";
import { Logotipo } from "@/components/marca";
import { AceiteTermos } from "@/components/termos";
import { TextoTermos } from "@/components/texto-termos";
import { painelDoPerfil } from "@/domain/autorizacao";
import { DATA_TERMOS, VERSAO_TERMOS } from "@/domain/lgpd";
import { encarregadoDeDados } from "@/server/academico/lgpd";
import { contaDaPagina } from "@/server/auth/guardas";

// SPEC-045 / RB-43 (INV-045-01): até aceitar a versão vigente, toda página traz a pessoa para cá.
// Layout aprovado em docs/layout/prototipo.html#lgpd-aceite.
export default async function AceitarTermos() {
  const conta = await contaDaPagina();
  if (!conta) redirect("/login");
  if (conta.trocarSenha) redirect("/definir-senha");
  if (!conta.aceitarTermos) redirect(painelDoPerfil(conta.sessao.perfil));
  const encarregado = await encarregadoDeDados();

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-5"><Logotipo /></div>
        <section className="rounded-2xl border border-traco bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
          <h1 className="text-2xl font-semibold tracking-tight">Antes de começar</h1>
          <p className="mt-1.5 mb-4 text-mudo">
            Olá, {conta.sessao.nome.split(" ")[0]}. Para usar o StudyTrack, leia e aceite os documentos abaixo. Versão {VERSAO_TERMOS}, de {DATA_TERMOS}.
          </p>
          <TextoTermos encarregado={encarregado} rolagem />
          <AceiteTermos versao={VERSAO_TERMOS} />
        </section>
        <p className="mt-3 text-sm text-mudo">Quando a versão mudar, o sistema pede o aceite de novo.</p>
      </div>
    </main>
  );
}
