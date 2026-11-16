import { Casca } from "@/components/casca";
import { ImportacaoAnterior } from "@/components/importacao-anterior";
import { CabecalhoPagina } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-058 / RF-64 (UC-50): alunos e histórico do sistema anterior por planilha, com prévia e tudo ou nada (RB-49).
// Layout aprovado em docs/layout/prototipo.html#importar-anterior.
export default async function ImportarAnterior() {
  const sessao = await exigirAcessoPagina(RECURSOS.secretaria);
  return (
    <Casca sessao={sessao} ativo="importaranterior">
      <CabecalhoPagina titulo="Importar do sistema anterior" subtitulo="Alunos com a ficha e o histórico de notas do sistema antigo. Nada é gravado antes de confirmar." />
      <ImportacaoAnterior />
    </Casca>
  );
}
