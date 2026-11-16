// POST /api/notificacoes/:id/lida — marca como lida uma notificação do próprio usuário (SPEC-022, AC-022-06).
import { RECURSOS } from "@/domain/autorizacao";
import { marcarComoLida } from "@/server/academico/notificacoes";
import { respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaPOST(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.notificacoes);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await marcarComoLida(acesso.sessao, id), 200);
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const POST = comRegistroDeErro(rotaPOST);
