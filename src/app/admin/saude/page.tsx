import Link from "next/link";
import { Casca } from "@/components/casca";
import { CabecalhoPagina, Cartao, CartaoNumero, CLASSE_BOTAO_SECUNDARIO, CLASSE_CAMPO, CLASSE_LINK, CLASSE_ROTULO, EstadoVazio, SeloSituacao } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { saudeDoSistema } from "@/server/academico/saude";
import { exigirAcessoPagina } from "@/server/auth/guardas";

const quando = (d: Date) => d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

// SPEC-057 / RF-63 (UC-49): banco, tempos das consultas principais, tamanho da instituição e erros recentes com a
// busca pelo código que a página de erro mostra (SPEC-047). Layout aprovado em docs/layout/prototipo.html#saude.
export default async function Saude({ searchParams }: { searchParams: Promise<{ codigo?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.saude);
  const { codigo } = await searchParams;
  const s = await saudeDoSistema(codigo?.trim() || null);
  const linhaErro = (e: { codigo: string; registradoEm: Date; metodo: string; rota: string; perfil: string | null; mensagem: string }) => (
    <li key={e.codigo} className="border-t border-traco py-2.5 first:border-t-0">
      <p className="text-sm"><code className="font-semibold">{e.codigo}</code> · {quando(e.registradoEm)} · {e.metodo} {e.rota}{e.perfil ? ` · ${e.perfil}` : ""}</p>
      <p className="mt-0.5 text-[13px] text-mudo">{e.mensagem}</p>
    </li>
  );
  return (
    <Casca sessao={sessao} ativo="saude">
      <CabecalhoPagina
        titulo="Saúde do sistema"
        subtitulo={`Atualizado agora · ${quando(new Date())}`}
        acao={<Link href="/admin/saude" className={CLASSE_BOTAO_SECUNDARIO}>↻ Atualizar</Link>}
      />
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <CartaoNumero rotulo="Banco de dados" valor={s.banco.ok ? "● OK" : "■ Fora do ar"} cor={s.banco.ok ? "text-normal" : "text-risco"} detalhe={`respondeu em ${s.banco.ms} ms`} />
        <CartaoNumero rotulo="Erros (24 h)" valor={s.erros24h ?? "—"} cor={s.erros24h ? "text-atencao" : ""} />
        <CartaoNumero rotulo="Estudantes ativos" valor={s.estudantes ?? "—"} />
        <CartaoNumero rotulo="Turmas abertas" valor={s.turmasAbertas ?? "—"} />
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Cartao titulo="Tempo das consultas principais">
          <table className="tabela-responsiva w-full text-[15px]">
            <thead>
              <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                <th className="pb-2.5">Consulta</th>
                <th className="pb-2.5 text-right">Tempo</th>
                <th className="pb-2.5"><span className="sr-only">Estado</span></th>
              </tr>
            </thead>
            <tbody>
              {s.consultas.map((c) => (
                <tr key={c.nome} className="border-t border-traco">
                  <td data-rotulo="Consulta" className="py-2.5 pr-3">{c.nome}</td>
                  <td data-rotulo="Tempo" className="py-2.5 pr-3 text-right tabular-nums">{c.ok ? `${c.ms} ms` : "falhou"}</td>
                  <td className="py-2.5 text-right"><SeloSituacao situacao={c.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[13px] text-mudo">Verde até 300 ms, amarelo até 1 s. O teste de carga completo é o <code>npm run carga</code>.</p>
        </Cartao>
        <Cartao titulo="Erros recentes" acao={<Link href="/admin/saude/teste-erro" className={CLASSE_LINK}>Testar a página de erro</Link>}>
          <form className="mb-3 flex flex-wrap items-end gap-2" action="/admin/saude">
            <div className="min-w-0 flex-1">
              <label htmlFor="codigo" className={CLASSE_ROTULO}>Buscar pelo código</label>
              <input id="codigo" name="codigo" defaultValue={codigo ?? ""} placeholder="ERR-7F3A21" className={CLASSE_CAMPO} />
            </div>
            <button type="submit" className={CLASSE_BOTAO_SECUNDARIO}>Buscar</button>
          </form>
          {s.buscou && (
            <div className="mb-3 rounded-[10px] border border-traco px-3">
              {s.encontrado ? <ul>{linhaErro(s.encontrado)}</ul> : <p className="py-2.5 text-sm text-mudo">Nenhum erro com o código {codigo}.</p>}
            </div>
          )}
          {s.erros.length === 0 ? <EstadoVazio>Nenhum erro nos últimos 7 dias.</EstadoVazio> : <ul>{s.erros.map(linhaErro)}</ul>}
          <p className="mt-3 text-[13px] text-mudo">E-mails, CPFs, números longos e senhas são mascarados antes de gravar.</p>
        </Cartao>
      </div>
    </Casca>
  );
}
