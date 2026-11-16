// GET /api/atividades — atividades com status de entrega do escopo do perfil (SPEC-005, RF-09, RNF-05).
import { RECURSOS } from "@/domain/autorizacao";
import { consultarAtividades } from "@/server/academico/atividades";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaGET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.consultaAtividades);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await consultarAtividades(acesso.sessao));
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const GET = comRegistroDeErro(rotaGET);
