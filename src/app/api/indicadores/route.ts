// GET /api/indicadores — indicadores vigentes do escopo do perfil (SPEC-003; RNF-03, RNF-05, ADR-003).
import { RECURSOS } from "@/domain/autorizacao";
import { autorizarApi } from "@/server/auth/guardas";
import { listarIndicadoresDoEscopo } from "@/server/dados/indicadores";

export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.consultaIndicadores);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await listarIndicadoresDoEscopo(acesso.sessao));
}
