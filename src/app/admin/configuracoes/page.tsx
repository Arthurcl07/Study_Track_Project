import Link from "next/link";
import { Casca } from "@/components/casca";
import { RegrasAvaliacao } from "@/components/regras-avaliacao";
import { CabecalhoPagina, CLASSE_LINK } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { textoDaRegra } from "@/domain/situacao-academica";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { regraVigente } from "@/server/dados/regras";

// SPEC-052 / RF-61 (UC-47): a secretaria configura as regras de avaliação. Layout aprovado em
// docs/layout/prototipo.html#config-regras.
export default async function Configuracoes() {
  const sessao = await exigirAcessoPagina(RECURSOS.secretaria);
  const regra = await regraVigente();
  return (
    <Casca sessao={sessao} ativo="configuracoes">
      <CabecalhoPagina
        titulo="Configurações"
        subtitulo={`Regras de avaliação em vigor: ${textoDaRegra(regra)}.`}
        acao={<Link href="/admin/instituicao" className={CLASSE_LINK}>Dados da instituição →</Link>}
      />
      <RegrasAvaliacao atual={regra} />
    </Casca>
  );
}
