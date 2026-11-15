// PATCH e DELETE /api/atividades/:id — editar e excluir atividade (SPEC-026, Professor da turma).
import { RECURSOS } from "@/domain/autorizacao";
import { editarAtividade, excluirAtividade } from "@/server/academico/correcoes";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaPATCH(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.registroFrequenciaAtividades);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await editarAtividade(id, await lerCorpo(requisicao), acesso.sessao.usuarioId), 200);
}

async function rotaDELETE(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.registroFrequenciaAtividades);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await excluirAtividade(id, acesso.sessao.usuarioId), 200);
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const PATCH = comRegistroDeErro(rotaPATCH);
export const DELETE = comRegistroDeErro(rotaDELETE);
