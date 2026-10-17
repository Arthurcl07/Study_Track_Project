import { notFound } from "next/navigation";
import { Casca } from "@/components/casca";
import { EncerrarPlano, ItensPlano } from "@/components/itens-plano";
import { CabecalhoPagina, Cartao, corDaFrequencia, corDaMedia, formatarNumero as numero, Mensagem } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarPlano } from "@/server/academico/planos";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-008 / RF-14: plano de recuperação de um estudante de turma que o professor leciona.
// Layout aprovado em docs/layout/prototipo.html#professor-plano.
const ROTULO_SITUACAO = { Normal: "● Normal", Atencao: "▲ Atenção", Risco: "■ Risco" } as const;

const data = (d: Date) => d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

export default async function PlanoDeRecuperacao({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.planoRecuperacao);
  const { id } = await params;
  const plano = await consultarPlano(id, sessao.usuarioId);
  if (!plano) notFound();

  const ativo = plano.status === "Ativo";
  const situacao = plano.indicador?.situacao ?? null;
  const media = plano.indicador?.media ?? null;
  const frequencia = plano.indicador?.frequenciaAtual ?? null;
  const subtitulo = ativo
    ? `${plano.turma.nome} · ${plano.turma.disciplina.nome} · criado em ${data(plano.criadoEm)} · Ativo`
    : `${plano.turma.nome} · ${plano.turma.disciplina.nome} · criado em ${data(plano.criadoEm)} · Encerrado em ${data(plano.encerradoEm ?? plano.criadoEm)}`;

  return (
    <Casca sessao={sessao} ativo="inicio">
      <CabecalhoPagina
        titulo={`Plano de recuperação · ${plano.estudante.nome}`}
        subtitulo={subtitulo}
        voltar={{ href: `/professor/turmas/${plano.turma.id}`, rotulo: plano.turma.nome }}
        acao={ativo ? <EncerrarPlano planoId={plano.id} /> : undefined}
      />

      {/* OPEN-012: o plano continua até o professor encerrar, mesmo que o estudante saia do Risco. */}
      {ativo && situacao && situacao !== "Risco" && (
        <div className="mb-4">
          <Mensagem tipo="info">
            Situação atual: {ROTULO_SITUACAO[situacao]} — o estudante saiu do Risco. Você pode encerrar o plano quando achar adequado.
          </Mensagem>
        </div>
      )}
      {!ativo && (
        <div className="mb-4">
          <Mensagem tipo="info">Plano encerrado: os itens ficam disponíveis só para consulta.</Mensagem>
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Cartao titulo={`Itens previstos (${plano.progresso.concluidos} de ${plano.progresso.total} concluídos)`}>
          <ItensPlano
            ativo={ativo}
            itens={plano.itens.map((i) => ({ ...i, concluidoEm: i.concluidoEm ? i.concluidoEm.toISOString() : null }))}
          />
        </Cartao>

        <Cartao titulo="Progresso">
          <strong className="block text-4xl font-bold tabular-nums">{plano.progresso.percentual}%</strong>
          <div
            className="mt-3 mb-3 h-2.5 overflow-hidden rounded-full bg-nevoa"
            role="progressbar"
            aria-valuenow={plano.progresso.percentual}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso do plano"
          >
            <span className="block h-full rounded-full bg-azul" style={{ width: `${plano.progresso.percentual}%` }} />
          </div>
          <p className="text-sm text-mudo">Progresso = itens concluídos ÷ itens previstos (RB-12).</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-traco pt-4">
            <div>
              <dt className="text-sm text-mudo">Média</dt>
              <dd className={`text-2xl font-semibold tabular-nums ${corDaMedia(media)}`}>{media === null ? "—" : numero(media)}</dd>
            </div>
            <div>
              <dt className="text-sm text-mudo">Frequência</dt>
              <dd className={`text-2xl font-semibold tabular-nums ${corDaFrequencia(frequencia)}`}>
                {frequencia === null ? "—" : `${numero(frequencia)}%`}
              </dd>
            </div>
          </dl>
        </Cartao>
      </div>
    </Casca>
  );
}
