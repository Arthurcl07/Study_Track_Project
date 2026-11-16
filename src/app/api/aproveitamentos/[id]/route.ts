import { RECURSOS } from "@/domain/autorizacao";
import { respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { excluirAproveitamento } from "@/server/academico/matriz";
import { comRegistroDeErro } from "@/server/dados/erros";

// DELETE /api/aproveitamentos/:id — exclui aproveitamento (SPEC-042, secretaria).
async function rotaDELETE(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await excluirAproveitamento((await contexto.params).id, acesso.sessao.usuarioId), 200);
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const DELETE = comRegistroDeErro(rotaDELETE);
