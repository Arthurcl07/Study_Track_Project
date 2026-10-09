import type { Sessao } from "@/server/auth/token";

export function Painel({ sessao, children }: { sessao: Sessao; children?: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <p className="text-sm text-slate-500">StudyTrack</p>
      <h1 className="mt-1 text-2xl font-semibold">Olá, {sessao.nome}</h1>
      <p className="mt-2 inline-block rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
        Perfil: {sessao.perfil}
      </p>
      {children && <div className="mt-6">{children}</div>}
    </main>
  );
}
