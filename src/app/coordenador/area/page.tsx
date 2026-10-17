import { Casca } from "@/components/casca";
import { CabecalhoPagina, Cartao } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// Página exclusiva de Coordenador — demonstra a negação de acesso no servidor (AC-001-03).
export default async function AreaCoordenacao() {
  const sessao = await exigirAcessoPagina(RECURSOS.areaCoordenacao);
  return (
    <Casca sessao={sessao} ativo="area">
      <CabecalhoPagina titulo="Área da coordenação" subtitulo="Função exclusiva do perfil Coordenador." />
      <Cartao>
        <p className="text-mudo">
          Esta página só abre para Coordenadores. Estudantes e Professores que tentarem acessá-la, pela tela ou
          pela API (<code className="text-texto">/api/coordenacao</code>), recebem acesso negado no servidor.
        </p>
      </Cartao>
    </Casca>
  );
}
