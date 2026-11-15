// POST /api/notas — registrar nota (SPEC-004, UC-03): turma, avaliação, estudante e valor.
import { RECURSOS } from "@/domain/autorizacao";
import { registrarNota } from "@/server/academico/notas";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaPOST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.registroDesempenho);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await registrarNota(await lerCorpo(requisicao), acesso.sessao.usuarioId));
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const POST = comRegistroDeErro(rotaPOST);
