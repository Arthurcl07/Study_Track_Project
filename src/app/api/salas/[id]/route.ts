// PATCH e DELETE /api/salas/:id — altera e exclui sala sem horário (SPEC-041, secretaria).
import { RECURSOS } from "@/domain/autorizacao";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { excluirSala, salvarSala } from "@/server/academico/horarios";

export async function PATCH(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await salvarSala(await lerCorpo(requisicao), acesso.sessao.usuarioId, (await contexto.params).id), 200);
}

export async function DELETE(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await excluirSala((await contexto.params).id, acesso.sessao.usuarioId), 200);
}
