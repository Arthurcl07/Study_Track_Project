// PATCH e DELETE /api/atividades/:id — editar e excluir atividade (SPEC-026, Professor da turma).
import { RECURSOS } from "@/domain/autorizacao";
import { editarAtividade, excluirAtividade } from "@/server/academico/correcoes";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function PATCH(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.registroFrequenciaAtividades);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await editarAtividade(id, await lerCorpo(requisicao), acesso.sessao.usuarioId), 200);
}

export async function DELETE(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.registroFrequenciaAtividades);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await excluirAtividade(id, acesso.sessao.usuarioId), 200);
}
