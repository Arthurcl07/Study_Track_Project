import { Casca } from "@/components/casca";
import { FormularioInstituicao } from "@/components/formulario-instituicao";
import { CabecalhoPagina } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { obterInstituicao } from "@/server/academico/secretaria";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-033 / RF-42 (UC-31): dados da instituição usados no cabeçalho e na assinatura dos documentos (secretaria).
// Layout aprovado em docs/layout/prototipo.html#instituicao.
export default async function PaginaInstituicao() {
  const sessao = await exigirAcessoPagina(RECURSOS.secretaria);
  const instituicao = await obterInstituicao();
  return (
    <Casca sessao={sessao} ativo="instituicao">
      <CabecalhoPagina titulo="Instituição" subtitulo="Estes dados aparecem no cabeçalho e na assinatura do boletim e do histórico." />
      <FormularioInstituicao instituicao={instituicao} />
    </Casca>
  );
}
