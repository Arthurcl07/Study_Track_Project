import { Casca } from "@/components/casca";
import { RegistroChamada, type TurmaParaChamada } from "@/components/registro-chamada";
import { CabecalhoPagina } from "@/components/ui";
import { hojeEmBrasilia } from "@/domain/atividades";
import { RECURSOS } from "@/domain/autorizacao";
import { abonosDaTurma } from "@/server/academico/chamada";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { deData, turmasParaFrequencia } from "@/server/dados/atividades";

// SPEC-018 / RF-27 (UC-08): chamada por aula nas turmas de período aberto que o professor leciona (RB-03, RB-20).
// A frequência é calculada pelas presenças (RB-21). Layout aprovado em docs/layout/prototipo.html#prof-chamada.
// SPEC-028: de 1 a 4 aulas na data; SPEC-032: falta abonada; SPEC-026: mudar data e excluir aula (#chamada-aulas).
export default async function Chamada() {
  const sessao = await exigirAcessoPagina(RECURSOS.registroFrequenciaAtividades);
  const turmas: TurmaParaChamada[] = await Promise.all(
    (await turmasParaFrequencia(sessao.usuarioId)).map(async (t) => ({
      id: t.id,
      rotulo: `${t.nome} · ${t.disciplina.nome} · ${t.periodo}`,
      estudantes: t.matriculas.map(({ estudante }) => ({
        id: estudante.id,
        nome: estudante.nome,
        matricula: estudante.ficha?.numeroMatricula ?? null,
        percentual: t.frequencias.find((f) => f.estudanteId === estudante.id)?.percentual ?? null,
        situacao: t.indicadores.find((i) => i.estudanteId === estudante.id)?.situacao ?? null,
      })),
      aulas: t.aulas.map((a) => ({ id: a.id, data: deData(a.data), numero: a.numero, presencas: a.presencas })),
      // SPEC-032: intervalos de abono dos estudantes, para mostrar "Abonada".
      abonos: await abonosDaTurma(t.id),
    })),
  );
  return (
    <Casca sessao={sessao} ativo="frequencia">
      <CabecalhoPagina titulo="Chamada" subtitulo="Marque as faltas de cada aula. A frequência é calculada pelas presenças e a situação é recalculada na hora." />
      <RegistroChamada turmas={turmas} hoje={hojeEmBrasilia()} />
    </Casca>
  );
}
