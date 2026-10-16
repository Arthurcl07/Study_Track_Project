// GET /api/alertas — alertas de Atenção e Risco do escopo do perfil (SPEC-006, RF-12, OPEN-004).
import { RECURSOS } from "@/domain/autorizacao";
import { consultarAlertas } from "@/server/academico/painel";
import { autorizarApi } from "@/server/auth/guardas";

export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.consultaAlertas);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await consultarAlertas(acesso.sessao));
}
