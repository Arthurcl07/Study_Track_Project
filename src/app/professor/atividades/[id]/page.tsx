import { notFound } from "next/navigation";
import { Casca } from "@/components/casca";
import { CorrigirCadastro } from "@/components/corrigir-cadastro";
import { EntregasAtividade, type LinhaEntrega } from "@/components/entregas-atividade";
import { CabecalhoPagina, formatarDataCurta } from "@/components/ui";
import { motivoParaNaoExcluirAtividade } from "@/domain/correcoes";
import { hojeEmBrasilia, statusEntrega } from "@/domain/atividades";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { atividadeDoProfessor, deData } from "@/server/dados/atividades";

// SPEC-005 / RF-09, OPEN-003: entregas de uma atividade de turma que o professor leciona.
// Fora do escopo responde como não encontrada (não revela existência). Layout aprovado em
// docs/layout/prototipo.html#professor-atividade. SPEC-026: editar descrição e prazo e excluir (sem entrega, RB-32).
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
      <div className="grid items-start gap-5 xl:grid-cols-[1.6fr_1fr]">
        <EntregasAtividade atividadeId={atividade.id} linhas={linhas} hoje={hoje} />
        <CorrigirCadastro
          url={`/api/atividades/${atividade.id}`}
          titulo="Editar atividade"
          campos={[
            { nome: "descricao", rotulo: "Descrição", valor: atividade.descricao },
            { nome: "prazo", rotulo: "Prazo", tipo: "date", valor: prazo },
          ]}
          excluir={{
            rotulo: "Excluir atividade",
            confirmacao: `Excluir "${atividade.descricao}"? A exclusão fica registrada na auditoria.`,
            destino: `/professor/atividades?turma=${atividade.turma.id}`,
            motivo: motivoParaNaoExcluirAtividade(atividade.entregas.length),
          }}
        />
      </div>
    </Casca>
  );
}
