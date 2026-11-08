import { Casca } from "@/components/casca";
import { LancamentoNotas, type TurmaParaLancamento } from "@/components/lancamento-notas";
import { CabecalhoPagina } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { turmasParaLancamento } from "@/server/dados/notas";

// SPEC-004 / UC-03: lançamento e alteração de notas e cadastro de avaliação, só nas turmas que o professor leciona.
// Layout aprovado em docs/layout/prototipo.html#professor-notas. SPEC-026/029: tipo da avaliação, editar, excluir e
// lançamento do exame só para quem está em exame (#correcao-avaliacao e #avaliacao-tipos).
export default async function NotasDoProfessor() {
  const sessao = await exigirAcessoPagina(RECURSOS.registroDesempenho);
  const turmas: TurmaParaLancamento[] = (await turmasParaLancamento(sessao.usuarioId)).map((t) => ({
    id: t.id,
    rotulo: `${t.nome} · ${t.disciplina.nome} · ${t.periodo}`,
    avaliacoes: t.avaliacoes.map((a) => ({ ...a, data: a.data.toISOString() })),
    estudantes: t.matriculas.map(({ estudante: e }) => {
      const indicador = t.indicadores.find((i) => i.estudanteId === e.id);
      return { id: e.id, nome: e.nome, matricula: e.ficha?.numeroMatricula ?? null, media: indicador?.media ?? null, frequencia: indicador?.frequenciaAtual ?? null };
    }),
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
