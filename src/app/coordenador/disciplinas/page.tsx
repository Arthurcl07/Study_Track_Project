import { Casca } from "@/components/casca";
import { FormularioApi } from "@/components/formulario-api";
import { SeletorCurso } from "@/components/seletor-curso";
import { CabecalhoPagina, Cartao, EstadoVazio, Etiqueta } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { cursosDoCoordenador, disciplinasDosCursos, disciplinasForaDaGrade } from "@/server/dados/estrutura";

// SPEC-002 / RF-04 e SPEC-015 / RF-23 (UC-15): a grade de cada curso que o coordenador coordena, cadastro de
// disciplina no curso e inclusão de disciplina que já existe em outro curso (OPEN-033).
// Layout aprovado em docs/layout/prototipo.html#coordenador-grade.
export default async function Disciplinas({ searchParams }: { searchParams: Promise<{ curso?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.cadastroAcademico);
  const cursos = await cursosDoCoordenador(sessao.usuarioId);
  const { curso: pedido } = await searchParams;
  // Curso fora do escopo no endereço é ignorado: vale o primeiro curso dele (INV-015-07).
  const curso = cursos.find((c) => c.id === pedido) ?? cursos[0];

  if (!curso) {
    return (
      <Casca sessao={sessao} ativo="disciplinas">
        <CabecalhoPagina titulo="Disciplinas" subtitulo="A grade de cada curso que você coordena." />
        <EstadoVazio>Você ainda não coordena nenhum curso. O administrador define a coordenação de cada curso.</EstadoVazio>
      </Casca>
    );
  }

  const [grade, foraDaGrade] = await Promise.all([disciplinasDosCursos([curso.id]), disciplinasForaDaGrade(curso.id)]);
  return (
    <Casca sessao={sessao} ativo="disciplinas">
      <CabecalhoPagina titulo="Disciplinas" subtitulo="A grade de cada curso que você coordena. Uma disciplina pode estar em mais de um curso." />
      {cursos.length > 1 && (
        <Cartao className="mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <SeletorCurso cursos={cursos} valor={curso.id} />
            <span className="text-sm text-mudo">Você coordena {cursos.length} cursos.</span>
          </div>
        </Cartao>
      )}
      <div className="grid items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Cartao titulo={`Grade de ${curso.nome} (${grade.length})`}>
          {grade.length === 0 ? (
            <EstadoVazio>Nenhuma disciplina na grade ainda.</EstadoVazio>
          ) : (
            <table className="tabela-responsiva w-full text-[15px]">
              <thead>
                <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                  <th className="pb-2.5">Disciplina</th>
                  <th className="px-2 pb-2.5 text-right">Carga</th>
                  <th className="pb-2.5 pl-2">Também em</th>
                </tr>
              </thead>
              <tbody>
                {grade.map((d) => {
                  const outros = d.cursos.map((c) => c.curso).filter((c) => c.id !== curso.id);
                  return (
                    <tr key={d.id} className="border-t border-traco">
                      <td data-rotulo="Disciplina" className="py-3 pr-2">{d.nome}</td>
                      <td data-rotulo="Carga" className="px-2 py-3 text-right tabular-nums">{d.cargaHoraria} h</td>
                      <td data-rotulo="Também em" className="py-3 pl-2">
                        {outros.length === 0 ? (
                          <span className="text-mudo">—</span>
                        ) : (
                          <span className="flex flex-wrap justify-end gap-1.5 sm:justify-start">{outros.map((c) => <Etiqueta key={c.id}>{c.nome}</Etiqueta>)}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Cartao>
        <div className="space-y-5">
          <Cartao titulo="Nova disciplina no curso">
            <FormularioApi
              url="/api/disciplinas"
              textoBotao="Cadastrar disciplina"
              mensagemSucesso={`Disciplina cadastrada na grade de ${curso.nome}.`}
              campos={[
                { nome: "cursoId", rotulo: "Curso", tipo: "hidden", valor: curso.id },
                { nome: "nome", rotulo: "Nome" },
                { nome: "cargaHoraria", rotulo: "Carga horária (horas)", tipo: "number" },
              ]}
            />
          </Cartao>
          <Cartao titulo="Adicionar disciplina de outro curso">
            {foraDaGrade.length === 0 ? (
              <p className="text-sm text-mudo">Todas as disciplinas cadastradas já estão na grade deste curso.</p>
            ) : (
              <FormularioApi
                url={`/api/cursos/${curso.id}/disciplinas`}
                textoBotao="Adicionar à grade"
                mensagemSucesso={`Disciplina adicionada à grade de ${curso.nome}.`}
                secundario
                campos={[
                  {
                    nome: "disciplinaId",
                    rotulo: "Disciplina",
                    tipo: "select",
                    opcoes: foraDaGrade.map((d) => ({
                      valor: d.id,
                      rotulo: d.cursos.length > 0 ? `${d.nome} · ${d.cursos.map((c) => c.curso.nome).join(", ")}` : d.nome,
                    })),
                  },
                ]}
              />
            )}
          </Cartao>
        </div>
      </div>
    </Casca>
  );
}
