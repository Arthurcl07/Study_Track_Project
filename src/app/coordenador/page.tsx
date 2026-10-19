import Link from "next/link";
import { Casca } from "@/components/casca";
import { MediaFrequenciaPorTurma, SituacaoPorTurma } from "@/components/graficos-coordenador";
import { Icone } from "@/components/icones";
import { CabecalhoPagina, Cartao, CLASSE_LINK, EstadoVazio } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarPainelCoordenador } from "@/server/academico/painel-coordenador";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-014 / RF-21 (OPEN-029): painel do coordenador com totais, situação por turma, média e frequência
// por turma e turmas que pedem atenção. Mesmos números do relatório (SPEC-009), no escopo do coordenador.
// Layout aprovado em docs/layout/prototipo.html#coordenador-painel.
export default async function PainelCoordenador() {
  const sessao = await exigirAcessoPagina(RECURSOS.painelCoordenador);
  const { totais, resumo, atencao } = await consultarPainelCoordenador(sessao);

  const cartoes = [
    { rotulo: "Disciplinas", valor: totais.disciplinas, href: "/coordenador/disciplinas", cor: "" },
    { rotulo: "Turmas", valor: totais.turmas, href: "/coordenador/turmas", cor: "" },
    { rotulo: "Estudantes", valor: totais.estudantes, href: "/coordenador/turmas", cor: "" },
    { rotulo: "■ Em Risco", valor: totais.emRisco, href: "/relatorios?situacao=Risco", cor: "text-risco" },
  ];

  return (
    <Casca sessao={sessao} ativo="inicio">
      <CabecalhoPagina titulo={`Olá, ${sessao.nome.split(" ")[0]}`} subtitulo="Visão geral das turmas sob sua responsabilidade." />
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cartoes.map((c) => (
          <Link
            key={c.rotulo}
            href={c.href}
            className="group rounded-2xl border border-traco bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition-colors hover:border-azul"
          >
            <span className="text-sm text-mudo">{c.rotulo}</span>
            <strong className={`mt-1 block text-3xl font-bold tabular-nums ${c.cor}`}>{c.valor}</strong>
          </Link>
        ))}
      </div>

      {resumo.length === 0 ? (
        <EstadoVazio>
          Nenhuma turma sob sua responsabilidade ainda.{" "}
          <Link href="/coordenador/turmas" className={CLASSE_LINK}>Cadastrar turma</Link>
        </EstadoVazio>
      ) : (
        <>
          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
            <Cartao titulo="Situação por turma">
              <SituacaoPorTurma turmas={resumo} />
            </Cartao>
            <Cartao titulo="Média e frequência por turma">
              <MediaFrequenciaPorTurma turmas={resumo} />
            </Cartao>
          </div>

          <Cartao titulo="Turmas que pedem atenção" className="mt-5">
            {atencao.length === 0 ? (
              <EstadoVazio>Nenhuma turma com estudante em Risco ou entrega atrasada.</EstadoVazio>
            ) : (
              <table className="tabela-responsiva w-full text-[15px]">
                <thead>
                  <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                    <th className="pr-2 pb-2.5">Turma</th>
                    <th className="px-2 pb-2.5 text-right">Em Risco</th>
                    <th className="px-2 pb-2.5 text-right">Entregas atrasadas</th>
                    <th className="pb-2.5 pl-2"><span className="sr-only">Ação</span></th>
                  </tr>
                </thead>
                <tbody>
                  {atencao.map((t) => (
                    <tr key={t.id} className="border-t border-traco">
                      <td data-rotulo="Turma" className="py-3 pr-2">{t.rotulo}</td>
                      <td data-rotulo="Em Risco" className={`px-2 py-3 text-right tabular-nums ${t.contagem.Risco > 0 ? "font-semibold text-risco" : ""}`}>■ {t.contagem.Risco}</td>
                      <td data-rotulo="Entregas atrasadas" className="px-2 py-3 text-right tabular-nums">{t.entregasAtrasadas}</td>
                      <td data-rotulo="Ação" className="py-3 pl-2 text-right">
                        <Link href={`/relatorios?turma=${t.id}&situacao=Risco`} className={`inline-flex items-center gap-1 ${CLASSE_LINK}`}>
                          Ver no relatório <Icone nome="seta" className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Cartao>
        </>
      )}
    </Casca>
  );
}
