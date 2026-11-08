import { RECURSOS } from "@/domain/autorizacao";
import { respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { excluirAproveitamento } from "@/server/academico/matriz";

// DELETE /api/aproveitamentos/:id — exclui aproveitamento (SPEC-042, secretaria).
export async function DELETE(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await excluirAproveitamento((await contexto.params).id, acesso.sessao.usuarioId), 200);
}
