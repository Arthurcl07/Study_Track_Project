import Link from "next/link";
import { Casca } from "@/components/casca";
import { FormularioApi } from "@/components/formulario-api";
import { CabecalhoPagina, Cartao, CLASSE_LINK, EstadoVazio, Etiqueta, Mensagem } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { SeloPeriodo } from "@/components/selo-periodo";
import { cursosDoCoordenador, disciplinasDosCursos, listarProfessores, listarTurmasDoEscopo } from "@/server/dados/estrutura";
import { periodosAbertos } from "@/server/dados/periodos";

// SPEC-002 / RF-04: turmas sob responsabilidade do coordenador e cadastro de nova turma.
// SPEC-015 (RB-18): cada turma é de um curso que ele coordena, com disciplina da grade desse curso.
// SPEC-017 (RF-26): coluna Período com o selo Encerrado; nova turma só em período aberto (INV-017-04).
// Layout aprovado em docs/layout/prototipo.html#coordenador-turmas-curso e #coord-turmas-periodo.
export default async function Turmas() {
  const sessao = await exigirAcessoPagina(RECURSOS.cadastroAcademico);
  const cursos = await cursosDoCoordenador(sessao.usuarioId);
  const [turmas, disciplinas, professores, abertos] = await Promise.all([
    listarTurmasDoEscopo(sessao),
    disciplinasDosCursos(cursos.map((c) => c.id)),
    listarProfessores(),
    periodosAbertos(),
  ]);
  // Cada disciplina aparece uma vez para cada curso dele em cuja grade está (o grupo filtra pelo curso escolhido).
  const opcoesDisciplina = disciplinas.flatMap((d) =>
    d.cursos.filter((c) => cursos.some((x) => x.id === c.curso.id)).map((c) => ({ valor: d.id, rotulo: d.nome, grupo: c.curso.id })),
  );
  return (
    <Casca sessao={sessao} ativo="turmas">
      <CabecalhoPagina
        titulo="Turmas e estudantes"
        subtitulo="Turmas dos cursos que você coordena. Cada turma é de um curso; o estudante só entra em turma do próprio curso."
      />
      <div className="grid items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Cartao titulo={`Turmas (${turmas.length})`}>
          {turmas.length === 0 ? (
            <EstadoVazio>Nenhuma turma nos cursos que você coordena.</EstadoVazio>
          ) : (
            <table className="tabela-responsiva w-full text-[15px]">
              <thead>
                <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                  <th className="pb-2.5">Turma</th>
                  <th className="pb-2.5">Período</th>
                  <th className="pb-2.5">Curso</th>
                  <th className="pb-2.5">Disciplina</th>
                  <th className="pb-2.5">Professor</th>
                  <th className="pb-2.5 text-right">Estudantes</th>
                </tr>
              </thead>
              <tbody>
                {turmas.map((t) => (
                  <tr key={t.id} className="border-t border-traco">
                    <td data-rotulo="Turma" className="py-3 pr-2">
                      <Link href={`/coordenador/turmas/${t.id}`} className={CLASSE_LINK}>{t.nome}</Link>
                    </td>
                    <td data-rotulo="Período" className="py-3 pr-2">
                      <span className="inline-flex flex-wrap items-center gap-1.5"><Etiqueta>{t.periodo}</Etiqueta>{t.periodoLetivo.status === "Encerrado" && <SeloPeriodo aberto={false} />}</span>
                    </td>
                    <td data-rotulo="Curso" className="py-3 pr-2">{t.curso.nome}</td>
                    <td data-rotulo="Disciplina" className="py-3 pr-2">{t.disciplina.nome}</td>
                    <td data-rotulo="Professor" className="py-3 pr-2">{t.professor.nome}</td>
                    <td data-rotulo="Estudantes" className="py-3 text-right tabular-nums">{t.estudantes?.length ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Cartao>
        <Cartao titulo="Nova turma">
          {cursos.length === 0 ? (
            <Mensagem tipo="info">Você ainda não coordena nenhum curso. O administrador define a coordenação de cada curso.</Mensagem>
          ) : abertos.length === 0 ? (
            <Mensagem tipo="info">Não há período letivo aberto. O administrador abre os períodos em Períodos letivos.</Mensagem>
          ) : disciplinas.length === 0 ? (
            <Mensagem tipo="info">
              Cadastre uma <Link href="/coordenador/disciplinas" className="underline">disciplina</Link> na grade do curso antes de criar turmas.
            </Mensagem>
          ) : (
            <FormularioApi
              url="/api/turmas"
              textoBotao="Cadastrar turma"
              mensagemSucesso="Turma cadastrada no curso."
              campos={[
                // Com um só curso, ele já vem escolhido (campo oculto).
                cursos.length === 1
                  ? { nome: "cursoId", rotulo: "Curso", tipo: "hidden", valor: cursos[0].id }
                  : { nome: "cursoId", rotulo: "Curso", tipo: "select", opcoes: cursos.map((c) => ({ valor: c.id, rotulo: c.nome })) },
                { nome: "disciplinaId", rotulo: "Disciplina (da grade do curso)", tipo: "select", opcoes: opcoesDisciplina, filtradoPor: "cursoId" },
                { nome: "nome", rotulo: "Nome" },
                { nome: "periodo", rotulo: "Período letivo (só os abertos)", tipo: "select", opcoes: abertos.map((p) => ({ valor: p.nome, rotulo: p.nome })) },
                {
                  nome: "professorId",
                  rotulo: "Professor responsável",
                  tipo: "select",
                  opcoes: professores.map((p) => ({ valor: p.id, rotulo: p.nome })),
                },
              ]}
            />
          )}
        </Cartao>
      </div>
    </Casca>
  );
}
