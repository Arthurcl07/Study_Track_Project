import Link from "next/link";
import { Casca } from "@/components/casca";
import {
  CabecalhoPagina, Cartao, CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO, CLASSE_CAMPO, CLASSE_ROTULO, EstadoVazio,
  formatarNumero as numero, Mensagem,
} from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarHistorico } from "@/server/academico/historico";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-013 / RF-20 (UC-13): histórico de notas, para Professor e Coordenador, no escopo de cada um.
// Os registros não podem ser editados nem apagados (RB-16). Layout aprovado em docs/layout/prototipo.html#historico-notas.
const quando = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

export default async function HistoricoDeNotas({ searchParams }: { searchParams: Promise<{ turma?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.historicoNotas);
  const { turma } = await searchParams;
  const resultado = await consultarHistorico(sessao, turma || null);
  const subtitulo = "Cada lançamento e cada alteração de nota fica registrado. Os registros não podem ser editados nem apagados.";

  if (!resultado.ok) {
    return (
      <Casca sessao={sessao} ativo="historico">
        <CabecalhoPagina titulo="Histórico de notas" subtitulo={subtitulo} />
        <Mensagem tipo="erro">Acesso negado: esta turma não está no seu escopo.</Mensagem>
        <Link href="/historico-notas" className={`mt-4 ${CLASSE_BOTAO_SECUNDARIO}`}>Ver as minhas turmas</Link>
      </Casca>
    );
  }

  const { turmas, turmaId, registros } = resultado;
  return (
    <Casca sessao={sessao} ativo="historico">
      <CabecalhoPagina titulo="Histórico de notas" subtitulo={subtitulo} />
      {turmas.length === 0 ? (
        <EstadoVazio>Nenhuma turma no seu escopo ainda.</EstadoVazio>
      ) : (
        <div className="space-y-5">
          <Cartao>
            <form method="get" className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <label htmlFor="turma" className={CLASSE_ROTULO}>Turma</label>
                <select id="turma" name="turma" defaultValue={turmaId ?? ""} className={CLASSE_CAMPO}>
                  {turmas.map((t) => <option key={t.id} value={t.id}>{t.rotulo}</option>)}
                </select>
              </div>
              <button type="submit" className={CLASSE_BOTAO_PRIMARIO}>Ver histórico</button>
            </form>
          </Cartao>
          <Cartao titulo={`Registros (${registros.length})`}>
            {registros.length === 0 ? (
              <EstadoVazio>Nenhuma nota lançada ou alterada nesta turma desde que o histórico passou a ser registrado.</EstadoVazio>
            ) : (
              <table className="tabela-responsiva w-full text-[15px]">
                <thead>
                  <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                    <th className="pr-2 pb-2.5">Quando</th>
                    <th className="px-2 pb-2.5">Avaliação</th>
                    <th className="px-2 pb-2.5">Estudante</th>
                    <th className="px-2 pb-2.5 text-right">Antes</th>
                    <th className="px-2 pb-2.5 text-right">Depois</th>
                    <th className="pb-2.5 pl-2">Por</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.map((r) => (
                    <tr key={r.id} className="border-t border-traco">
                      <td data-rotulo="Quando" className="py-3 pr-2 whitespace-nowrap tabular-nums">{quando(r.registradoEm)}</td>
                      <td data-rotulo="Avaliação" className="px-2 py-3">{r.avaliacao}</td>
                      <td data-rotulo="Estudante" className="px-2 py-3">{r.estudante}</td>
                      <td data-rotulo="Antes" className="px-2 py-3 text-right text-mudo tabular-nums">{r.valorAnterior === null ? "—" : numero(r.valorAnterior)}</td>
                      <td data-rotulo="Depois" className="px-2 py-3 text-right font-semibold tabular-nums">{numero(r.valorNovo)}</td>
                      <td data-rotulo="Por" className="py-3 pl-2">{r.autor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Cartao>
        </div>
      )}
    </Casca>
  );
}
