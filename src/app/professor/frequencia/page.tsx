import { Casca } from "@/components/casca";
import { RegistroFrequencia, type TurmaParaFrequencia } from "@/components/registro-frequencia";
import { CabecalhoPagina } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { turmasParaFrequencia } from "@/server/dados/atividades";

// SPEC-005 / RF-07: frequência dos estudantes das turmas que o professor leciona (RB-03).
// Layout aprovado em docs/layout/prototipo.html#professor-frequencia.
export default async function FrequenciaDoProfessor() {
  const sessao = await exigirAcessoPagina(RECURSOS.registroFrequenciaAtividades);
  const turmas: TurmaParaFrequencia[] = (await turmasParaFrequencia(sessao.usuarioId)).map((t) => ({
    id: t.id,
    rotulo: `${t.nome} · ${t.disciplina.nome} · ${t.periodo}`,
    estudantes: t.matriculas.map(({ estudante }) => ({
      ...estudante,
      percentual: t.frequencias.find((f) => f.estudanteId === estudante.id)?.percentual ?? null,
      situacao: t.indicadores.find((i) => i.estudanteId === estudante.id)?.situacao ?? null,
    })),
  }));
  return (
    <Casca sessao={sessao} ativo="frequencia">
      <CabecalhoPagina
        titulo="Frequência"
        subtitulo="Registre o percentual de frequência de cada estudante. A situação é recalculada na hora."
      />
      <RegistroFrequencia turmas={turmas} />
    </Casca>
  );
}
