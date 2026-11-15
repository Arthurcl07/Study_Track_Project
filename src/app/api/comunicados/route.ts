// GET e POST /api/comunicados — mural e publicação de comunicados (SPEC-025, RF-34, RB-26).
import { RECURSOS } from "@/domain/autorizacao";
import { consultarMural, publicarComunicado } from "@/server/academico/comunicados";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaGET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.comunicados);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await consultarMural(acesso.sessao));
}

async function rotaPOST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.comunicados);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await publicarComunicado(acesso.sessao, await lerCorpo(requisicao)));
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const GET = comRegistroDeErro(rotaGET);
export const POST = comRegistroDeErro(rotaPOST);
