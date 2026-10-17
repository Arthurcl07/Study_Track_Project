import { AtividadesTurma, type TurmaComAtividades } from "@/components/atividades-turma";
import { Casca } from "@/components/casca";
import { CabecalhoPagina } from "@/components/ui";
import { hojeEmBrasilia, statusEntrega } from "@/domain/atividades";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { deData, turmasComAtividades } from "@/server/dados/atividades";

// SPEC-005 / RF-08, RF-09: atividades das turmas que o professor leciona (RB-03).
// Layout aprovado em docs/layout/prototipo.html#professor-atividades.
export default async function AtividadesDoProfessor({ searchParams }: { searchParams: Promise<{ turma?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.registroFrequenciaAtividades);
  const { turma: turmaInicial } = await searchParams;
  const hoje = hojeEmBrasilia();
  const turmas: TurmaComAtividades[] = (await turmasComAtividades(sessao.usuarioId)).map((t) => ({
    id: t.id,
    rotulo: `${t.nome} · ${t.disciplina.nome} · ${t.periodo}`,
    totalEstudantes: t.matriculas.length,
    atividades: t.atividades.map((a) => {
      const prazo = deData(a.prazo);
      const status = t.matriculas.map(({ estudanteId }) => {
        const entrega = a.entregas.find((e) => e.estudanteId === estudanteId);
        return statusEntrega(prazo, entrega ? deData(entrega.dataEntrega) : null, hoje);
      });
      return {
        id: a.id,
        descricao: a.descricao,
        prazo,
        entregues: t.matriculas.filter(({ estudanteId }) => a.entregas.some((e) => e.estudanteId === estudanteId)).length,
        atrasadas: status.filter((s) => s === "Atrasada").length,
      };
    }),
  }));
  return (
    <Casca sessao={sessao} ativo="atividades">
      <CabecalhoPagina
        titulo="Atividades"
        subtitulo="Atividades da turma com prazo. Clique em uma atividade para registrar as entregas."
      />
      <AtividadesTurma turmas={turmas} turmaInicial={turmaInicial} />
    </Casca>
  );
}
