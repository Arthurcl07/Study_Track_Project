import { Painel } from "@/components/painel";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// Página exclusiva de Coordenador — demonstra a negação de acesso no servidor (AC-001-03).
export default async function AreaCoordenacao() {
  const sessao = await exigirAcessoPagina(RECURSOS.areaCoordenacao);
  return (
    <Painel sessao={sessao}>
      <p className="text-slate-700">Área exclusiva da coordenação.</p>
    </Painel>
  );
}
