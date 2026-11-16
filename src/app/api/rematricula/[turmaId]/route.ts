import { RECURSOS } from "@/domain/autorizacao";
import { respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { cancelarRematricula } from "@/server/academico/rematricula";
import { comRegistroDeErro } from "@/server/dados/erros";

// DELETE /api/rematricula/:turmaId — cancela a própria matrícula na janela, sem registros (SPEC-038, RB-32).
async function rotaDELETE(requisicao: Request, contexto: { params: Promise<{ turmaId: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.rematricula);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await cancelarRematricula(acesso.sessao, (await contexto.params).turmaId), 200);
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const DELETE = comRegistroDeErro(rotaDELETE);
