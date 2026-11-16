// GET /api/painel — painel acadêmico do estudante autenticado (SPEC-007, RF-10, UC-02).
import { RECURSOS } from "@/domain/autorizacao";
import { consultarPainel } from "@/server/academico/painel";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaGET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.painelEstudante);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await consultarPainel(acesso.sessao));
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const GET = comRegistroDeErro(rotaGET);
