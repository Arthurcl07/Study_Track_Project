// GET /api/grade — grade da semana do estudante ou do professor (SPEC-041).
import { RECURSOS } from "@/domain/autorizacao";
import { gradeDaSemana } from "@/server/academico/horarios";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaGET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.calendario);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await gradeDaSemana(acesso.sessao));
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const GET = comRegistroDeErro(rotaGET);
