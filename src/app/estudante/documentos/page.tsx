import Link from "next/link";
import { Casca } from "@/components/casca";
import { SeloPeriodo } from "@/components/selo-periodo";
import { CabecalhoPagina, Cartao, CartaoNumero, CLASSE_BOTAO_PRIMARIO, CLASSE_LINK, EstadoVazio } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarDocumentosDoEstudante } from "@/server/academico/documentos";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-020 / RF-29 (UC-19): boletins de cada período e histórico escolar do próprio estudante (RB-02).
// Layout aprovado em docs/layout/prototipo.html#est-documentos.
export default async function Documentos() {
  const sessao = await exigirAcessoPagina(RECURSOS.documentos);
  const documentos = await consultarDocumentosDoEstudante(sessao);
  const periodos = documentos?.periodos ?? [];
  return (
    <Casca sessao={sessao} ativo="documentos">
      <CabecalhoPagina titulo="Documentos" subtitulo="Boletim de cada período e histórico escolar, prontos para imprimir ou salvar em PDF." />
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Cartao titulo="Boletins">
          {periodos.length === 0 ? (
            <EstadoVazio>Você ainda não tem turmas.</EstadoVazio>
          ) : (
            <table className="tabela-responsiva w-full text-[15px]">
              <thead>
                <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                  <th className="pb-2.5">Período</th>
                  <th className="pb-2.5">Situação</th>
                  <th className="pb-2.5 text-right">Disciplinas</th>
                  <th className="pb-2.5"><span className="sr-only">Abrir</span></th>
                </tr>
              </thead>
              <tbody>
                {periodos.map((p) => (
                  <tr key={p.nome} className="border-t border-traco">
                    <td data-rotulo="Período" className="py-3 pr-2 font-semibold">{p.nome}</td>
                    <td data-rotulo="Situação" className="py-3 pr-2"><SeloPeriodo aberto={!p.encerrado} rotuloAberto="Em curso" /></td>
                    <td data-rotulo="Disciplinas" className="py-3 pr-2 text-right tabular-nums">{p.disciplinas}</td>
                    <td className="py-3 text-right">
                      <Link href={`/documentos/boletim?periodo=${encodeURIComponent(p.nome)}`} className={CLASSE_LINK}>Abrir boletim →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Cartao>
        <Cartao titulo="Histórico escolar">
          <p className="mb-4 text-sm text-mudo">Todas as disciplinas cursadas, por período, com o resultado de cada uma.</p>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <CartaoNumero rotulo="Disciplinas aprovadas" valor={documentos?.resumo.disciplinasAprovadas ?? 0} />
            <CartaoNumero rotulo="Carga horária aprovada" valor={`${documentos?.resumo.cargaHorariaAprovada ?? 0} h`} />
          </div>
          <Link href="/documentos/historico" className={`w-full ${CLASSE_BOTAO_PRIMARIO}`}>Abrir histórico escolar →</Link>
        </Cartao>
      </div>
    </Casca>
  );
}
