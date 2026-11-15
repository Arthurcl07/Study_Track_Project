// POST /api/turmas/:id/avaliacoes — professor responsável cadastra avaliação (SPEC-004, OPEN-001, OPEN-017).
import { RECURSOS } from "@/domain/autorizacao";
import { cadastrarAvaliacao } from "@/server/academico/notas";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaPOST(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.registroDesempenho);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await cadastrarAvaliacao(await lerCorpo(requisicao), id, acesso.sessao.usuarioId));
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const POST = comRegistroDeErro(rotaPOST);
