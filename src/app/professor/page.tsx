import Link from "next/link";
import { TabelaAlertasProfessor } from "@/components/alertas";
import { Casca } from "@/components/casca";
import { BarraProgresso } from "@/components/dashboard";
import { MediaFrequenciaPorTurma, SituacaoPorTurma } from "@/components/graficos-coordenador";
import { Icone } from "@/components/icones";
import { ListaTurmas } from "@/components/lista-turmas";
import { CabecalhoPagina, Cartao, CartaoNumero, CLASSE_BOTAO_PRIMARIO, CLASSE_LINK, EstadoVazio, formatarDataCurta } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarDashboardProfessor } from "@/server/academico/dashboard";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-016 (RF-24, UC-16): dashboard do professor, só com as turmas que leciona (RB-03). Os números por turma são
// os do relatório (INV-016-02); alertas da SPEC-006 e planos da SPEC-008.
// Layout aprovado em docs/layout/prototipo.html#dash-professor.
export default async function DashboardProfessor() {
  const sessao = await exigirAcessoPagina(RECURSOS.painelProfessor);
  const painel = await consultarDashboardProfessor(sessao);
  const { totais } = painel;
  const acao = (
    <Link href="/professor/notas" className={CLASSE_BOTAO_PRIMARIO}>
      <Icone nome="lapis" className="h-4 w-4" />
      Lançar notas
    </Link>
  );

  if (painel.turmas.length === 0) {
    return (
      <Casca sessao={sessao} ativo="inicio">
        <CabecalhoPagina titulo={`Olá, ${sessao.nome.split(" ")[0]}`} subtitulo="Suas turmas e os números atualizados." />
        <EstadoVazio>Você ainda não leciona nenhuma turma. A coordenação do curso define o professor de cada turma.</EstadoVazio>
      </Casca>
    );
  }

  return (
    <Casca sessao={sessao} ativo="inicio">
      <CabecalhoPagina titulo={`Olá, ${sessao.nome.split(" ")[0]}`} subtitulo="Suas turmas, com os números atualizados." acao={acao} />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <CartaoNumero rotulo="Turmas" valor={totais.turmas} detalhe={`${totais.cursos} curso(s)`} />
        <CartaoNumero rotulo="Estudantes" valor={totais.estudantes} />
        <CartaoNumero rotulo="■ Em Risco" valor={totais.emRisco} cor="text-risco" detalhe={`▲ ${totais.emAtencao} em Atenção`} href="/relatorios?situacao=Risco" />
        <CartaoNumero rotulo="Entregas atrasadas" valor={totais.entregasAtrasadas} href="/professor/atividades" />
        <CartaoNumero
          rotulo="Planos ativos"
          valor={totais.planosAtivos}
          detalhe={totais.progressoMedio === null ? "nenhum plano ativo" : `progresso médio ${totais.progressoMedio}%`}
        />
      </div>

      <TabelaAlertasProfessor alertas={painel.alertas} limite={5} verTodos="/relatorios?situacao=Risco" />

      <div className="mb-5 grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
        <Cartao titulo="Situação por turma">
          <SituacaoPorTurma turmas={painel.resumo} />
        </Cartao>
        <Cartao titulo="Média e frequência por turma">
          <MediaFrequenciaPorTurma turmas={painel.resumo} />
        </Cartao>
      </div>

      <div className="mb-5 grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
        <Cartao titulo="Próximos prazos" acao={<span className="text-[13px] text-mudo">próximos 7 dias</span>}>
          {painel.proximosPrazos.length === 0 ? (
            <p className="text-mudo">Nenhuma atividade com prazo nos próximos 7 dias.</p>
          ) : (
            <table className="tabela-responsiva w-full text-[15px]">
              <thead>
                <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                  <th className="pr-2 pb-2.5">Atividade</th>
                  <th className="px-2 pb-2.5">Prazo</th>
                  <th className="pb-2.5 pl-2 text-right">Entregues</th>
                </tr>
              </thead>
              <tbody>
                {painel.proximosPrazos.map((a) => (
                  <tr key={a.id} className="border-t border-traco">
                    <td data-rotulo="Atividade" className="py-3 pr-2">
                      <Link href={`/professor/atividades/${a.id}`} className={CLASSE_LINK}>{a.descricao}</Link>
                      <span className="block text-sm text-mudo">{a.turma}</span>
                    </td>
                    <td data-rotulo="Prazo" className="px-2 py-3 tabular-nums">{formatarDataCurta(a.prazo)}</td>
                    <td data-rotulo="Entregues" className="py-3 pl-2 text-right tabular-nums">{a.entregues} de {a.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Cartao>
        <Cartao titulo={`Planos de recuperação ativos (${painel.planos.length})`}>
          {painel.planos.length === 0 ? (
            <p className="text-mudo">Nenhum plano ativo.</p>
          ) : (
            <ul className="space-y-4">
              {painel.planos.map((p) => (
                <li key={p.id}>
                  <div className="mb-1.5 flex justify-between gap-2 text-sm">
                    <span><strong className="font-semibold">{p.estudante}</strong> · {p.turma}</span>
                    <Link href={`/professor/planos/${p.id}`} className={CLASSE_LINK}>Abrir</Link>
                  </div>
                  <BarraProgresso percentual={p.progresso.percentual} />
                </li>
              ))}
            </ul>
          )}
          {painel.semPlano.length > 0 && (
            <p className="mt-4 text-[13px] text-mudo">
              {painel.semPlano.length} estudante(s) em Risco ainda sem plano: {painel.semPlano.slice(0, 3).map((s) => `${s.estudante} (${s.turma})`).join(", ")}
              {painel.semPlano.length > 3 ? " e outros" : ""}.
            </p>
          )}
        </Cartao>
      </div>

      <h2 className="mb-3 text-[17px] font-semibold">Minhas turmas</h2>
      <ListaTurmas turmas={painel.turmas} vazio="Você ainda não leciona nenhuma turma." linkTurma={(id) => `/professor/turmas/${id}`} />
    </Casca>
  );
}
