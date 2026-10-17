// PATCH /api/planos/itens/:id — marcar ou desmarcar item do plano como concluído (SPEC-008, RB-12, OPEN-003).
import { RECURSOS } from "@/domain/autorizacao";
import { marcarItemDoPlano } from "@/server/academico/planos";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function PATCH(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.planoRecuperacao);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await marcarItemDoPlano(id, await lerCorpo(requisicao), acesso.sessao.usuarioId), 200);
}
