import { notFound } from "next/navigation";
import { FolhaDocumento, ResultadoTurma, TabelaDocumento, emissao } from "@/components/documento";
import { SeloSituacao, formatarNumero } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarBoletim } from "@/server/academico/documentos";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-020 / RF-29 (UC-19): boletim de um período, pronto para imprimir ou salvar em PDF (OPEN-038).
// Estudante: o próprio; coordenador: estudante dos cursos dele. Layout aprovado em docs/layout/prototipo.html#doc-boletim.
export default async function Boletim({ searchParams }: { searchParams: Promise<{ estudante?: string; periodo?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.documentos);
  const filtros = await searchParams;
  const boletim = await consultarBoletim(sessao, filtros);
  if (!boletim) notFound();
  const { estudante, periodo, turmas } = boletim;
  const voltar = sessao.perfil === "Estudante" ? "/estudante/documentos" : "/coordenador/turmas";

  return (
    <FolhaDocumento
      titulo="Boletim"
      subtitulo={periodo ? <>Período <strong>{periodo.nome}</strong> · {periodo.status === "Encerrado" ? "encerrado" : "em curso"}</> : "Sem período"}
      voltar={voltar}
      dados={[
        { rotulo: "Estudante", valor: estudante.nome },
        { rotulo: "E-mail", valor: estudante.email },
        { rotulo: "Curso", valor: estudante.curso?.nome ?? "—" },
      ]}
      rodape={
        <>
          <span>Emitido pelo StudyTrack em {emissao(boletim.emitidoEm)} (horário de Brasília).</span>
          <span>{periodo?.status === "Encerrado" ? "Aprovado: média ≥ 6,0 e frequência ≥ 75%." : "Resultado final só após o encerramento do período."}</span>
        </>
      }
    >
      {turmas.length === 0 ? (
        <p className="mt-6 text-mudo">Nenhuma turma neste período.</p>
      ) : (
        turmas.map((t) => (
          <section key={t.id} className="mt-5 break-inside-avoid">
            <h2 className="mb-2 text-sm font-semibold text-marinho">
              {t.disciplina} <span className="font-normal text-mudo">· Turma {t.turma} · {t.professor} · {t.cargaHoraria} h</span>
            </h2>
            <TabelaDocumento
              cabecalho={[
                ...t.avaliacoes.map((a) => ({ texto: a.nome, numero: true })),
                { texto: "Média", numero: true },
                { texto: "Aulas", numero: true },
                { texto: "Frequência", numero: true },
                { texto: "Situação" },
                { texto: "Resultado" },
              ]}
            >
              <tr className="border-t border-traco">
                {t.avaliacoes.map((a) => (
                  <td key={a.nome} className="px-2 py-2 text-right tabular-nums">{a.nota === null ? "—" : formatarNumero(a.nota)}</td>
                ))}
                <td className="px-2 py-2 text-right font-bold tabular-nums">{t.media === null ? "—" : formatarNumero(t.media)}</td>
                <td className="px-2 py-2 text-right tabular-nums">{t.aulas === 0 ? "—" : `${t.presencas} de ${t.aulas}`}</td>
                <td className="px-2 py-2 text-right tabular-nums">{t.frequencia === null ? "—" : `${formatarNumero(t.frequencia)}%`}</td>
                <td className="px-2 py-2">{t.situacao ? <SeloSituacao situacao={t.situacao} /> : "—"}</td>
                <td className="px-2 py-2"><ResultadoTurma resultado={t.resultado} /></td>
              </tr>
            </TabelaDocumento>
          </section>
        ))
      )}
    </FolhaDocumento>
  );
}
