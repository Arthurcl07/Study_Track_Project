import Link from "next/link";
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
      <Link
        href="/professor/notas"
        className="inline-block w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-center font-medium text-white hover:bg-indigo-700 sm:w-auto"
      >
        Lançar e alterar notas
      </Link>
      <Secao titulo="Turmas que leciono">
        <ListaTurmas turmas={turmas} vazio="Você ainda não leciona nenhuma turma." />
      </Secao>
    </Painel>
  );
}
