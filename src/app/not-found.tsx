import Link from "next/link";
import { Logotipo } from "@/components/marca";
import { CLASSE_BOTAO_PRIMARIO } from "@/components/ui";

// Página não encontrada (também usada quando um recurso está fora do escopo do perfil, sem revelar se existe).
export default function NaoEncontrada() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-12 text-center">
      <div className="max-w-md">
        <Logotipo />
        <h1 className="mt-8 text-2xl font-semibold">Página não encontrada</h1>
        <p className="mt-2 text-mudo">O endereço não existe ou não está disponível para o seu perfil.</p>
        <Link href="/" className={`mt-6 ${CLASSE_BOTAO_PRIMARIO}`}>Voltar ao meu painel</Link>
      </div>
    </main>
  );
}
