import Link from "next/link";
import { Casca } from "@/components/casca";
import { MediaFrequenciaPorTurma } from "@/components/graficos-coordenador";
import { SeloPeriodo } from "@/components/selo-periodo";
import { CabecalhoPagina, Cartao, CartaoNumero, CLASSE_BOTAO_PRIMARIO, CLASSE_LINK, EstadoVazio } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarDocumentosDoEstudante } from "@/server/academico/documentos";
import { consultarFicha } from "@/server/academico/secretaria";
import { SeloSituacaoCurso } from "@/components/lista-estudantes";
import { formatarDataCurta } from "@/components/ui";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-020 / RF-29 (UC-19): boletins de cada período e histórico escolar do próprio estudante (RB-02).
// SPEC-024 (RF-33): gráfico da evolução por semestre.
// Layout aprovado em docs/layout/prototipo.html#est-documentos e #est-documentos-semestres.
// SPEC-033 (AC-033-05): "Meus dados" — a própria ficha, só leitura (RB-33).
export default async function Documentos() {
  const sessao = await exigirAcessoPagina(RECURSOS.documentos);
  const [documentos, ficha] = await Promise.all([consultarDocumentosDoEstudante(sessao), consultarFicha(sessao, sessao.usuarioId)]);
  const periodos = documentos?.periodos ?? [];
  return (
    <Casca sessao={sessao} ativo="documentos">
      <CabecalhoPagina titulo="Documentos" subtitulo="Boletim de cada período e histórico escolar, prontos para imprimir ou salvar em PDF." />
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Cartao titulo="Boletins">
          {periodos.length === 0 ? (
            <EstadoVazio>Você ainda não tem turmas.</EstadoVazio>
          ) : (
            <table className="tabela-responsiva w-full text-[15px]">
              <thead>
                <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                  <th className="pb-2.5">Período</th>
                  <th className="pb-2.5">Situação</th>
                  <th className="pb-2.5 text-right">Disciplinas</th>
                  <th className="pb-2.5"><span className="sr-only">Abrir</span></th>
                </tr>
              </thead>
              <tbody>
                {periodos.map((p) => (
                  <tr key={p.nome} className="border-t border-traco">
                    <td data-rotulo="Período" className="py-3 pr-2 font-semibold">{p.nome}</td>
                    <td data-rotulo="Situação" className="py-3 pr-2"><SeloPeriodo aberto={!p.encerrado} rotuloAberto="Em curso" /></td>
                    <td data-rotulo="Disciplinas" className="py-3 pr-2 text-right tabular-nums">{p.disciplinas}</td>
                    <td className="py-3 text-right">
                      <Link href={`/documentos/boletim?periodo=${encodeURIComponent(p.nome)}`} className={CLASSE_LINK}>Abrir boletim →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Cartao>
        <Cartao titulo="Histórico escolar">
          <p className="mb-4 text-sm text-mudo">Todas as disciplinas cursadas, por período, com o resultado de cada uma.</p>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <CartaoNumero rotulo="Disciplinas aprovadas" valor={documentos?.resumo.disciplinasAprovadas ?? 0} />
            <CartaoNumero rotulo="Carga horária aprovada" valor={`${documentos?.resumo.cargaHorariaAprovada ?? 0} h`} />
          </div>
          <Link href="/documentos/historico" className={`w-full ${CLASSE_BOTAO_PRIMARIO}`}>Abrir histórico escolar →</Link>
        </Cartao>
      </div>
      {ficha && (
        <Cartao titulo="Meus dados" className="mt-5">
          <dl className="grid gap-x-6 gap-y-3 text-[15px] sm:grid-cols-3">
            {[
              ["Matrícula", ficha.numeroMatricula],
              ["Curso", ficha.curso?.nome ?? "—"],
              ["CPF", ficha.cpf ?? "—"],
              ["Data de nascimento", ficha.dataNascimento ? formatarDataCurta(ficha.dataNascimento) : "—"],
              ["Telefone", ficha.telefone ?? "—"],
              ["Responsável", ficha.responsavelNome ? `${ficha.responsavelNome}${ficha.responsavelTelefone ? ` · ${ficha.responsavelTelefone}` : ""}` : "—"],
            ].map(([rotulo, valor]) => (
              <div key={rotulo} className="min-w-0">
                <dt className="text-xs text-mudo">{rotulo}</dt>
                <dd className="break-words">{valor}</dd>
              </div>
            ))}
            <div>
              <dt className="text-xs text-mudo">Situação no curso</dt>
              <dd><SeloSituacaoCurso situacao={ficha.situacaoCurso} /></dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-mudo">Algum dado errado? Procure a secretaria.</p>
        </Cartao>
      )}
      {(documentos?.semestres.length ?? 0) > 0 && (
        <Cartao titulo="Minha evolução por semestre" className="mt-5">
          <MediaFrequenciaPorTurma
            descricao="Média e frequência por semestre"
            turmas={documentos!.semestres.map((s) => ({ id: s.periodo, rotulo: s.periodo, mediaTurma: s.media, frequenciaMedia: s.frequencia }))}
          />
        </Cartao>
      )}
    </Casca>
  );
}
