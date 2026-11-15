import { RECURSOS } from "@/domain/autorizacao";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { definirJanela } from "@/server/academico/rematricula";
import { comRegistroDeErro } from "@/server/dados/erros";

// PUT /api/periodos/:id/rematricula — janela de rematrícula do período aberto (SPEC-038, secretaria).
async function rotaPUT(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.gestaoPeriodos);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await definirJanela((await contexto.params).id, await lerCorpo(requisicao), acesso.sessao.usuarioId), 200);
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const PUT = comRegistroDeErro(rotaPUT);
