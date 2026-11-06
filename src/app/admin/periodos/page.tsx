import { AcaoPeriodo } from "@/components/acao-periodo";
import { Casca } from "@/components/casca";
import { FormularioApi } from "@/components/formulario-api";
import { SeloPeriodo } from "@/components/selo-periodo";
import { CabecalhoPagina, Cartao, EstadoVazio } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { listarPeriodos } from "@/server/academico/periodos";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-017 / RF-26 (UC-17): períodos letivos, só para o Administrador. Encerrar torna as turmas do período
// somente leitura (RB-20). Layout aprovado em docs/layout/prototipo.html#admin-periodos.
export default async function Periodos() {
  const sessao = await exigirAcessoPagina(RECURSOS.gestaoPeriodos);
  const periodos = await listarPeriodos();

  return (
    <Casca sessao={sessao} ativo="periodos">
      <CabecalhoPagina
        titulo="Períodos letivos"
        subtitulo="Cada turma pertence a um período. Encerrar um período deixa as turmas dele somente leitura: ninguém lança nota, chamada, atividade ou plano."
      />
      <div className="grid items-start gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Cartao titulo={`Períodos (${periodos.length})`}>
          {periodos.length === 0 ? (
            <EstadoVazio>Nenhum período cadastrado ainda.</EstadoVazio>
          ) : (
            <table className="tabela-responsiva w-full text-[15px]">
              <thead>
                <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                  <th className="pr-2 pb-2.5">Período</th>
                  <th className="px-2 pb-2.5">Situação</th>
                  <th className="px-2 pb-2.5 text-right">Turmas</th>
                  <th className="pb-2.5 pl-2"><span className="sr-only">Ação</span></th>
                </tr>
              </thead>
              <tbody>
                {periodos.map((p) => (
                  <tr key={p.id} className="border-t border-traco">
                    <td data-rotulo="Período" className="py-3 pr-2">
                      <span className="font-semibold">{p.nome}</span>
                      {p.encerradoEm && (
                        <span className="block text-xs text-mudo">encerrado em {p.encerradoEm.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}</span>
                      )}
                    </td>
                    <td data-rotulo="Situação" className="px-2 py-3"><SeloPeriodo aberto={p.status === "Aberto"} /></td>
                    <td data-rotulo="Turmas" className="px-2 py-3 text-right tabular-nums">{p._count.turmas}</td>
                    <td data-rotulo="Ação" className="py-3 pl-2 text-right">
                      <AcaoPeriodo id={p.id} nome={p.nome} aberto={p.status === "Aberto"} turmas={p._count.turmas} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Cartao>
        <Cartao titulo="Novo período">
          <FormularioApi
            url="/api/periodos"
            textoBotao="Criar período"
            mensagemSucesso="Período criado e aberto. A coordenação já pode abrir turmas nele."
            campos={[{ nome: "nome", rotulo: "Nome (AAAA/1 ou AAAA/2)" }]}
          />
          <p className="mt-3 text-sm text-mudo">O período nasce aberto. Encerrar e reabrir ficam registrados na auditoria.</p>
        </Cartao>
      </div>
    </Casca>
  );
}
