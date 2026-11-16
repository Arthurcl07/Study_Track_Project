// GET /api/pedidos-senha — pedidos pendentes e resolvidos recentes (SPEC-027, Administrador).
import { RECURSOS } from "@/domain/autorizacao";
import { autorizarApi } from "@/server/auth/guardas";
import { listarPedidos } from "@/server/auth/pedidos-senha";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaGET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.pedidosSenha);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await listarPedidos());
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const GET = comRegistroDeErro(rotaGET);
