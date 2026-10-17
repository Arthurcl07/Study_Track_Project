// GET /api/atividades — atividades com status de entrega do escopo do perfil (SPEC-005, RF-09, RNF-05).
import { RECURSOS } from "@/domain/autorizacao";
import { consultarAtividades } from "@/server/academico/atividades";
import { autorizarApi } from "@/server/auth/guardas";

export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.consultaAtividades);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await consultarAtividades(acesso.sessao));
}
