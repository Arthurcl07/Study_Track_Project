import { Painel } from "@/components/painel";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";

export default async function PainelEstudante() {
  const sessao = await exigirAcessoPagina(RECURSOS.painelEstudante);
  return <Painel sessao={sessao} />;
}
