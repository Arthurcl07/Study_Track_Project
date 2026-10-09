import Link from "next/link";
import { Painel } from "@/components/painel";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";

export default async function PainelCoordenador() {
  const sessao = await exigirAcessoPagina(RECURSOS.painelCoordenador);
  return (
    <Painel sessao={sessao}>
      <Link href="/coordenador/area" className="text-indigo-700 underline">Área da coordenação</Link>
    </Painel>
  );
}
