// GET /api/painel — painel acadêmico do estudante autenticado (SPEC-007, RF-10, UC-02).
import { RECURSOS } from "@/domain/autorizacao";
import { consultarPainel } from "@/server/academico/painel";
import { autorizarApi } from "@/server/auth/guardas";

export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.painelEstudante);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await consultarPainel(acesso.sessao));
}
