// PATCH e DELETE /api/calendario/:id — altera e exclui evento do calendário (SPEC-040, secretaria).
import { RECURSOS } from "@/domain/autorizacao";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { excluirEvento, salvarEvento } from "@/server/academico/calendario";

export async function PATCH(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await salvarEvento(await lerCorpo(requisicao), acesso.sessao.usuarioId, (await contexto.params).id), 200);
}

export async function DELETE(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await excluirEvento((await contexto.params).id, acesso.sessao.usuarioId), 200);
}
