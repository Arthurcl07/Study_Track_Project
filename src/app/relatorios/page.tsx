import Link from "next/link";
import { Casca } from "@/components/casca";
import { Icone } from "@/components/icones";
import {
  CabecalhoPagina, Cartao, CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO, CLASSE_CAMPO, CLASSE_ROTULO, corDaFrequencia, corDaMedia,
  EstadoVazio, formatarNumero as numero, Mensagem, SeloSituacao,
} from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { ehSituacaoRelatorio, type SituacaoRelatorio } from "@/domain/relatorio";
import { gerarRelatorio } from "@/server/academico/relatorios";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-009 / RF-15 (UC-05): relatório acadêmico em tela e CSV (OPEN-005), no escopo do perfil (RB-03, RB-04).
// Os filtros vão na URL (GET), então a tela e o CSV recebem exatamente os mesmos parâmetros (INV-009-05).
// Layout aprovado em docs/layout/prototipo.html#relatorio.
const OPCOES_SITUACAO: { valor: SituacaoRelatorio; rotulo: string }[] = [
  { valor: "Normal", rotulo: "Normal" },
  { valor: "Atencao", rotulo: "Atenção" },
  { valor: "Risco", rotulo: "Risco" },
  { valor: "SemDados", rotulo: "Sem dados" },
];

const CONTAGEM = [
  { chave: "Normal", simbolo: "●", rotulo: "Normal", classe: "bg-normal-fundo text-normal" },
  { chave: "Atencao", simbolo: "▲", rotulo: "Atenção", classe: "bg-atencao-fundo text-atencao" },
  { chave: "Risco", simbolo: "■", rotulo: "Risco", classe: "bg-risco-fundo text-risco" },
  { chave: "SemDados", simbolo: "–", rotulo: "Sem dados", classe: "bg-slate-100 text-slate-600" },
] as const;

function Situacao({ situacao }: { situacao: SituacaoRelatorio }) {
  if (situacao === "SemDados") {
    return <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap text-slate-600">Sem dados</span>;
  }
  return <SeloSituacao situacao={situacao} />;
}

