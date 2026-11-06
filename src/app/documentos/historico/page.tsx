import { notFound } from "next/navigation";
import { FolhaDocumento, ResultadoTurma, TabelaDocumento, emissao } from "@/components/documento";
import { formatarNumero } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarHistorico } from "@/server/academico/documentos";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-020 / RF-29 (UC-19): histórico escolar com todas as turmas do estudante, por período, e o resultado de cada
// uma (RB-24). Estudante: o próprio; coordenador: estudante dos cursos dele. Layout em docs/layout/prototipo.html#doc-historico.
export default async function HistoricoEscolar({ searchParams }: { searchParams: Promise<{ estudante?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.documentos);
  const historico = await consultarHistorico(sessao, await searchParams);
  if (!historico) notFound();
  const { estudante, periodos, resumo } = historico;
  const voltar = sessao.perfil === "Estudante" ? "/estudante/documentos" : "/coordenador/turmas";

  return (
    <FolhaDocumento
      titulo="Histórico escolar"
      voltar={voltar}
      dados={[
        { rotulo: "Estudante", valor: estudante.nome },
        { rotulo: "E-mail", valor: estudante.email },
        { rotulo: "Curso", valor: estudante.curso?.nome ?? "—" },
        { rotulo: "Disciplinas aprovadas", valor: resumo.disciplinasAprovadas },
        { rotulo: "Carga horária aprovada", valor: `${resumo.cargaHorariaAprovada} h` },
        { rotulo: "Períodos", valor: periodos.length === 0 ? "—" : periodos.map((p) => p.nome).join(", ") },
      ]}
      rodape={
        <>
          <span>Emitido pelo StudyTrack em {emissao(historico.emitidoEm)} (horário de Brasília).</span>
          <span>Aprovado: média ≥ 6,0 e frequência ≥ 75%.</span>
        </>
      }
    >
      {periodos.length === 0 ? (
        <p className="mt-6 text-mudo">Nenhuma turma cursada ainda.</p>
      ) : (
        periodos.map((p) => (
          <section key={p.nome} className="mt-5">
            <h2 className="mb-2 text-sm font-semibold text-marinho">Período {p.nome} · {p.encerrado ? "encerrado" : "em curso"}</h2>
            <TabelaDocumento cabecalho={[{ texto: "Disciplina" }, { texto: "CH", numero: true }, { texto: "Média", numero: true }, { texto: "Frequência", numero: true }, { texto: "Resultado" }]}>
              {p.linhas.map((l) => (
                <tr key={l.id} className="border-t border-traco">
                  <td className="px-2 py-2">{l.disciplina}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{l.cargaHoraria} h</td>
                  <td className="px-2 py-2 text-right tabular-nums">{l.media === null ? "—" : formatarNumero(l.media)}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{l.frequencia === null ? "—" : `${formatarNumero(l.frequencia)}%`}</td>
                  <td className="px-2 py-2"><ResultadoTurma resultado={l.resultado} /></td>
                </tr>
              ))}
            </TabelaDocumento>
          </section>
        ))
      )}
    </FolhaDocumento>
  );
}
