import { notFound } from "next/navigation";
import { FolhaDocumento, ResultadoTurma, TabelaDocumento, emissao } from "@/components/documento";
import { formatarNumero } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarHistorico } from "@/server/academico/documentos";
import { obterInstituicao } from "@/server/academico/secretaria";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-020 / RF-29 (UC-19): histórico escolar com todas as turmas do estudante, por período, e o resultado de cada
// uma (RB-24). Estudante: o próprio; coordenador: estudante dos cursos dele; secretaria (SPEC-035): qualquer estudante.
// Layout em docs/layout/prototipo.html#doc-historico; instituição e matrícula da SPEC-033; nota final do exame da SPEC-029.
export default async function HistoricoEscolar({ searchParams }: { searchParams: Promise<{ estudante?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.documentos);
  const [historico, instituicao] = await Promise.all([consultarHistorico(sessao, await searchParams), obterInstituicao()]);
  if (!historico) notFound();
  const { estudante, periodos, resumo } = historico;
  const voltar = sessao.perfil === "Estudante" ? "/estudante/documentos" : sessao.perfil === "Administrador" ? `/admin/estudantes/${estudante.id}` : `/coordenador/estudantes/${estudante.id}`;

  return (
    <FolhaDocumento
      titulo="Histórico escolar"
      subtitulo={historico.concluidoEm ? <strong>Curso concluído em {historico.concluidoEm.split("-").reverse().join("/")}</strong> : undefined}
      voltar={voltar}
      instituicao={instituicao}
      dados={[
        { rotulo: "Estudante", valor: estudante.nome },
        { rotulo: "Matrícula", valor: estudante.numeroMatricula ?? "—" },
        { rotulo: "Curso", valor: estudante.curso?.nome ?? "—" },
        { rotulo: "Disciplinas aprovadas", valor: resumo.disciplinasAprovadas },
        { rotulo: "Carga horária aprovada", valor: `${resumo.cargaHorariaAprovada} h` },
        { rotulo: "Períodos", valor: periodos.length === 0 ? "—" : periodos.map((p) => p.nome).join(", ") },
      ]}
      rodape={
        <>
          <span>Emitido por {instituicao?.nome ?? "StudyTrack"} em {emissao(historico.emitidoEm)} (horário de Brasília).</span>
          <span>Aprovado: média ≥ 6,0 e frequência ≥ 75%; no exame, nota final = (média + exame) ÷ 2 ≥ 5,0.</span>
        </>
      }
    >
      {periodos.length === 0 ? (
        <p className="mt-6 text-mudo">Nenhuma turma cursada ainda.</p>
      ) : (
        periodos.map((p) => (
          <section key={p.nome} className="mt-5">
            <h2 className="mb-2 text-sm font-semibold text-marinho">Período {p.nome} · {p.encerrado ? "encerrado" : "em curso"}</h2>
            <TabelaDocumento cabecalho={[{ texto: "Disciplina" }, { texto: "CH", numero: true }, { texto: "Média", numero: true }, { texto: "Nota final", numero: true }, { texto: "Frequência", numero: true }, { texto: "Resultado" }]}>
              {p.linhas.map((l) => (
                <tr key={l.id} className="border-t border-traco">
                  <td className="px-2 py-2">{l.disciplina}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{l.cargaHoraria} h</td>
                  <td className="px-2 py-2 text-right tabular-nums">{l.media === null ? "—" : formatarNumero(l.media)}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{l.notaFinal === null ? "—" : formatarNumero(l.notaFinal)}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{l.frequencia === null ? "—" : `${formatarNumero(l.frequencia)}%`}</td>
                  <td className="px-2 py-2"><ResultadoTurma resultado={l.resultado} /></td>
                </tr>
              ))}
            </TabelaDocumento>
          </section>
        ))
      )}
      {/* SPEC-042: aproveitamento de estudos (conta na carga aprovada). */}
      {historico.aproveitamentos.length > 0 && (
        <section className="mt-5">
          <h2 className="mb-2 text-sm font-semibold text-marinho">Aproveitamento de estudos</h2>
          <TabelaDocumento cabecalho={[{ texto: "Disciplina" }, { texto: "Origem" }, { texto: "Nota", numero: true }, { texto: "CH", numero: true }]}>
            {historico.aproveitamentos.map((a) => (
              <tr key={a.id} className="border-t border-traco">
                <td className="px-2 py-2">{a.disciplina}</td>
                <td className="px-2 py-2">{a.origem}</td>
                <td className="px-2 py-2 text-right tabular-nums">{a.nota === null ? "—" : formatarNumero(a.nota)}</td>
                <td className="px-2 py-2 text-right tabular-nums">{a.cargaHoraria} h</td>
              </tr>
            ))}
          </TabelaDocumento>
        </section>
      )}
    </FolhaDocumento>
  );
}
