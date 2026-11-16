// POST /api/instituicao/regras/previa — quantas matrículas mudariam de situação, sem gravar (SPEC-052, AC-052-01).
import { RECURSOS } from "@/domain/autorizacao";
import { previaDaRegra } from "@/server/academico/regras";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaPOST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await previaDaRegra(await lerCorpo(requisicao)), 200);
}

export const POST = comRegistroDeErro(rotaPOST);
