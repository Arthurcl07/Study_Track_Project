import { Casca } from "@/components/casca";
import { RegistroChamada, type TurmaParaChamada } from "@/components/registro-chamada";
import { CabecalhoPagina } from "@/components/ui";
import { hojeEmBrasilia } from "@/domain/atividades";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { deData, turmasParaFrequencia } from "@/server/dados/atividades";

// SPEC-018 / RF-27 (UC-08): chamada por aula nas turmas de período aberto que o professor leciona (RB-03, RB-20).
// A frequência é calculada pelas presenças (RB-21). Layout aprovado em docs/layout/prototipo.html#prof-chamada.
export default async function Chamada() {
  const sessao = await exigirAcessoPagina(RECURSOS.registroFrequenciaAtividades);
  const turmas: TurmaParaChamada[] = (await turmasParaFrequencia(sessao.usuarioId)).map((t) => ({
    id: t.id,
    rotulo: `${t.nome} · ${t.disciplina.nome} · ${t.periodo}`,
    estudantes: t.matriculas.map(({ estudante }) => ({
      ...estudante,
      percentual: t.frequencias.find((f) => f.estudanteId === estudante.id)?.percentual ?? null,
      situacao: t.indicadores.find((i) => i.estudanteId === estudante.id)?.situacao ?? null,
    })),
    aulas: t.aulas.map((a) => ({ data: deData(a.data), presencas: a.presencas })),
  }));
  return (
    <Casca sessao={sessao} ativo="frequencia">
      <CabecalhoPagina titulo="Chamada" subtitulo="Marque as faltas de cada aula. A frequência é calculada pelas presenças e a situação é recalculada na hora." />
      <RegistroChamada turmas={turmas} hoje={hojeEmBrasilia()} />
    </Casca>
  );
}
