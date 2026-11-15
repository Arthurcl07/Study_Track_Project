// PUT /api/instituicao/regras — salvar as regras de avaliação e recalcular os períodos abertos (SPEC-052, RB-47).
// GET devolve a regra vigente. Só a secretaria.
import { RECURSOS } from "@/domain/autorizacao";
import { salvarRegra } from "@/server/academico/regras";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";
import { regraVigente } from "@/server/dados/regras";

async function rotaGET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await regraVigente());
}

async function rotaPUT(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await salvarRegra(await lerCorpo(requisicao), acesso.sessao.usuarioId), 200);
}

export const GET = comRegistroDeErro(rotaGET);
export const PUT = comRegistroDeErro(rotaPUT);
