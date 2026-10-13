// POST /api/turmas/:id/avaliacoes — professor responsável cadastra avaliação (SPEC-004, OPEN-001, OPEN-017).
import { RECURSOS } from "@/domain/autorizacao";
import { cadastrarAvaliacao } from "@/server/academico/notas";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function POST(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.registroDesempenho);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await cadastrarAvaliacao(await lerCorpo(requisicao), id, acesso.sessao.usuarioId));
}
