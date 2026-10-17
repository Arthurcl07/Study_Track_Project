import { Casca } from "@/components/casca";
import { CabecalhoPagina, Cartao, EstadoVazio, formatarDataCurta, SeloEntrega } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarAtividades } from "@/server/academico/atividades";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-005 / RF-09: atividades do estudante com o status da PRÓPRIA entrega (RB-02, AC-005-09).
// Layout aprovado em docs/layout/prototipo.html#estudante-atividades.
export default async function MinhasAtividades() {
  const sessao = await exigirAcessoPagina(RECURSOS.painelEstudante);
  const atividades = (await consultarAtividades(sessao)).map((a) => ({ ...a, status: a.entregas[0]!.status }));
  const contar = (status: string) => atividades.filter((a) => a.status === status).length;

  const contadores = [
    { rotulo: "Pendentes", valor: contar("Pendente"), cor: "" },
    { rotulo: "Atrasadas", valor: contar("Atrasada"), cor: "text-risco" },
    { rotulo: "Entregues no prazo", valor: contar("NoPrazo"), cor: "text-normal" },
  ];

  return (
    <Casca sessao={sessao} ativo="atividades">
      <CabecalhoPagina titulo="Minhas atividades" subtitulo="Prazos e situação das suas entregas em todas as turmas." />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {contadores.map((c) => (
          <div key={c.rotulo} className="rounded-2xl border border-traco bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <span className="text-sm text-mudo">{c.rotulo}</span>
            <strong className={`mt-1 block text-3xl font-bold tabular-nums ${c.cor}`}>{c.valor}</strong>
          </div>
        ))}
      </div>
      <Cartao titulo={`Atividades (${atividades.length})`}>
        {atividades.length === 0 ? (
          <EstadoVazio>Nenhuma atividade nas suas turmas por enquanto.</EstadoVazio>
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
              {atividades.map((a) => (
                <tr key={a.id} className="border-t border-traco">
                  <td data-rotulo="Atividade" className="py-3 pr-2">{a.descricao}</td>
                  <td data-rotulo="Disciplina" className="py-3 pr-2">{a.turma.disciplina}</td>
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
