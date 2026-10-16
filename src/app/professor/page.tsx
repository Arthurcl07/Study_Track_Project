import Link from "next/link";
import { TabelaAlertasProfessor } from "@/components/alertas";
import { Casca } from "@/components/casca";
import { Icone } from "@/components/icones";
import { ListaTurmas } from "@/components/lista-turmas";
import { CabecalhoPagina, CLASSE_BOTAO_PRIMARIO } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarAlertas } from "@/server/academico/painel";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { listarTurmasDoEscopo } from "@/server/dados/estrutura";

// SPEC-002 e SPEC-006 (alertas das turmas que leciona) — layout aprovado em docs/layout/prototipo.html#professor-inicio.
export default async function PainelProfessor() {
  const sessao = await exigirAcessoPagina(RECURSOS.painelProfessor);
  const [turmas, alertas] = await Promise.all([listarTurmasDoEscopo(sessao), consultarAlertas(sessao)]);
  return (
    <Casca sessao={sessao} ativo="inicio">
      <CabecalhoPagina
        titulo="Turmas que leciono"
        subtitulo="Suas turmas e os estudantes matriculados."
        acao={
          <Link href="/professor/notas" className={CLASSE_BOTAO_PRIMARIO}>
            <Icone nome="lapis" className="h-4 w-4" />
            Lançar e alterar notas
          </Link>
        }
      />
      <TabelaAlertasProfessor alertas={alertas} />
      <ListaTurmas turmas={turmas} vazio="Você ainda não leciona nenhuma turma." linkTurma={(id) => `/professor/turmas/${id}`} />
    </Casca>
  );
}
