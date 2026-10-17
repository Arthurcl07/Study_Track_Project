import Link from "next/link";
import { Casca } from "@/components/casca";
import { FormularioApi } from "@/components/formulario-api";
import { CabecalhoPagina, Cartao, CLASSE_LINK, EstadoVazio, Etiqueta, Mensagem } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { listarDisciplinas, listarProfessores, listarTurmasDoEscopo } from "@/server/dados/estrutura";

// SPEC-002 / RF-04: turmas sob responsabilidade do coordenador e cadastro de nova turma.
// Layout aprovado em docs/layout/prototipo.html#coordenador-turmas.
export default async function Turmas() {
  const sessao = await exigirAcessoPagina(RECURSOS.cadastroAcademico);
  const [turmas, disciplinas, professores] = await Promise.all([
    listarTurmasDoEscopo(sessao),
    listarDisciplinas(),
    listarProfessores(),
  ]);
  return (
    <Casca sessao={sessao} ativo="turmas">
      <CabecalhoPagina
        titulo="Turmas e estudantes"
        subtitulo="Turmas sob sua responsabilidade. Quem cria a turma passa a ser o coordenador responsável."
      />
      <div className="grid items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Cartao titulo={`Minhas turmas (${turmas.length})`}>
          {turmas.length === 0 ? (
            <EstadoVazio>Nenhuma turma sob sua responsabilidade.</EstadoVazio>
          ) : (
            <table className="tabela-responsiva w-full text-[15px]">
              <thead>
                <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                  <th className="pb-2.5">Turma</th>
                  <th className="pb-2.5">Disciplina</th>
                  <th className="pb-2.5">Professor</th>
                  <th className="pb-2.5 text-right">Estudantes</th>
                </tr>
              </thead>
              <tbody>
                {turmas.map((t) => (
                  <tr key={t.id} className="border-t border-traco">
                    <td data-rotulo="Turma" className="py-3 pr-2">
                      <Link href={`/coordenador/turmas/${t.id}`} className={CLASSE_LINK}>{t.nome}</Link>{" "}
                      <Etiqueta>{t.periodo}</Etiqueta>
                    </td>
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
          {disciplinas.length === 0 ? (
            <Mensagem tipo="info">
              Cadastre uma <Link href="/coordenador/disciplinas" className="underline">disciplina</Link> antes de criar turmas.
            </Mensagem>
          ) : (
            <FormularioApi
              url="/api/turmas"
              textoBotao="Cadastrar turma"
              mensagemSucesso="Turma cadastrada. Você é o coordenador responsável por ela."
              campos={[
                { nome: "nome", rotulo: "Nome" },
                { nome: "periodo", rotulo: "Período (ex.: 2026/2)" },
                {
                  nome: "disciplinaId",
                  rotulo: "Disciplina",
                  tipo: "select",
                  opcoes: disciplinas.map((d) => ({ valor: d.id, rotulo: d.nome })),
                },
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
