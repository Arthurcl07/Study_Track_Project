import { notFound } from "next/navigation";
import { FolhaDocumento, TabelaDocumento, emissao } from "@/components/documento";
import { CLASSE_BOTAO_SECUNDARIO, CLASSE_CAMPO, CLASSE_ROTULO } from "@/components/ui";
import { hojeEmBrasilia } from "@/domain/atividades";
import { RECURSOS } from "@/domain/autorizacao";
import { dataBR } from "@/domain/auditoria";
import { dataValida } from "@/domain/calendario";
import { listaDePresenca, voltarDaTurma } from "@/server/academico/documentos-turma";
import { obterInstituicao } from "@/server/academico/secretaria";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-048 / RF-57 (UC-43): lista de presença para assinatura, com os estudantes cursando, na data escolhida.
// Layout aprovado em docs/layout/prototipo.html#doc-lista-presenca.
export default async function ListaDePresenca({ searchParams }: { searchParams: Promise<{ turma?: string; data?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.documentosTurma);
  const filtros = await searchParams;
  const data = dataValida(filtros.data) ?? hojeEmBrasilia();
  const [lista, instituicao] = await Promise.all([listaDePresenca(sessao, filtros.turma), obterInstituicao()]);
  if (!lista) notFound();
  const { turma, estudantes } = lista;
  return (
    <FolhaDocumento
      titulo="Lista de presença"
      subtitulo={<>{turma.nome} · {turma.disciplina.nome} · {dataBR(data)}</>}
      voltar={voltarDaTurma(sessao, turma.id)}
      instituicao={instituicao}
      dados={[
        { rotulo: "Professor", valor: turma.professor.nome },
        { rotulo: "Período", valor: turma.periodo },
        { rotulo: "Estudantes", valor: estudantes.length },
      ]}
      rodape={<span>Emitida por {instituicao?.nome ?? "StudyTrack"} em {emissao(new Date().toISOString())} (horário de Brasília).</span>}
    >
      <form className="nao-imprimir mt-4 flex flex-wrap items-end gap-2" action="/documentos/lista-presenca">
        <input type="hidden" name="turma" value={turma.id} />
        <div>
          <label htmlFor="data" className={CLASSE_ROTULO}>Data da aula</label>
          <input id="data" name="data" type="date" defaultValue={data} className={`${CLASSE_CAMPO} w-auto`} />
        </div>
        <button type="submit" className={CLASSE_BOTAO_SECUNDARIO}>Trocar a data</button>
      </form>
      <div className="mt-4">
        <TabelaDocumento cabecalho={[{ texto: "#" }, { texto: "Matrícula" }, { texto: "Estudante" }, { texto: "Assinatura" }]}>
          {estudantes.map((e, i) => (
            <tr key={`${e.numeroMatricula}-${e.nome}`} className="border-t border-traco">
              <td className="px-2 py-2 tabular-nums">{i + 1}</td>
              <td className="px-2 py-2 tabular-nums">{e.numeroMatricula ?? "—"}</td>
              <td className="px-2 py-2">{e.nome}</td>
              <td className="w-[45%] px-2 py-2"><span className="block h-6 border-b border-mudo" /></td>
            </tr>
          ))}
        </TabelaDocumento>
      </div>
      <p className="mt-8 text-sm">Professor(a): ______________________________ &nbsp; {turma.professor.nome}</p>
    </FolhaDocumento>
  );
}
