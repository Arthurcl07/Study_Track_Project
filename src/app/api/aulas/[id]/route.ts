// PATCH e DELETE /api/aulas/:id — mudar a data e excluir aula (SPEC-026/028, Professor da turma).
import { RECURSOS } from "@/domain/autorizacao";
import { mudarDataDaAula, excluirAula } from "@/server/academico/chamada";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function PATCH(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.registroFrequenciaAtividades);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await mudarDataDaAula(id, await lerCorpo(requisicao), acesso.sessao.usuarioId), 200);
}

export async function DELETE(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.registroFrequenciaAtividades);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await excluirAula(id, acesso.sessao.usuarioId), 200);
}
