import { Casca } from "@/components/casca";
import { ListaTurmas } from "@/components/lista-turmas";
import { CabecalhoPagina } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { listarTurmasDoEscopo } from "@/server/dados/estrutura";

// SPEC-002 — layout aprovado em docs/layout/prototipo.html#estudante-inicio.
export default async function PainelEstudante() {
  const sessao = await exigirAcessoPagina(RECURSOS.painelEstudante);
  const turmas = await listarTurmasDoEscopo(sessao);
  return (
    <Casca sessao={sessao} ativo="inicio">
      <CabecalhoPagina titulo="Minhas turmas" subtitulo="Turmas em que você está matriculado." />
      <ListaTurmas turmas={turmas} vazio="Você ainda não está matriculado em nenhuma turma. Procure a coordenação." />
    </Casca>
  );
}
