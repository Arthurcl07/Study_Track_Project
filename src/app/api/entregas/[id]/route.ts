// DELETE /api/entregas/:id — desfazer registro de entrega feito por engano (SPEC-005, OPEN-003).
import { RECURSOS } from "@/domain/autorizacao";
import { desfazerEntrega } from "@/server/academico/atividades";
import { respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function DELETE(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.registroFrequenciaAtividades);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await desfazerEntrega(id, acesso.sessao.usuarioId), 200);
}
