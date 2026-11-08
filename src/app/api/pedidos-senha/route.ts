// GET /api/pedidos-senha — pedidos pendentes e resolvidos recentes (SPEC-027, Administrador).
import { RECURSOS } from "@/domain/autorizacao";
import { autorizarApi } from "@/server/auth/guardas";
import { listarPedidos } from "@/server/auth/pedidos-senha";

export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.pedidosSenha);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await listarPedidos());
}
