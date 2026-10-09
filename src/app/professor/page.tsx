import { ListaTurmas } from "@/components/lista-turmas";
import { Painel } from "@/components/painel";
import { Secao } from "@/components/secao";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { listarTurmasDoEscopo } from "@/server/dados/estrutura";

export default async function PainelProfessor() {
  const sessao = await exigirAcessoPagina(RECURSOS.painelProfessor);
  const turmas = await listarTurmasDoEscopo(sessao);
  return (
    <Painel sessao={sessao}>
      <Secao titulo="Turmas que leciono">
        <ListaTurmas turmas={turmas} vazio="Você ainda não leciona nenhuma turma." />
      </Secao>
    </Painel>
  );
}
