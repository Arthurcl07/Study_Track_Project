import { RECURSOS } from "@/domain/autorizacao";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { responderRequerimento } from "@/server/academico/requerimentos";

// PATCH /api/requerimentos/:id — em análise, deferir ou indeferir (SPEC-036; professor ou secretaria responsável).
export async function PATCH(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.requerimentos);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await responderRequerimento(acesso.sessao, (await contexto.params).id, await lerCorpo(requisicao)), 200);
}
