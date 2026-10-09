import { Painel } from "@/components/painel";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";

export default async function PainelProfessor() {
  const sessao = await exigirAcessoPagina(RECURSOS.painelProfessor);
  return <Painel sessao={sessao} />;
}
