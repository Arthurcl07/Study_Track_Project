import Link from "next/link";

export default function AcessoNegado() {
  return (
    <main className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Acesso negado</h1>
      <p className="mt-2 text-slate-600">Seu perfil não tem permissão para acessar esta página.</p>
      <Link href="/" className="mt-6 inline-block text-indigo-700 underline">Voltar ao meu painel</Link>
    </main>
  );
}
