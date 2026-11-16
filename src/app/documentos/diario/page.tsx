import { notFound } from "next/navigation";
import { FolhaDocumento, TabelaDocumento, emissao } from "@/components/documento";
import { formatarNumero } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { dataBR } from "@/domain/auditoria";
import { emBlocos } from "@/domain/documentos-turma";
import { diarioDeClasse, voltarDaTurma } from "@/server/academico/documentos-turma";
import { obterInstituicao } from "@/server/academico/secretaria";
import { exigirAcessoPagina } from "@/server/auth/guardas";

const COR = { P: "", F: "font-bold text-risco", A: "text-info", "": "text-mudo" } as const;
const curta = (data: string) => dataBR(data).slice(0, 5);

// SPEC-048 / RF-57 (UC-43): diário de classe impresso — aulas com o conteúdo e a grade de presença com a frequência
// final. Layout aprovado em docs/layout/prototipo.html#doc-diario.
export default async function DiarioImpresso({ searchParams }: { searchParams: Promise<{ turma?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.documentosTurma);
  const { turma: turmaId } = await searchParams;
  const [diario, instituicao] = await Promise.all([diarioDeClasse(sessao, turmaId), obterInstituicao()]);
  if (!diario) notFound();
  const { turma, aulas, estudantes } = diario;
  const blocos = emBlocos(aulas.map((a, i) => ({ ...a, i })), 14);
  return (
    <FolhaDocumento
      titulo="Diário de classe"
      subtitulo={<>{turma.nome} · {turma.disciplina.nome} · {turma.periodo}</>}
      voltar={voltarDaTurma(sessao, turma.id)}
      instituicao={instituicao}
      dados={[
        { rotulo: "Professor", valor: turma.professor.nome },
        { rotulo: "Curso", valor: turma.curso.nome },
        { rotulo: "Aulas", valor: `${aulas.length} registrada(s) · ${turma.disciplina.cargaHoraria} h` },
      ]}
      rodape={<span>Emitido por {instituicao?.nome ?? "StudyTrack"} em {emissao(new Date().toISOString())} (horário de Brasília).</span>}
    >
      <h2 className="mt-5 mb-2 text-sm font-semibold text-marinho">Aulas e conteúdo</h2>
      <TabelaDocumento cabecalho={[{ texto: "Data" }, { texto: "Aula" }, { texto: "Conteúdo" }]}>
        {aulas.map((a) => (
          <tr key={a.id} className="border-t border-traco">
            <td className="px-2 py-1 tabular-nums">{dataBR(a.data)}</td>
            <td className="px-2 py-1">{a.numero}ª</td>
            <td className="px-2 py-1">{a.conteudo ?? <span className="text-mudo">—</span>}</td>
          </tr>
        ))}
      </TabelaDocumento>
      <h2 className="mt-6 mb-2 text-sm font-semibold text-marinho">Frequência</h2>
      {blocos.map((bloco, b) => (
        <div key={b} className="mb-4 break-inside-avoid">
          <TabelaDocumento cabecalho={[{ texto: "Estudante" }, ...bloco.map((a) => ({ texto: `${curta(a.data)}${a.numero > 1 ? `·${a.numero}` : ""}`, numero: true })), ...(b === blocos.length - 1 ? [{ texto: "Freq.", numero: true }] : [])]}>
            {estudantes.map((e) => (
              <tr key={e.nome} className="border-t border-traco">
                <td className="px-2 py-1 whitespace-nowrap">{e.nome}{e.situacao !== "Cursando" ? <span className="text-mudo"> ({e.situacao.toLowerCase()})</span> : null}</td>
                {bloco.map((a) => <td key={a.id} className={`px-1 py-1 text-right ${COR[e.marcas[a.i]]}`}>{e.marcas[a.i] || "·"}</td>)}
                {b === blocos.length - 1 && <td className="px-2 py-1 text-right tabular-nums">{e.frequencia === null ? "—" : `${formatarNumero(e.frequencia)}%`}</td>}
              </tr>
            ))}
          </TabelaDocumento>
        </div>
      ))}
      <p className="text-xs text-mudo">P presente · F falta · A falta abonada · “·” não constava na chamada</p>
      <p className="mx-auto mt-12 w-72 max-w-full border-t border-texto pt-1.5 text-center text-xs">{turma.professor.nome}<br />Professor(a) responsável</p>
    </FolhaDocumento>
  );
}
