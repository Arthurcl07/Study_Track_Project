// POST /api/notificacoes/lidas — marca todas as notificações do próprio usuário como lidas (SPEC-022, AC-022-07).
import { RECURSOS } from "@/domain/autorizacao";
import { marcarTodasComoLidas } from "@/server/academico/notificacoes";
import { autorizarApi } from "@/server/auth/guardas";

export async function POST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.notificacoes);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await marcarTodasComoLidas(acesso.sessao));
}
