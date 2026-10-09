import Link from "next/link";
import { notFound } from "next/navigation";
import { FormularioApi } from "@/components/formulario-api";
import { Painel } from "@/components/painel";
import { Secao } from "@/components/secao";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { buscarTurmaDoEscopo } from "@/server/dados/estrutura";

// SPEC-002 / RF-03: estudantes da turma, cadastro de estudante e matrícula de estudante existente.
export default async function DetalheTurma({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.cadastroAcademico);
  const { id } = await params;
  const turma = await buscarTurmaDoEscopo(sessao, id);
  if (!turma) notFound();
  const estudantes = turma.estudantes ?? [];
  return (
    <Painel sessao={sessao}>
      <Link href="/coordenador/turmas" className="text-sm text-indigo-700 underline">Voltar às turmas</Link>
      <Secao titulo={turma.nome}>
        <p className="text-slate-700">{turma.disciplina.nome} · {turma.periodo} · Professor: {turma.professor.nome}</p>
      </Secao>
      <Secao titulo={`Estudantes (${estudantes.length})`}>
        {estudantes.length === 0 ? (
          <p className="text-slate-600">Nenhum estudante matriculado.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {estudantes.map((e) => (
              <li key={e.id} className="py-2">{e.nome} <span className="text-slate-500">· {e.email}</span></li>
            ))}
          </ul>
        )}
      </Secao>
      <Secao titulo="Cadastrar novo estudante nesta turma">
        <FormularioApi
          url={`/api/turmas/${turma.id}/estudantes`}
          textoBotao="Cadastrar estudante"
          mensagemSucesso="Estudante cadastrado e matriculado."
          campos={[
            { nome: "nome", rotulo: "Nome" },
            { nome: "email", rotulo: "E-mail", tipo: "email" },
            { nome: "senha", rotulo: "Senha inicial (mínimo 8 caracteres)", tipo: "password" },
          ]}
        />
      </Secao>
      <Secao titulo="Matricular estudante já cadastrado">
        <FormularioApi
          url={`/api/turmas/${turma.id}/matriculas`}
          textoBotao="Matricular"
          mensagemSucesso="Estudante matriculado."
          campos={[{ nome: "email", rotulo: "E-mail do estudante", tipo: "email" }]}
        />
      </Secao>
    </Painel>
  );
}
