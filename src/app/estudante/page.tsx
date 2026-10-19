import Link from "next/link";
import { AvisoAlerta } from "@/components/alertas";
import { Casca } from "@/components/casca";
import { GraficoEvolucao } from "@/components/grafico-evolucao";
import { PlanosDoEstudante } from "@/components/planos-estudante";
import { CabecalhoPagina, Cartao, CLASSE_LINK, corDaFrequencia, corDaMedia, Etiqueta, formatarDataCurta, SeloEntrega, SeloSituacao } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarPainel } from "@/server/academico/painel";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-007 (RF-10, UC-02) e SPEC-006 (RF-12): painel acadêmico do estudante, só com os próprios dados.
// Layout aprovado em docs/layout/prototipo.html#estudante-painel e #estudante-vazio.
const numero = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

export default async function PainelEstudante() {
  const sessao = await exigirAcessoPagina(RECURSOS.painelEstudante);
  const painel = await consultarPainel(sessao);
  const primeiroNome = sessao.nome.split(" ")[0];

  if (painel.turmas.length === 0) {
    return (
      <Casca sessao={sessao} ativo="inicio">
        <CabecalhoPagina titulo={`Olá, ${primeiroNome}`} subtitulo="Sua situação acadêmica em todas as turmas." />
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

  return (
    <Casca sessao={sessao} ativo="inicio">
      <CabecalhoPagina
        titulo={`Olá, ${primeiroNome}`}
        subtitulo="Sua situação acadêmica em todas as turmas, atualizada a cada nota e frequência lançada."
      />

      {painel.alertas.length > 0 && (
        <div className="mb-5 space-y-3">
          {painel.alertas.map((a) => <AvisoAlerta key={a.turma.id} alerta={a} />)}
        </div>
      )}

      {/* SPEC-012 / RF-19: planos de recuperação do próprio estudante, só leitura. */}
      <PlanosDoEstudante planos={painel.planos} />

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
                <h2 className="mt-2 font-semibold">{t.disciplina}</h2>
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
        <Link href="/estudante/atividades" className={`mt-3 inline-block ${CLASSE_LINK}`}>Ver todas as minhas atividades →</Link>
      </Cartao>
    </Casca>
  );
}
