// PATCH e DELETE /api/avaliacoes/:id — editar e excluir avaliação (SPEC-026/029, Professor da turma).
import { RECURSOS } from "@/domain/autorizacao";
import { editarAvaliacao, excluirAvaliacao } from "@/server/academico/correcoes";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaPATCH(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.registroDesempenho);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await editarAvaliacao(id, await lerCorpo(requisicao), acesso.sessao.usuarioId), 200);
}

async function rotaDELETE(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.registroDesempenho);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await excluirAvaliacao(id, acesso.sessao.usuarioId), 200);
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const PATCH = comRegistroDeErro(rotaPATCH);
export const DELETE = comRegistroDeErro(rotaDELETE);
