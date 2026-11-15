import { RECURSOS } from "@/domain/autorizacao";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { responderRequerimento } from "@/server/academico/requerimentos";
import { comRegistroDeErro } from "@/server/dados/erros";

// PATCH /api/requerimentos/:id — em análise, deferir ou indeferir (SPEC-036; professor ou secretaria responsável).
async function rotaPATCH(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.requerimentos);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await responderRequerimento(acesso.sessao, (await contexto.params).id, await lerCorpo(requisicao)), 200);
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const PATCH = comRegistroDeErro(rotaPATCH);
