// PATCH e DELETE /api/disciplinas/:id — editar e excluir disciplina (SPEC-026, Coordenador dos cursos dela).
import { RECURSOS } from "@/domain/autorizacao";
import { editarDisciplina, excluirDisciplina } from "@/server/academico/correcoes";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function PATCH(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.cadastroAcademico);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await editarDisciplina(id, await lerCorpo(requisicao), acesso.sessao.usuarioId), 200);
}

export async function DELETE(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.cadastroAcademico);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await excluirDisciplina(id, acesso.sessao.usuarioId), 200);
}
