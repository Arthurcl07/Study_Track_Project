// POST /api/turmas/:id/atividades — cadastrar atividade (SPEC-005, RF-08): descrição e prazo.
import { RECURSOS } from "@/domain/autorizacao";
import { cadastrarAtividade } from "@/server/academico/atividades";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function POST(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.registroFrequenciaAtividades);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await cadastrarAtividade(await lerCorpo(requisicao), id, acesso.sessao.usuarioId));
}
