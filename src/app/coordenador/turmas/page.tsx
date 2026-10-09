import Link from "next/link";
import { FormularioApi } from "@/components/formulario-api";
import { Painel } from "@/components/painel";
import { Secao } from "@/components/secao";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { listarDisciplinas, listarProfessores, listarTurmasDoEscopo } from "@/server/dados/estrutura";

// SPEC-002 / RF-04: turmas sob responsabilidade do coordenador e cadastro de nova turma.
export default async function Turmas() {
  const sessao = await exigirAcessoPagina(RECURSOS.cadastroAcademico);
  const [turmas, disciplinas, professores] = await Promise.all([
    listarTurmasDoEscopo(sessao),
    listarDisciplinas(),
    listarProfessores(),
  ]);
  return (
    <Painel sessao={sessao}>
      <Link href="/coordenador" className="text-sm text-indigo-700 underline">Voltar</Link>
      <Secao titulo="Nova turma">
        {disciplinas.length === 0 ? (
          <p className="text-slate-600">
            Cadastre uma <Link href="/coordenador/disciplinas" className="text-indigo-700 underline">disciplina</Link> antes.
          </p>
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
      </Secao>
      <Secao titulo={`Minhas turmas (${turmas.length})`}>
        {turmas.length === 0 ? (
          <p className="text-slate-600">Nenhuma turma sob sua responsabilidade.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {turmas.map((t) => (
              <li key={t.id} className="py-2">
                <Link href={`/coordenador/turmas/${t.id}`} className="font-medium text-indigo-700 underline">{t.nome}</Link>
                <span className="text-slate-500">
                  {" "}· {t.periodo} · {t.disciplina.nome} · Prof. {t.professor.nome} · {t.estudantes?.length ?? 0} estudante(s)
                </span>
              </li>
            ))}
          </ul>
        )}
      </Secao>
    </Painel>
  );
}
