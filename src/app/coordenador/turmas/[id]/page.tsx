import { notFound } from "next/navigation";
import { Casca } from "@/components/casca";
import { FormularioApi } from "@/components/formulario-api";
import { CabecalhoPagina, Cartao, EstadoVazio } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { buscarTurmaDoEscopo, listarProfessores } from "@/server/dados/estrutura";

// SPEC-002 / RF-03: estudantes da turma, cadastro de estudante e matrícula de estudante existente.
// SPEC-010 / RF-17: troca do professor responsável (só professores ativos aparecem).
// Layout aprovado em docs/layout/prototipo.html#coordenador-turma e #cadastro-erro.
export default async function DetalheTurma({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.cadastroAcademico);
  const { id } = await params;
  const turma = await buscarTurmaDoEscopo(sessao, id);
  if (!turma) notFound();
  const estudantes = turma.estudantes ?? [];
  const outrosProfessores = (await listarProfessores()).filter((p) => p.id !== turma.professor.id);
  return (
    <Casca sessao={sessao} ativo="turmas">
      <CabecalhoPagina
        titulo={`${turma.nome} · ${turma.disciplina.nome}`}
        subtitulo={`Período ${turma.periodo} · Professor: ${turma.professor.nome}`}
        voltar={{ href: "/coordenador/turmas", rotulo: "Turmas e estudantes" }}
      />
      <div className="grid items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Cartao titulo={`Estudantes matriculados (${estudantes.length})`}>
          {estudantes.length === 0 ? (
            <EstadoVazio>Nenhum estudante matriculado. Cadastre ou matricule ao lado.</EstadoVazio>
          ) : (
            <table className="tabela-responsiva w-full text-[15px]">
              <thead>
                <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                  <th className="pb-2.5">Nome</th>
                  <th className="pb-2.5">E-mail</th>
                </tr>
              </thead>
              <tbody>
                {estudantes.map((e) => (
                  <tr key={e.id} className="border-t border-traco">
                    <td data-rotulo="Nome" className="py-3 pr-2">{e.nome}</td>
                    <td data-rotulo="E-mail" className="py-3 break-all text-mudo">{e.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Cartao>
        <div className="space-y-5">
          <Cartao titulo="Cadastrar novo estudante">
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
          </Cartao>
          <Cartao titulo="Matricular estudante já cadastrado">
            <FormularioApi
              url={`/api/turmas/${turma.id}/matriculas`}
              textoBotao="Matricular"
              mensagemSucesso="Estudante matriculado."
              secundario
              campos={[{ nome: "email", rotulo: "E-mail do estudante", tipo: "email" }]}
            />
          </Cartao>
          <Cartao titulo="Professor responsável">
            <p className="mb-3 text-sm text-mudo">
              Hoje: <strong className="font-medium text-texto">{turma.professor.nome}</strong>. Os planos de recuperação ativos da turma passam para o novo professor.
            </p>
            {outrosProfessores.length === 0 ? (
              <p className="text-sm text-mudo">Não há outro professor ativo para assumir a turma.</p>
            ) : (
              <FormularioApi
                url={`/api/turmas/${turma.id}/professor`}
                textoBotao="Trocar professor"
                mensagemSucesso="Professor da turma trocado."
                secundario
                campos={[{ nome: "professorId", rotulo: "Novo professor", tipo: "select", opcoes: outrosProfessores.map((p) => ({ valor: p.id, rotulo: p.nome })) }]}
              />
            )}
          </Cartao>
        </div>
      </div>
    </Casca>
  );
}
