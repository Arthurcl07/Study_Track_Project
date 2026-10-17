import Link from "next/link";
import { Icone } from "@/components/icones";
import { Logotipo } from "@/components/marca";
import { CLASSE_BOTAO_PRIMARIO } from "@/components/ui";

// SPEC-001 / RNF-03 — layout aprovado em docs/layout/prototipo.html#acesso-negado.
export default function AcessoNegado() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-12 text-center">
      <div className="max-w-md">
        <Logotipo />
        <div className="mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-risco-fundo text-risco">
          <Icone nome="cadeado" className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold">Acesso negado</h1>
        <p className="mt-2 text-mudo">Seu perfil não tem permissão para acessar esta página.</p>
        <Link href="/" className={`mt-6 ${CLASSE_BOTAO_PRIMARIO}`}>Voltar ao meu painel</Link>
      </div>
    </main>
  );
}