export default async function Relatorios({ searchParams }: { searchParams: Promise<{ turma?: string; situacao?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.relatorios);
  const filtros = await searchParams;
  const turma = filtros.turma || "";
  const situacao = ehSituacaoRelatorio(filtros.situacao) ? filtros.situacao : "";
  const resultado = await gerarRelatorio(sessao, { turma: turma || null, situacao: situacao || null });

  const subtitulo =
    sessao.perfil === "Coordenador"
      ? "Turmas sob sua responsabilidade, com os indicadores atuais."
      : "Turmas que você leciona, com os indicadores atuais.";

  if (!resultado.ok) {
    return (
      <Casca sessao={sessao} ativo="relatorios">
        <CabecalhoPagina titulo="Relatório acadêmico" subtitulo={subtitulo} />
        <Mensagem tipo="erro">Acesso negado: esta turma não está no seu escopo.</Mensagem>
        <Link href="/relatorios" className={`mt-4 ${CLASSE_BOTAO_SECUNDARIO}`}>Ver todas as minhas turmas</Link>
      </Casca>
    );
  }

  const { turmasDisponiveis, resumo, linhas } = resultado.relatorio;
  const consulta = new URLSearchParams();
  if (turma) consulta.set("turma", turma);
  if (situacao) consulta.set("situacao", situacao);
  consulta.set("formato", "csv");

  return (
    <Casca sessao={sessao} ativo="relatorios">
      <CabecalhoPagina
        titulo="Relatório acadêmico"
        subtitulo={subtitulo}
        acao={
          turmasDisponiveis.length > 0 && (
            <a href={`/api/relatorios?${consulta}`} download className={CLASSE_BOTAO_SECUNDARIO}>
              <Icone nome="download" className="h-4 w-4" /> Exportar CSV
            </a>
          )
        }
      />

      {turmasDisponiveis.length === 0 ? (
        <EstadoVazio>Nenhuma turma no seu escopo ainda.</EstadoVazio>
      ) : (
        <div className="space-y-5">
          <Cartao>
            <form method="get" className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <label htmlFor="turma" className={CLASSE_ROTULO}>Turma</label>
                <select id="turma" name="turma" defaultValue={turma} className={CLASSE_CAMPO}>
                  <option value="">Todas</option>
                  {turmasDisponiveis.map((t) => <option key={t.id} value={t.id}>{t.rotulo}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="situacao" className={CLASSE_ROTULO}>Situação</label>
                <select id="situacao" name="situacao" defaultValue={situacao} className={CLASSE_CAMPO}>
                  <option value="">Todas</option>
                  {OPCOES_SITUACAO.map((o) => <option key={o.valor} value={o.valor}>{o.rotulo}</option>)}
                </select>
              </div>
              <button type="submit" className={CLASSE_BOTAO_PRIMARIO}>Aplicar filtros</button>
            </form>
          </Cartao>

          <Cartao titulo="Resumo por turma">
            <table className="tabela-responsiva w-full text-[15px]">
              <thead>
                <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                  <th className="pr-2 pb-2.5">Turma</th>
                  <th className="px-2 pb-2.5 text-right">Estudantes</th>
                  <th className="px-2 pb-2.5 text-right">Média</th>
                  <th className="px-2 pb-2.5 text-right">Frequência</th>
                  <th className="pb-2.5 pl-4">Situações</th>
                  <th className="pb-2.5 pl-2 text-right" title="Entregas atrasadas">Atrasadas</th>
                </tr>
              </thead>
              <tbody>
                {resumo.map((r) => (
                  <tr key={r.id} className="border-t border-traco">
                    <td data-rotulo="Turma" className="py-3 pr-2 font-medium">{r.rotulo}</td>
                    <td data-rotulo="Estudantes" className="px-2 py-3 text-right tabular-nums">{r.estudantes}</td>
                    <td data-rotulo="Média" className="px-2 py-3 text-right tabular-nums">{r.mediaTurma === null ? "—" : numero(r.mediaTurma)}</td>
                    <td data-rotulo="Frequência" className="px-2 py-3 text-right tabular-nums">
                      {r.frequenciaMedia === null ? "—" : `${numero(r.frequenciaMedia)}%`}
                    </td>
                    <td data-rotulo="Situações" className="py-3 pl-4">
                      <div className="flex flex-wrap justify-end gap-1.5 lg:flex-nowrap sm:justify-start">
                        {CONTAGEM.filter((c) => c.chave !== "SemDados" || r.contagem.SemDados > 0).map((c) => (
                          <span
                            key={c.chave}
                            title={c.rotulo}
                            aria-label={`${c.rotulo}: ${r.contagem[c.chave]}`}
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[13px] font-semibold tabular-nums whitespace-nowrap ${c.classe}`}
                          >
                            {c.simbolo} {r.contagem[c.chave]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td data-rotulo="Entregas atrasadas" className={`py-3 pl-2 text-right tabular-nums ${r.entregasAtrasadas > 0 ? "font-semibold text-risco" : ""}`}>
                      {r.entregasAtrasadas}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Cartao>

          <Cartao titulo={`Estudantes (${linhas.length})`}>
            {linhas.length === 0 ? (
              <EstadoVazio>Nenhum estudante com esses filtros.</EstadoVazio>
            ) : (
              <table className="tabela-responsiva w-full text-[15px]">
                <thead>
                  <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                    <th className="pr-2 pb-2.5">Estudante</th>
                    <th className="px-2 pb-2.5">Turma</th>
                    <th className="px-2 pb-2.5 text-right">Média</th>
                    <th className="px-2 pb-2.5 text-right">Frequência</th>
                    <th className="pb-2.5 pl-4">Situação</th>
                    <th className="pb-2.5 pl-2 text-right">Atrasadas</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((l) => (
                    <tr key={`${l.turmaId}-${l.estudante}`} className="border-t border-traco">
                      <td data-rotulo="Estudante" className="py-3 pr-2">{l.estudante}</td>
                      <td data-rotulo="Turma" className="px-2 py-3 text-mudo">{l.turma}</td>
                      <td data-rotulo="Média" className={`px-2 py-3 text-right tabular-nums ${corDaMedia(l.media) && `font-semibold ${corDaMedia(l.media)}`}`}>
                        {l.media === null ? "—" : numero(l.media)}
                      </td>
                      <td data-rotulo="Frequência" className={`px-2 py-3 text-right tabular-nums ${corDaFrequencia(l.frequencia) && `font-semibold ${corDaFrequencia(l.frequencia)}`}`}>
                        {l.frequencia === null ? "—" : `${numero(l.frequencia)}%`}
                      </td>
                      <td data-rotulo="Situação" className="py-3 pl-4"><Situacao situacao={l.situacao} /></td>
                      <td data-rotulo="Atrasadas" className={`py-3 pl-2 text-right tabular-nums ${l.entregasAtrasadas > 0 ? "font-semibold text-risco" : ""}`}>
                        {l.entregasAtrasadas}
                      </td>
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
