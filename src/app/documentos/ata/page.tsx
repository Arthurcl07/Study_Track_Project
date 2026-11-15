import Link from "next/link";
import { notFound } from "next/navigation";
import { FolhaDocumento, ResultadoTurma, TabelaDocumento, emissao } from "@/components/documento";
import { CLASSE_BOTAO_SECUNDARIO, formatarNumero, Mensagem } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { dataBR } from "@/domain/auditoria";
import { ROTULO_RESULTADO } from "@/domain/documentos";
import { textoDaRegra } from "@/domain/situacao-academica";
import { ataDeResultados, voltarDaTurma } from "@/server/academico/documentos-turma";
import { obterInstituicao } from "@/server/academico/secretaria";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-048 / RF-57 (UC-43): ata de resultados finais, só com diário homologado ou período encerrado (INV-048-01).
// Layout aprovado em docs/layout/prototipo.html#doc-ata.
export default async function Ata({ searchParams }: { searchParams: Promise<{ turma?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.documentosTurma);
  const { turma: turmaId } = await searchParams;
  const [ata, instituicao] = await Promise.all([ataDeResultados(sessao, turmaId), obterInstituicao()]);
  if (!ata) notFound();
  const { turma, regra } = ata;
  const voltar = voltarDaTurma(sessao, turma.id);
  return (
    <FolhaDocumento
      titulo="Ata de resultados finais"
      subtitulo={turma.diarioHomologadoEm ? <>Diário homologado em {dataBR(turma.diarioHomologadoEm.toISOString().slice(0, 10))}</> : <>Período {turma.periodo} encerrado</>}
      voltar={voltar}
      instituicao={instituicao}
      dados={[
        { rotulo: "Turma", valor: turma.nome },
        { rotulo: "Disciplina", valor: `${turma.disciplina.nome} · ${turma.disciplina.cargaHoraria} h` },
        { rotulo: "Período", valor: turma.periodo },
        { rotulo: "Professor", valor: turma.professor.nome },
        { rotulo: "Curso", valor: turma.curso.nome },
        { rotulo: "Regra", valor: textoDaRegra(regra) },
      ]}
      rodape={<span>Emitida por {instituicao?.nome ?? "StudyTrack"} em {emissao(new Date().toISOString())} (horário de Brasília).</span>}
    >
      {!ata.liberada ? (
        <div className="mt-6 space-y-3">
          <Mensagem tipo="aviso">A ata só sai com o diário homologado pela coordenação ou com o período encerrado. Hoje o diário está {turma.diario === "Aberto" ? "aberto" : "fechado, aguardando homologação"}.</Mensagem>
          <Link href={voltar} className={CLASSE_BOTAO_SECUNDARIO}>Voltar à turma</Link>
        </div>
      ) : (
        <>
          <h2 className="mt-5 mb-2 text-sm font-semibold text-marinho">Resultados</h2>
          <TabelaDocumento
            cabecalho={[
              { texto: "Matrícula" },
              { texto: "Estudante" },
              { texto: "Média", numero: true },
              { texto: "Freq.", numero: true },
              { texto: "Exame", numero: true },
              { texto: "Final", numero: true },
              { texto: "Resultado" },
            ]}
          >
            {ata.linhas.map((l) => (
              <tr key={`${l.numeroMatricula}-${l.nome}`} className="border-t border-traco">
                <td className="px-2 py-1.5 tabular-nums">{l.numeroMatricula ?? "—"}</td>
                <td className="px-2 py-1.5">{l.nome}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{l.media === null ? "—" : formatarNumero(l.media)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{l.frequencia === null ? "—" : `${formatarNumero(l.frequencia)}%`}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{l.exame === null ? "—" : formatarNumero(l.exame)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{l.notaFinal === null ? "—" : formatarNumero(l.notaFinal)}</td>
                <td className="px-2 py-1.5"><ResultadoTurma resultado={l.resultado} /></td>
              </tr>
            ))}
          </TabelaDocumento>
          <p className="mt-3 text-xs">
            <strong>Totais:</strong> {ata.linhas.length} estudante(s) · {ata.totais.map((t) => `${ROTULO_RESULTADO[t.resultado]}: ${t.quantidade}`).join(" · ")}
          </p>
          <div className="mt-12 grid gap-10 sm:grid-cols-2">
            <p className="border-t border-texto pt-1.5 text-center text-xs">{turma.professor.nome}<br />Professor(a) responsável</p>
            <p className="border-t border-texto pt-1.5 text-center text-xs">Coordenação de {turma.curso.nome}</p>
          </div>
        </>
      )}
    </FolhaDocumento>
  );
}
