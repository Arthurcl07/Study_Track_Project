import Link from "next/link";
import { redirect } from "next/navigation";
import { Logotipo } from "@/components/marca";
import { painelDoPerfil } from "@/domain/autorizacao";
import { sessaoDaPagina } from "@/server/auth/guardas";
import { FormularioEsqueci } from "./formulario-esqueci";

// SPEC-027 / UC-26 — página pública, como o login. Layout aprovado em docs/layout/prototipo.html#senha-esqueci.
export default async function EsqueciSenha() {
  const sessao = await sessaoDaPagina();
  if (sessao) redirect(painelDoPerfil(sessao.perfil));

  return (
    <main className="grid min-h-dvh md:grid-cols-2">
      <section className="hidden flex-col justify-between bg-marinho p-12 text-white md:flex">
        <Logotipo inverso grande />
        <div>
          <h2 className="text-3xl leading-tight font-semibold">Esqueceu a senha?</h2>
          <p className="mt-3 max-w-sm text-slate-300">
            A secretaria confere quem é você e entrega uma senha provisória. No primeiro acesso você define uma senha nova.
          </p>
        </div>
        <p className="text-sm text-slate-400">Estudante · Professor · Coordenação</p>
      </section>
      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 md:hidden"><Logotipo /></div>
          <h1 className="text-2xl font-semibold tracking-tight">Esqueci minha senha</h1>
          <p className="mt-1.5 text-mudo">Informe o e-mail que você usa para entrar.</p>
          <FormularioEsqueci />
          <p className="mt-5 text-center text-sm">
            <Link href="/login" className="font-medium text-azul hover:underline">← Voltar ao login</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
