import Link from "next/link";
import { AvisoAlerta } from "@/components/alertas";
import { Casca } from "@/components/casca";
import { ListaPrazos } from "@/components/dashboard";
import { GraficoEvolucao } from "@/components/grafico-evolucao";
import { MediaFrequenciaPorTurma } from "@/components/graficos-coordenador";
import { PlanosDoEstudante } from "@/components/planos-estudante";
import {
  CabecalhoPagina, Cartao, CartaoNumero, CLASSE_LINK, corDaFrequencia, corDaMedia, Etiqueta, formatarDataCurta, formatarNumero as numero,
  SeloEntrega, SeloSituacao,
} from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarDashboardEstudante } from "@/server/academico/dashboard";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-016 (RF-24, UC-16): dashboard do estudante, só com os próprios dados (RB-02). Reúne o painel da SPEC-007
// (turmas, evolução e atividades), os alertas (SPEC-006) e o plano (SPEC-012), com o curso (SPEC-015), a média e a
// frequência gerais e os próximos prazos (OPEN-035). Layout aprovado em docs/layout/prototipo.html#dash-estudante.
export default async function DashboardEstudante() {
  const sessao = await exigirAcessoPagina(RECURSOS.painelEstudante);
  const painel = await consultarDashboardEstudante(sessao);
  const primeiroNome = sessao.nome.split(" ")[0];
  const subtitulo = painel.curso ? `${painel.curso} · sua situação acadêmica, atualizada a cada nota, frequência e entrega.` : "Sua situação acadêmica em todas as turmas.";

  if (painel.turmas.length === 0) {
    return (
      <Casca sessao={sessao} ativo="inicio">
        <CabecalhoPagina titulo={`Olá, ${primeiroNome}`} subtitulo={subtitulo} />
        <Cartao>
          <div className="px-4 py-8 text-center">
            <p className="text-3xl" aria-hidden="true">🎓</p>
            <p className="mt-2 font-semibold">Você ainda não está matriculado em nenhuma turma.</p>
            <p className="mt-1 text-mudo">Procure a coordenação do seu curso para fazer a matrícula.</p>
          </div>
        </Cartao>
      </Casca>
    );
  }

  const { resumo } = painel;
  const comNota = painel.turmas.filter((t) => t.media !== null).length;
  return (
    <Casca sessao={sessao} ativo="inicio">
      <CabecalhoPagina titulo={`Olá, ${primeiroNome}`} subtitulo={subtitulo} />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <CartaoNumero
          rotulo="Média geral"
          valor={resumo.mediaGeral === null ? "—" : numero(resumo.mediaGeral)}
          cor={corDaMedia(resumo.mediaGeral)}
          detalhe={comNota === 0 ? "nenhuma nota ainda" : `média das ${comNota} turma(s) com nota`}
        />
        <CartaoNumero
          rotulo="Frequência geral"
          valor={resumo.frequenciaGeral === null ? "—" : `${numero(resumo.frequenciaGeral)}%`}
          cor={corDaFrequencia(resumo.frequenciaGeral)}
          detalhe="abaixo de 75% é Risco"
        />
        <CartaoNumero
          rotulo="Situação nas turmas"
          valor={
            resumo.turmasEmRisco + resumo.turmasEmAtencao === 0 ? (
              <span className="text-normal">● Normal</span>
            ) : (
              <span className="flex flex-wrap gap-x-3">
                {resumo.turmasEmRisco > 0 && <span className="text-risco">■ {resumo.turmasEmRisco}</span>}
                {resumo.turmasEmAtencao > 0 && <span className="text-atencao">▲ {resumo.turmasEmAtencao}</span>}
              </span>
            )
          }
          detalhe={`${resumo.turmasEmRisco} em Risco, ${resumo.turmasEmAtencao} em Atenção`}
        />
        <CartaoNumero
          rotulo="Atividades"
          valor={resumo.pendentes + resumo.atrasadas}
          detalhe={
            <>
              <span className={resumo.atrasadas > 0 ? "font-semibold text-risco" : ""}>{resumo.atrasadas} atrasada(s)</span> · {resumo.pendentes} pendente(s)
            </>
          }
          href="/estudante/atividades"
        />
      </div>

      {painel.alertas.length > 0 && (
        <div className="mb-5 space-y-3">
          {painel.alertas.map((a) => <AvisoAlerta key={a.turma.id} alerta={a} />)}
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
        <Cartao titulo="Média e frequência por disciplina">
          <MediaFrequenciaPorTurma
            descricao="Média e frequência por disciplina"
            turmas={painel.turmas.map((t) => ({ id: t.id, rotulo: t.disciplina, mediaTurma: t.media, frequenciaMedia: t.frequencia }))}
          />
        </Cartao>
        <Cartao titulo="Próximos prazos" acao={<span className="text-[13px] text-mudo">próximos 7 dias</span>}>
          <ListaPrazos
            hoje={painel.hoje}
            vazio="Nenhuma entrega pendente nos próximos 7 dias. 👏"
            itens={painel.proximosPrazos.map((a) => ({ id: a.id, titulo: a.descricao, detalhe: a.disciplina, prazo: a.prazo }))}
          />
          <Link href="/estudante/atividades" className={`mt-3 inline-block ${CLASSE_LINK}`}>Ver todas as minhas atividades →</Link>
        </Cartao>
      </div>

      {/* SPEC-012 / RF-19: planos de recuperação do próprio estudante, só leitura. */}
      <PlanosDoEstudante planos={painel.planos} />

      <h2 className="mt-2 mb-3 text-[17px] font-semibold">Minhas turmas</h2>
      <div className="grid gap-5 lg:grid-cols-2">
        {painel.turmas.map((t) => (
          <section
            key={t.id}
            className={`rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)] ${
              t.alerta === "Risco"
                ? "border-red-300 shadow-[inset_4px_0_0_var(--color-risco)]"
                : t.alerta === "Atencao"
                  ? "border-amber-300 shadow-[inset_4px_0_0_var(--color-atencao)]"
                  : "border-traco"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <Etiqueta>{t.periodo}</Etiqueta>
                <h3 className="mt-2 font-semibold">{t.disciplina}</h3>
                <p className="mt-0.5 text-sm text-mudo">{t.nome} · Prof. {t.professor}</p>
              </div>
              {t.situacao ? <SeloSituacao situacao={t.situacao} /> : <span className="text-sm text-mudo">Sem dados ainda</span>}
            </div>
            <dl className="my-4 grid grid-cols-3 gap-2.5">
              {[
                { rotulo: "Média", valor: t.media === null ? "—" : numero(t.media), cor: corDaMedia(t.media) },
                { rotulo: "Frequência", valor: t.frequencia === null ? "—" : `${numero(t.frequencia)}%`, cor: corDaFrequencia(t.frequencia) },
                { rotulo: "Avaliações", valor: String(t.avaliacoesComNota), cor: "" },
              ].map((m) => (
                <div key={m.rotulo} className="rounded-[10px] bg-nevoa px-3 py-2">
                  <dt className="text-xs text-mudo">{m.rotulo}</dt>
                  <dd className={`text-xl font-semibold tabular-nums ${m.cor}`}>{m.valor}</dd>
                </div>
              ))}
            </dl>
            <p className="mb-1 text-xs text-mudo">Evolução das notas</p>
            <GraficoEvolucao pontos={t.evolucao} />
          </section>
        ))}
      </div>

      <Cartao titulo="Atividades que pedem atenção" className="mt-5">
        {painel.atividadesEmAtencao.length === 0 ? (
          <p className="text-mudo">Nenhuma atividade pendente ou atrasada. 👏</p>
        ) : (
          <table className="tabela-responsiva w-full text-[15px]">
            <thead>
              <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                <th className="pb-2.5">Atividade</th>
                <th className="pb-2.5">Disciplina</th>
                <th className="pb-2.5">Prazo</th>
                <th className="pb-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {painel.atividadesEmAtencao.map((a) => (
                <tr key={a.id} className="border-t border-traco">
                  <td data-rotulo="Atividade" className="py-3 pr-2">{a.descricao}</td>
                  <td data-rotulo="Disciplina" className="py-3 pr-2">{a.disciplina}</td>
                  <td data-rotulo="Prazo" className="py-3 pr-2 tabular-nums">{formatarDataCurta(a.prazo)}</td>
                  <td data-rotulo="Status" className="py-3"><SeloEntrega status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Cartao>
    </Casca>
  );
}
