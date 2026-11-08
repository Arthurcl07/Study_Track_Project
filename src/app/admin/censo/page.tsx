import Link from "next/link";
import { Casca } from "@/components/casca";
import { CLASSE_BOTAO_PRIMARIO, CLASSE_CAMPO, CLASSE_ROTULO, CabecalhoPagina, Cartao, EstadoVazio, Mensagem, formatarNumero } from "@/components/ui";
import { ROTULO_RESULTADO } from "@/domain/documentos";
import { AVISO_CENSO } from "@/domain/censo";
import { RECURSOS } from "@/domain/autorizacao";
import { linhasDoCenso } from "@/server/academico/censo";
import { listarPeriodos } from "@/server/academico/periodos";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-043 / RF-52 (UC-40): prévia e download do CSV de apoio ao Censo (secretaria). Não é o layout oficial do INEP.
// Layout em docs/layout/prototipo.html#exportacao-censo.
export default async function ExportacaoCenso({ searchParams }: { searchParams: Promise<{ periodo?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.secretaria);
  const lista = await listarPeriodos();
  const periodos = lista.map((p) => p.nome);
  // Padrão: o semestre em andamento (o período aberto mais antigo), não o próximo aberto só para a rematrícula.
  const emAndamento = lista.filter((p) => p.status === "Aberto").map((p) => p.nome).sort()[0] ?? periodos[0] ?? "";
  const pedido = (await searchParams).periodo;
  const periodo = periodos.includes(pedido ?? "") ? pedido! : emAndamento;
  const linhas = periodo ? ((await linhasDoCenso(periodo)) ?? []) : [];
  const estudantes = new Set(linhas.map((l) => l.matricula)).size;
  return (
    <Casca sessao={sessao} ativo="censo">
      <CabecalhoPagina titulo="Exportação do Censo" subtitulo="Arquivo de apoio com os dados dos estudantes e das turmas do período." />
      <div className="mb-5"><Mensagem tipo="info">{AVISO_CENSO} Use-o para conferir e preencher o Censo.</Mensagem></div>
      <div className="grid items-start gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Cartao titulo={`Prévia · ${periodo || "—"}`}>
          {linhas.length === 0 ? (
            <EstadoVazio>Nenhuma matrícula neste período.</EstadoVazio>
          ) : (
            <>
              <table className="tabela-responsiva w-full text-[15px]">
                <thead>
                  <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                    <th className="pr-2 pb-2.5">Matrícula</th>
                    <th className="px-2 pb-2.5">Nome</th>
                    <th className="px-2 pb-2.5">Disciplina</th>
                    <th className="px-2 pb-2.5 text-right">Frequência</th>
                    <th className="pb-2.5 pl-2">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.slice(0, 8).map((l, i) => (
                    <tr key={i} className="border-t border-traco">
                      <td data-rotulo="Matrícula" className="py-2.5 pr-2 tabular-nums">{l.matricula}</td>
                      <td data-rotulo="Nome" className="px-2 py-2.5">{l.nome}</td>
                      <td data-rotulo="Disciplina" className="px-2 py-2.5">{l.disciplina}</td>
                      <td data-rotulo="Frequência" className="px-2 py-2.5 text-right tabular-nums">{l.frequencia === null ? "—" : `${formatarNumero(l.frequencia)}%`}</td>
                      <td data-rotulo="Resultado" className="py-2.5 pl-2">{ROTULO_RESULTADO[l.resultado]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-sm text-mudo">{linhas.length} linha(s) de {estudantes} estudante(s).</p>
            </>
          )}
        </Cartao>
        <Cartao titulo="Exportar">
          <form method="get" className="space-y-4">
            <div>
              <label htmlFor="periodo" className={CLASSE_ROTULO}>Período</label>
              <select id="periodo" name="periodo" defaultValue={periodo} className={CLASSE_CAMPO}>{periodos.map((p) => <option key={p}>{p}</option>)}</select>
            </div>
            <button type="submit" className="text-sm font-medium text-azul hover:underline">Ver prévia do período</button>
          </form>
          <p className="my-4 text-sm text-mudo">CSV com ponto e vírgula, UTF-8. A exportação fica registrada na auditoria.</p>
          {periodo && <Link href={`/api/censo?periodo=${encodeURIComponent(periodo)}`} prefetch={false} className={`w-full ${CLASSE_BOTAO_PRIMARIO}`}>⬇ Baixar CSV de {periodo}</Link>}
        </Cartao>
      </div>
    </Casca>
  );
}
