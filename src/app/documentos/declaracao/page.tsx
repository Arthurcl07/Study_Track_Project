import { notFound } from "next/navigation";
import { FolhaDocumento, TabelaDocumento, emissao } from "@/components/documento";
import { RECURSOS } from "@/domain/autorizacao";
import { ROTULO_SITUACAO_CURSO, type SituacaoCurso } from "@/domain/secretaria";
import { consultarDeclaracao } from "@/server/academico/requerimentos";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-036 (AC-036-07): declaração de matrícula de um requerimento deferido, pronta para imprimir. Sem código de
// verificação (item 28 fora do escopo). Estudante: a própria; secretaria: qualquer uma.
export default async function DeclaracaoMatricula({ searchParams }: { searchParams: Promise<{ requerimento?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.requerimentos);
  const declaracao = await consultarDeclaracao(sessao, (await searchParams).requerimento ?? "");
  if (!declaracao) notFound();
  const { estudante, turmas, instituicao } = declaracao;
  const nomeInstituicao = instituicao?.nome ?? "StudyTrack";
  const situacao = ROTULO_SITUACAO_CURSO[(estudante.ficha?.situacaoCurso ?? "Ativo") as SituacaoCurso];
  return (
    <FolhaDocumento
      titulo="Declaração de matrícula"
      subtitulo={<>Requerimento <strong>{declaracao.protocolo}</strong></>}
      voltar="/requerimentos"
      instituicao={instituicao}
      dados={[
        { rotulo: "Estudante", valor: estudante.nome },
        { rotulo: "Matrícula", valor: estudante.ficha?.numeroMatricula ?? "—" },
        { rotulo: "Curso", valor: estudante.curso?.nome ?? "—" },
      ]}
      rodape={<span>Emitida por {nomeInstituicao} em {emissao(declaracao.emitidaEm)} (horário de Brasília).</span>}
    >
      <p className="mt-6 text-[14px] leading-relaxed">
        Declaramos, para os devidos fins, que <strong>{estudante.nome}</strong>, matrícula <strong>{estudante.ficha?.numeroMatricula ?? "—"}</strong>
        {estudante.ficha?.cpf ? <>, CPF {estudante.ficha.cpf}</> : null}, está vinculado(a) ao curso <strong>{estudante.curso?.nome ?? "—"}</strong> desta
        instituição, na situação <strong>{situacao}</strong>{turmas.length > 0 ? ", cursando as disciplinas abaixo." : "."}
      </p>
      {turmas.length > 0 && (
        <div className="mt-4">
          <TabelaDocumento cabecalho={[{ texto: "Período" }, { texto: "Disciplina" }, { texto: "Turma" }, { texto: "CH", numero: true }]}>
            {turmas.map((t, i) => (
              <tr key={i} className="border-t border-traco">
                <td className="px-2 py-2">{t.periodo}</td>
                <td className="px-2 py-2">{t.disciplina.nome}</td>
                <td className="px-2 py-2">{t.nome}</td>
                <td className="px-2 py-2 text-right tabular-nums">{t.disciplina.cargaHoraria} h</td>
              </tr>
            ))}
          </TabelaDocumento>
        </div>
      )}
    </FolhaDocumento>
  );
}
