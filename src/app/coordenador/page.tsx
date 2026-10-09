import Link from "next/link";
import { Painel } from "@/components/painel";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";

const LINK = "block rounded-lg border border-slate-200 px-4 py-3 text-indigo-700 hover:bg-slate-50";

export default async function PainelCoordenador() {
  const sessao = await exigirAcessoPagina(RECURSOS.painelCoordenador);
  return (
    <Painel sessao={sessao}>
      <nav className="grid gap-3 sm:grid-cols-2">
        <Link href="/coordenador/disciplinas" className={LINK}>Disciplinas</Link>
        <Link href="/coordenador/turmas" className={LINK}>Turmas e estudantes</Link>
        <Link href="/coordenador/area" className={LINK}>Área da coordenação</Link>
      </nav>
    </Painel>
  );
}
