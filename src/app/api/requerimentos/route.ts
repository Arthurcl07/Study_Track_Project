import { RECURSOS } from "@/domain/autorizacao";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { abrirRequerimento, listarRequerimentos } from "@/server/academico/requerimentos";
import { comRegistroDeErro } from "@/server/dados/erros";

// GET e POST /api/requerimentos — lista do escopo e abertura pelo estudante (SPEC-036, RB-34).
async function rotaGET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.requerimentos);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await listarRequerimentos(acesso.sessao));
}

async function rotaPOST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.requerimentos);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await abrirRequerimento(acesso.sessao, await lerCorpo(requisicao)));
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const GET = comRegistroDeErro(rotaGET);
export const POST = comRegistroDeErro(rotaPOST);
