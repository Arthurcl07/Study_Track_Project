import Link from "next/link";
import { LancamentoNotas, type TurmaParaLancamento } from "@/components/lancamento-notas";
import { Painel } from "@/components/painel";
import { Secao } from "@/components/secao";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { turmasParaLancamento } from "@/server/dados/notas";

// SPEC-004 / UC-03: lançamento e alteração de notas e cadastro de avaliação, só nas turmas que o professor leciona.
export default async function NotasDoProfessor() {
  const sessao = await exigirAcessoPagina(RECURSOS.registroDesempenho);
  const turmas: TurmaParaLancamento[] = (await turmasParaLancamento(sessao.usuarioId)).map((t) => ({
    id: t.id,
    rotulo: `${t.nome} · ${t.disciplina.nome} · ${t.periodo}`,
    avaliacoes: t.avaliacoes.map((a) => ({ ...a, data: a.data.toISOString() })),
    estudantes: t.matriculas.map((m) => m.estudante),
  }));
  return (
    <Painel sessao={sessao}>
      <Link href="/professor" className="text-sm text-indigo-700 underline">Voltar ao painel</Link>
      <Secao titulo="Notas e avaliações">
        <LancamentoNotas turmas={turmas} />
      </Secao>
    </Painel>
  );
}
