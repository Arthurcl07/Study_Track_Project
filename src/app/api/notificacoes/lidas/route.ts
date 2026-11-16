// POST /api/notificacoes/lidas — marca todas as notificações do próprio usuário como lidas (SPEC-022, AC-022-07).
import { RECURSOS } from "@/domain/autorizacao";
import { marcarTodasComoLidas } from "@/server/academico/notificacoes";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaPOST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.notificacoes);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await marcarTodasComoLidas(acesso.sessao));
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const POST = comRegistroDeErro(rotaPOST);
