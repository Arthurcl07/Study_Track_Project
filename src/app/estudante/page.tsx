import { ListaTurmas } from "@/components/lista-turmas";
import { Painel } from "@/components/painel";
import { Secao } from "@/components/secao";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { listarTurmasDoEscopo } from "@/server/dados/estrutura";

export default async function PainelEstudante() {
  const sessao = await exigirAcessoPagina(RECURSOS.painelEstudante);
  const turmas = await listarTurmasDoEscopo(sessao);
  return (
    <Painel sessao={sessao}>
      <Secao titulo="Minhas turmas">
        <ListaTurmas turmas={turmas} vazio="Você ainda não está matriculado em nenhuma turma. Procure a coordenação." />
      </Secao>
    </Painel>
  );
}
