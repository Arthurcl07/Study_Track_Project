// PATCH /api/notas/:id — alterar nota já lançada (SPEC-004, fluxo alternativo do UC-03).
import { RECURSOS } from "@/domain/autorizacao";
import { alterarNota } from "@/server/academico/notas";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function PATCH(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.registroDesempenho);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await alterarNota(id, await lerCorpo(requisicao), acesso.sessao.usuarioId), 200);
}
