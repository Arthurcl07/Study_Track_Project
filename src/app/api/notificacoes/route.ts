// GET /api/notificacoes — notificações do próprio usuário e o total de não lidas (SPEC-022, RF-31, RB-23).
import { RECURSOS } from "@/domain/autorizacao";
import { consultarNotificacoes } from "@/server/academico/notificacoes";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaGET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.notificacoes);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await consultarNotificacoes(acesso.sessao, new URL(requisicao.url).searchParams.get("pagina")));
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const GET = comRegistroDeErro(rotaGET);
