// GET /api/notificacoes — notificações do próprio usuário e o total de não lidas (SPEC-022, RF-31, RB-23).
import { RECURSOS } from "@/domain/autorizacao";
import { consultarNotificacoes } from "@/server/academico/notificacoes";
import { autorizarApi } from "@/server/auth/guardas";

export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.notificacoes);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await consultarNotificacoes(acesso.sessao));
}
