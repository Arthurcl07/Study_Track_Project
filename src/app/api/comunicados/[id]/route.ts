// DELETE /api/comunicados/:id — o autor apaga o próprio comunicado (SPEC-025, AC-025-07, INV-025-05).
import { RECURSOS } from "@/domain/autorizacao";
import { apagarComunicado } from "@/server/academico/comunicados";
import { respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaDELETE(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.comunicados);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await apagarComunicado(acesso.sessao, id), 200);
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const DELETE = comRegistroDeErro(rotaDELETE);
