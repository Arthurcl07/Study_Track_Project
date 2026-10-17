import { redirect } from "next/navigation";
import { Logotipo } from "@/components/marca";
import { painelDoPerfil } from "@/domain/autorizacao";
import { sessaoDaPagina } from "@/server/auth/guardas";
import { FormularioLogin } from "./formulario-login";

// SPEC-001 / UC-01 — layout aprovado em docs/layout/prototipo.html#login.
export default async function PaginaLogin() {
  const sessao = await sessaoDaPagina();
  if (sessao) redirect(painelDoPerfil(sessao.perfil));

  return (
    <main className="grid min-h-dvh md:grid-cols-2">
      <section className="hidden flex-col justify-between bg-marinho p-12 text-white md:flex">
        <Logotipo inverso grande />
        <div>
          <h2 className="text-3xl leading-tight font-semibold">
            Acompanhamento acadêmico
            <br />
            em um só lugar.
          </h2>
          <p className="mt-3 max-w-sm text-slate-300">
            Notas, frequência e situação acadêmica de cada turma, com acesso de acordo com o seu perfil.
          </p>
        </div>
        <p className="text-sm text-slate-400">Estudante · Professor · Coordenação</p>
      </section>
      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 md:hidden"><Logotipo /></div>
          <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
          <p className="mt-1.5 text-mudo">Use o e-mail e a senha cadastrados pela coordenação.</p>
          <FormularioLogin />
        </div>
      </section>
    </main>
  );
}
