// POST /api/atividades/:id/entregas — registrar entrega de um estudante (SPEC-005, OPEN-003).
import { RECURSOS } from "@/domain/autorizacao";
import { registrarEntrega } from "@/server/academico/atividades";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function POST(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.registroFrequenciaAtividades);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await registrarEntrega(await lerCorpo(requisicao), id, acesso.sessao.usuarioId));
}
