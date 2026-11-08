// POST /api/pedidos-senha/:id/aprovar — gera a senha provisória, mostrada uma única vez (SPEC-027, RB-27).
import { RECURSOS } from "@/domain/autorizacao";
import { respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { aprovarPedido } from "@/server/auth/pedidos-senha";

export async function POST(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.pedidosSenha);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  const resposta = respostaDeResultado(await aprovarPedido(id, acesso.sessao.usuarioId), 200);
  resposta.headers.set("Cache-Control", "no-store");
  return resposta;
}
