import { FolhaDocumento, TabelaDocumento, emissao } from "@/components/documento";
import { formatarNumero as numero } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { ehSituacaoRelatorio, type SituacaoRelatorio } from "@/domain/relatorio";
import { textoDaRegra } from "@/domain/situacao-academica";
import { gerarRelatorio } from "@/server/academico/relatorios";
import { obterInstituicao } from "@/server/academico/secretaria";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { regraVigente } from "@/server/dados/regras";

const ROTULO: Record<SituacaoRelatorio, string> = { Normal: "● Normal", Atencao: "▲ Atenção", Risco: "■ Risco", SemDados: "Sem dados" };
const COR: Record<SituacaoRelatorio, string> = { Normal: "text-normal", Atencao: "text-atencao", Risco: "font-bold text-risco", SemDados: "text-mudo" };

// SPEC-049 / RF-58 (AC-049-03): versão para impressão do relatório (Baixar PDF), com o cabeçalho da instituição e
// exatamente as linhas da tela com os mesmos filtros (INV-049-01).
export default async function RelatorioParaImprimir({ searchParams }: { searchParams: Promise<{ turma?: string; situacao?: string; curso?: string; periodo?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.relatorios);
  const filtros = await searchParams;
  const situacao = ehSituacaoRelatorio(filtros.situacao) ? filtros.situacao : null;
  const [resultado, instituicao, regra] = await Promise.all([
    gerarRelatorio(sessao, { turma: filtros.turma || null, situacao, curso: filtros.curso || null, periodo: filtros.periodo || null }),
    obterInstituicao(),
    regraVigente(),
  ]);
  const voltar = `/relatorios?${new URLSearchParams(Object.entries(filtros).filter(([, v]) => v) as [string, string][])}`;
  if (!resultado.ok) {
    return (
      <FolhaDocumento titulo="Relatório acadêmico" voltar={voltar} instituicao={instituicao} dados={[]} rodape={null}>
        <p className="mt-6 text-risco">Acesso negado: esta turma ou este curso não está no seu escopo.</p>
      </FolhaDocumento>
    );
  }
  const { resumo, linhas, periodo } = resultado.relatorio;
  return (
    <FolhaDocumento
      titulo="Relatório acadêmico"
      subtitulo={<>{periodo ? `Período ${periodo}` : "Períodos abertos"}{situacao ? ` · só ${ROTULO[situacao].replace(/^\W+ /, "")}` : ""}</>}
      voltar={voltar}
      instituicao={instituicao}
      dados={[
        { rotulo: "Emitido por", valor: `${sessao.nome} (${sessao.perfil})` },
        { rotulo: "Turmas", valor: resumo.length },
        { rotulo: "Estudantes", valor: linhas.length },
        { rotulo: "Regra", valor: textoDaRegra(regra) },
      ]}
      rodape={<span>Emitido por {instituicao?.nome ?? "StudyTrack"} em {emissao(new Date().toISOString())} (horário de Brasília).</span>}
    >
      <h2 className="mt-5 mb-2 text-sm font-semibold text-marinho">Resumo por turma</h2>
      <TabelaDocumento cabecalho={[{ texto: "Turma" }, { texto: "Estud.", numero: true }, { texto: "Média", numero: true }, { texto: "Freq.", numero: true }, { texto: "Normal", numero: true }, { texto: "Atenção", numero: true }, { texto: "Risco", numero: true }, { texto: "Atrasadas", numero: true }]}>
        {resumo.map((r) => (
          <tr key={r.id} className="border-t border-traco">
            <td className="px-2 py-1">{r.rotulo}</td>
            <td className="px-2 py-1 text-right tabular-nums">{r.estudantes}</td>
            <td className="px-2 py-1 text-right tabular-nums">{r.mediaTurma === null ? "—" : numero(r.mediaTurma)}</td>
            <td className="px-2 py-1 text-right tabular-nums">{r.frequenciaMedia === null ? "—" : `${numero(r.frequenciaMedia)}%`}</td>
            <td className="px-2 py-1 text-right tabular-nums">{r.contagem.Normal}</td>
            <td className="px-2 py-1 text-right tabular-nums">{r.contagem.Atencao}</td>
            <td className="px-2 py-1 text-right tabular-nums">{r.contagem.Risco}</td>
            <td className="px-2 py-1 text-right tabular-nums">{r.entregasAtrasadas}</td>
          </tr>
        ))}
      </TabelaDocumento>
      <h2 className="mt-6 mb-2 text-sm font-semibold text-marinho">Estudantes</h2>
      <TabelaDocumento cabecalho={[{ texto: "Estudante" }, { texto: "Turma" }, { texto: "Média", numero: true }, { texto: "Freq.", numero: true }, { texto: "Situação" }, { texto: "Atrasadas", numero: true }]}>
        {linhas.map((l) => (
          <tr key={`${l.turmaId}-${l.estudante}`} className="border-t border-traco">
            <td className="px-2 py-1">{l.estudante}</td>
            <td className="px-2 py-1 text-mudo">{l.turma}</td>
            <td className="px-2 py-1 text-right tabular-nums">{l.media === null ? "—" : numero(l.media)}</td>
            <td className="px-2 py-1 text-right tabular-nums">{l.frequencia === null ? "—" : `${numero(l.frequencia)}%`}</td>
            <td className={`px-2 py-1 ${COR[l.situacao]}`}>{ROTULO[l.situacao]}</td>
            <td className="px-2 py-1 text-right tabular-nums">{l.entregasAtrasadas}</td>
          </tr>
        ))}
      </TabelaDocumento>
    </FolhaDocumento>
  );
}
