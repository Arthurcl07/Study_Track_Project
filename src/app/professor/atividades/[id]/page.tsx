import { notFound } from "next/navigation";
import { Casca } from "@/components/casca";
import { EntregasAtividade, type LinhaEntrega } from "@/components/entregas-atividade";
import { CabecalhoPagina, formatarDataCurta } from "@/components/ui";
import { hojeEmBrasilia, statusEntrega } from "@/domain/atividades";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { atividadeDoProfessor, deData } from "@/server/dados/atividades";

// SPEC-005 / RF-09, OPEN-003: entregas de uma atividade de turma que o professor leciona.
// Fora do escopo responde como não encontrada (não revela existência). Layout aprovado em
// docs/layout/prototipo.html#professor-atividade.
export default async function EntregasDaAtividade({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.registroFrequenciaAtividades);
  const { id } = await params;
  const atividade = await atividadeDoProfessor(sessao.usuarioId, id);
  if (!atividade) notFound();

  const hoje = hojeEmBrasilia();
  const prazo = deData(atividade.prazo);
  const linhas: LinhaEntrega[] = atividade.turma.matriculas.map(({ estudante }) => {
    const registro = atividade.entregas.find((e) => e.estudanteId === estudante.id);
    const entrega = registro ? { id: registro.id, dataEntrega: deData(registro.dataEntrega) } : null;
    return { estudanteId: estudante.id, nome: estudante.nome, status: statusEntrega(prazo, entrega?.dataEntrega ?? null, hoje), entrega };
  });

  return (
    <Casca sessao={sessao} ativo="atividades">
      <CabecalhoPagina
        titulo={atividade.descricao}
        subtitulo={`${atividade.turma.nome} · ${atividade.turma.disciplina.nome} · prazo ${formatarDataCurta(prazo)} (até 23:59)`}
        voltar={{ href: `/professor/atividades?turma=${atividade.turma.id}`, rotulo: "Atividades" }}
      />
      <EntregasAtividade atividadeId={atividade.id} linhas={linhas} hoje={hoje} />
    </Casca>
  );
}
