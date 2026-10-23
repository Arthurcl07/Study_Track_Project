import Link from "next/link";
import { Casca } from "@/components/casca";
import { MediaFrequenciaPorTurma, SituacaoPorTurma } from "@/components/graficos-coordenador";
import { Icone } from "@/components/icones";
import { SeletorCurso } from "@/components/seletor-curso";
import { CabecalhoPagina, Cartao, CartaoNumero, CLASSE_LINK, EstadoVazio } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarPainelCoordenador } from "@/server/academico/painel-coordenador";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-014 / RF-21 (OPEN-029) e SPEC-016 / RF-24: dashboard do coordenador com filtro por curso, totais,
// situação por curso e por turma, média e frequência por turma e turmas que pedem atenção. Mesmos números do
// relatório (SPEC-009), no escopo dos cursos que ele coordena (RB-04).
// Layout aprovado em docs/layout/prototipo.html#dash-coordenador.
export default async function PainelCoordenador({ searchParams }: { searchParams: Promise<{ curso?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.painelCoordenador);
  const { curso } = await searchParams;
  const { cursos, filtro, totais, resumo, porCurso, atencao } = await consultarPainelCoordenador(sessao, curso);
  const sufixo = filtro ? `?curso=${filtro.id}` : "";
  const subtitulo = filtro ? `Visão geral de ${filtro.nome}.` : cursos.length === 1 ? `Visão geral de ${cursos[0].nome}.` : "Visão geral dos cursos que você coordena.";

  if (cursos.length === 0) {
    return (
      <Casca sessao={sessao} ativo="inicio">
        <CabecalhoPagina titulo={`Olá, ${sessao.nome.split(" ")[0]}`} subtitulo="Visão geral dos cursos que você coordena." />
        <EstadoVazio>Você ainda não coordena nenhum curso. O administrador define a coordenação de cada curso.</EstadoVazio>
      </Casca>
    );
  }

  return (
    <Casca sessao={sessao} ativo="inicio">
      <CabecalhoPagina
        titulo={`Olá, ${sessao.nome.split(" ")[0]}`}
        subtitulo={subtitulo}
        acao={cursos.length > 1 && <SeletorCurso cursos={cursos} valor={filtro?.id ?? ""} todos={`Todos os meus cursos (${cursos.length})`} />}
      />
      <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <CartaoNumero rotulo="Cursos" valor={totais.cursos} />
        <CartaoNumero rotulo="Disciplinas" valor={totais.disciplinas} href={`/coordenador/disciplinas${sufixo}`} />
        <CartaoNumero rotulo="Turmas" valor={totais.turmas} href="/coordenador/turmas" />
        <CartaoNumero rotulo="Estudantes" valor={totais.estudantes} />
        <CartaoNumero
          rotulo="■ Em Risco"
          valor={totais.emRisco}
          cor="text-risco"
          detalhe={totais.estudantes > 0 ? `${Math.round((totais.emRisco / totais.estudantes) * 100)}% dos estudantes` : undefined}
          href={`/relatorios?situacao=Risco${filtro ? `&curso=${filtro.id}` : ""}`}
        />
        <CartaoNumero rotulo="Planos ativos" valor={totais.planosAtivos} detalhe={`${totais.riscoSemPlano} em Risco sem plano`} />
      </div>

      {resumo.length === 0 ? (
        <EstadoVazio>
          Nenhuma turma {filtro ? "neste curso" : "nos seus cursos"} ainda.{" "}
          <Link href="/coordenador/turmas" className={CLASSE_LINK}>Cadastrar turma</Link>
        </EstadoVazio>
      ) : (
        <>
          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
            {porCurso.length > 1 ? (
              <Cartao titulo="Situação por curso">
                <SituacaoPorTurma turmas={porCurso} unidade="matrícula(s)" />
              </Cartao>
            ) : (
              <Cartao titulo="Situação por turma">
                <SituacaoPorTurma turmas={resumo} />
              </Cartao>
            )}
            <Cartao titulo="Média e frequência por turma">
              <MediaFrequenciaPorTurma turmas={resumo} />
            </Cartao>
          </div>

          <div className="mt-5 grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
            {porCurso.length > 1 && (
              <Cartao titulo="Situação por turma">
                <SituacaoPorTurma turmas={resumo} />
              </Cartao>
            )}
            <Cartao titulo="Turmas que pedem atenção" className={porCurso.length > 1 ? "" : "xl:col-span-2"}>
              {atencao.length === 0 ? (
                <EstadoVazio>Nenhuma turma com estudante em Risco ou entrega atrasada.</EstadoVazio>
              ) : (
                <table className="tabela-responsiva w-full text-[15px]">
                  <thead>
                    <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                      <th className="pr-2 pb-2.5">Turma</th>
                      <th className="px-2 pb-2.5 text-right">Em Risco</th>
                      <th className="px-2 pb-2.5 text-right">Atrasadas</th>
                      <th className="pb-2.5 pl-2"><span className="sr-only">Ação</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {atencao.map((t) => (
                      <tr key={t.id} className="border-t border-traco">
                        <td data-rotulo="Turma" className="py-3 pr-2">
                          {t.rotulo}
                          {cursos.length > 1 && <span className="block text-sm text-mudo">{t.curso}</span>}
                        </td>
                        <td data-rotulo="Em Risco" className={`px-2 py-3 text-right tabular-nums ${t.contagem.Risco > 0 ? "font-semibold text-risco" : ""}`}>■ {t.contagem.Risco}</td>
                        <td data-rotulo="Entregas atrasadas" className="px-2 py-3 text-right tabular-nums">{t.entregasAtrasadas}</td>
                        <td data-rotulo="Ação" className="py-3 pl-2 text-right">
                          <Link href={`/relatorios?turma=${t.id}&situacao=Risco`} className={`inline-flex items-center gap-1 ${CLASSE_LINK}`}>
                            Relatório <Icone nome="seta" className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Cartao>
          </div>
        </>
      )}
    </Casca>
  );
}
