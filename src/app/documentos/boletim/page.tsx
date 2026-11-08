import { notFound } from "next/navigation";
import { FolhaDocumento, ResultadoTurma, TabelaDocumento, emissao } from "@/components/documento";
import { SeloSituacao, formatarNumero } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarBoletim } from "@/server/academico/documentos";
import { obterInstituicao } from "@/server/academico/secretaria";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-020 / RF-29 (UC-19): boletim de um período, pronto para imprimir ou salvar em PDF (OPEN-038).
// Estudante: o próprio; coordenador: estudante dos cursos dele; secretaria (SPEC-035): qualquer estudante.
// Layout aprovado em docs/layout/prototipo.html#doc-boletim e #boletim-exame (exame, nota final e instituição, SPEC-029/033).
export default async function Boletim({ searchParams }: { searchParams: Promise<{ estudante?: string; periodo?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.documentos);
  const filtros = await searchParams;
  const [boletim, instituicao] = await Promise.all([consultarBoletim(sessao, filtros), obterInstituicao()]);
  if (!boletim) notFound();
  const { estudante, periodo, turmas } = boletim;
  const voltar = sessao.perfil === "Estudante" ? "/estudante/documentos" : sessao.perfil === "Administrador" ? `/admin/estudantes/${estudante.id}` : `/coordenador/estudantes/${estudante.id}`;
  const emissor = instituicao?.nome ?? "StudyTrack";
  // SPEC-029: as colunas Exame e Nota final só aparecem quando alguma turma do período tem exame lançado.
  const temExame = turmas.some((t) => t.exame !== null);

  return (
    <FolhaDocumento
      titulo="Boletim"
      subtitulo={periodo ? <>Período <strong>{periodo.nome}</strong> · {periodo.status === "Encerrado" ? "encerrado" : "em curso"}</> : "Sem período"}
      voltar={voltar}
      instituicao={instituicao}
      dados={[
        { rotulo: "Estudante", valor: estudante.nome },
        { rotulo: "Matrícula", valor: estudante.numeroMatricula ?? "—" },
        { rotulo: "Curso", valor: estudante.curso?.nome ?? "—" },
      ]}
      rodape={
        <>
          <span>Emitido por {emissor} em {emissao(boletim.emitidoEm)} (horário de Brasília).</span>
          <span>{periodo?.status === "Encerrado" ? "Aprovado: média ≥ 6,0 e frequência ≥ 75%; no exame, nota final = (média + exame) ÷ 2 ≥ 5,0." : "Resultado final só após o encerramento do período."}</span>
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
                ...(temExame ? [{ texto: "Exame", numero: true }, { texto: "Nota final", numero: true }] : []),
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
                {temExame && (
                  <>
                    <td className="px-2 py-2 text-right tabular-nums">{t.exame === null ? "—" : formatarNumero(t.exame)}</td>
                    <td className="px-2 py-2 text-right font-bold tabular-nums">{t.notaFinal === null ? "—" : formatarNumero(t.notaFinal)}</td>
                  </>
                )}
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
