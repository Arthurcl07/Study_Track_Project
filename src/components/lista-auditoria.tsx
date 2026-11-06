// Lista da auditoria (SPEC-019, RF-28): mais recentes primeiro, filtro por tipo de ação (GET na URL) e páginas de 50.
// Layout aprovado em docs/layout/prototipo.html#coord-auditoria e #admin-auditoria.
import Link from "next/link";
import type { ConsultaAuditoria } from "@/server/academico/auditoria";
import { Cartao, CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO, CLASSE_CAMPO, CLASSE_ROTULO, EstadoVazio, Etiqueta } from "./ui";

const dataHora = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function ListaAuditoria({ consulta, caminho, mostrarCurso }: { consulta: ConsultaAuditoria; caminho: string; mostrarCurso: boolean }) {
  const pagina = (n: number) => {
    const p = new URLSearchParams();
    if (consulta.grupo) p.set("grupo", consulta.grupo);
    if (n > 1) p.set("pagina", String(n));
    const texto = p.toString();
    return texto ? `${caminho}?${texto}` : caminho;
  };
  return (
    <div className="space-y-5">
      <Cartao>
        <form method="get" className="grid gap-4 sm:grid-cols-[minmax(0,320px)_auto] sm:items-end">
          <div>
            <label htmlFor="grupo" className={CLASSE_ROTULO}>Tipo de ação</label>
            <select id="grupo" name="grupo" defaultValue={consulta.grupo ?? ""} className={CLASSE_CAMPO}>
              <option value="">Todas</option>
              {consulta.grupos.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <button type="submit" className={CLASSE_BOTAO_PRIMARIO}>Filtrar</button>
        </form>
      </Cartao>
      <Cartao titulo={`Registros (${consulta.total})`}>
        {consulta.registros.length === 0 ? (
          <EstadoVazio>Nenhum registro{consulta.grupo ? " deste tipo" : ""} ainda.</EstadoVazio>
        ) : (
          <ol>
            {consulta.registros.map((r) => (
              <li key={r.id} className="grid gap-1 border-t border-traco py-3 first:border-t-0 first:pt-0 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-4">
                <div className="text-sm">
                  <time dateTime={r.registradoEm} className="block text-mudo">{dataHora(r.registradoEm)}</time>
                  <span className="font-semibold">{r.autor}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Etiqueta>{r.rotulo}</Etiqueta>
                    {mostrarCurso && r.curso && <span className="text-xs text-mudo">{r.curso}</span>}
                  </div>
                  <p className="mt-1.5 text-[15px] break-words">{r.descricao}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
        {consulta.paginas > 1 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="text-mudo">Página {consulta.pagina} de {consulta.paginas}</span>
            <div className="flex gap-2">
              {consulta.pagina > 1 && <Link href={pagina(consulta.pagina - 1)} className={CLASSE_BOTAO_SECUNDARIO}>← Anterior</Link>}
              {consulta.pagina < consulta.paginas && <Link href={pagina(consulta.pagina + 1)} className={CLASSE_BOTAO_SECUNDARIO}>Próxima →</Link>}
            </div>
          </div>
        )}
      </Cartao>
    </div>
  );
}
