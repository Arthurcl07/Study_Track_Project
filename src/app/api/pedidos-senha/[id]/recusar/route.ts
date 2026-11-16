// POST /api/pedidos-senha/:id/recusar — encerra o pedido sem mudar a senha (SPEC-027, AC-027-05).
import { RECURSOS } from "@/domain/autorizacao";
import { respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { recusarPedido } from "@/server/auth/pedidos-senha";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaPOST(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.pedidosSenha);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await recusarPedido(id, acesso.sessao.usuarioId), 200);
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const POST = comRegistroDeErro(rotaPOST);
