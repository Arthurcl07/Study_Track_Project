import { RECURSOS } from "@/domain/autorizacao";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { consultarRematricula, rematricular } from "@/server/academico/rematricula";
import { comRegistroDeErro } from "@/server/dados/erros";

// GET e POST /api/rematricula — turmas da janela e matrícula pelo próprio estudante (SPEC-038).
async function rotaGET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.rematricula);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await consultarRematricula(acesso.sessao));
}

async function rotaPOST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.rematricula);
  if ("negado" in acesso) return acesso.negado;
  const corpo = await lerCorpo(requisicao);
  return respostaDeResultado(await rematricular(acesso.sessao, typeof corpo.turmaId === "string" ? corpo.turmaId : ""));
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const GET = comRegistroDeErro(rotaGET);
export const POST = comRegistroDeErro(rotaPOST);
