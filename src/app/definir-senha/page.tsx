import { redirect } from "next/navigation";
import { FormularioSenha } from "@/components/formulario-senha";
import { Logotipo } from "@/components/marca";
import { painelDoPerfil } from "@/domain/autorizacao";
import { contaDaPagina } from "@/server/auth/guardas";

// SPEC-011 / RB-15: primeiro acesso de conta criada pela tela. Até definir a senha, todas as outras
// páginas trazem a pessoa de volta para cá. Layout aprovado em docs/layout/prototipo.html#primeiro-acesso.
export default async function DefinirSenha() {
  const conta = await contaDaPagina();
  if (!conta) redirect("/login");
  if (!conta.trocarSenha) redirect(painelDoPerfil(conta.sessao.perfil));

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-traco bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
        <Logotipo />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Defina sua senha</h1>
        <p className="mt-1.5 mb-6 text-mudo">
          Olá, {conta.sessao.nome.split(" ")[0]}. Sua conta foi criada com uma senha provisória. Para continuar, crie uma senha que só você conheça.
        </p>
        <FormularioSenha primeiroAcesso />
      </div>
    </main>
  );
}
