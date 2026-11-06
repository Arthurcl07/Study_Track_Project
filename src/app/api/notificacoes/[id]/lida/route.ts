// POST /api/notificacoes/:id/lida — marca como lida uma notificação do próprio usuário (SPEC-022, AC-022-06).
import { RECURSOS } from "@/domain/autorizacao";
import { marcarComoLida } from "@/server/academico/notificacoes";
import { respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function POST(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.notificacoes);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await marcarComoLida(acesso.sessao, id), 200);
}
