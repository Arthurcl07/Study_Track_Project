import { Casca } from "@/components/casca";
import { LancamentoNotas, type TurmaParaLancamento } from "@/components/lancamento-notas";
import { CabecalhoPagina } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { turmasParaLancamento } from "@/server/dados/notas";

// SPEC-004 / UC-03: lançamento e alteração de notas e cadastro de avaliação, só nas turmas que o professor leciona.
// Layout aprovado em docs/layout/prototipo.html#professor-notas.
export default async function NotasDoProfessor() {
  const sessao = await exigirAcessoPagina(RECURSOS.registroDesempenho);
  const turmas: TurmaParaLancamento[] = (await turmasParaLancamento(sessao.usuarioId)).map((t) => ({
    id: t.id,
    rotulo: `${t.nome} · ${t.disciplina.nome} · ${t.periodo}`,
    avaliacoes: t.avaliacoes.map((a) => ({ ...a, data: a.data.toISOString() })),
    estudantes: t.matriculas.map((m) => m.estudante),
  }));
  return (
    <Casca sessao={sessao} ativo="notas">
      <CabecalhoPagina
        titulo="Notas e avaliações"
        subtitulo="Escolha a turma e a avaliação; clique no estudante para lançar ou alterar a nota."
      />
      <LancamentoNotas turmas={turmas} />
    </Casca>
  );
}
