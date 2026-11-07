// PATCH e DELETE /api/avaliacoes/:id — editar e excluir avaliação (SPEC-026/029, Professor da turma).
import { RECURSOS } from "@/domain/autorizacao";
import { editarAvaliacao, excluirAvaliacao } from "@/server/academico/correcoes";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function PATCH(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.registroDesempenho);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await editarAvaliacao(id, await lerCorpo(requisicao), acesso.sessao.usuarioId), 200);
}

export async function DELETE(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.registroDesempenho);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await excluirAvaliacao(id, acesso.sessao.usuarioId), 200);
}
