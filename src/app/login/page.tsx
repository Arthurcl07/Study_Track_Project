import { redirect } from "next/navigation";
import { painelDoPerfil } from "@/domain/autorizacao";
import { sessaoDaPagina } from "@/server/auth/guardas";
import { FormularioLogin } from "./formulario-login";

export default async function PaginaLogin() {
  const sessao = await sessaoDaPagina();
  if (sessao) redirect(painelDoPerfil(sessao.perfil));

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <h1 className="text-2xl font-semibold">StudyTrack</h1>
        <p className="mt-1 text-sm text-slate-600">Entre com seu e-mail e senha.</p>
        <FormularioLogin />
      </div>
    </main>
  );
}
