// POST /api/planos/:id/encerrar — encerrar plano de recuperação (SPEC-008, OPEN-012).
import { RECURSOS } from "@/domain/autorizacao";
import { encerrarPlanoDoProfessor } from "@/server/academico/planos";
import { respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function POST(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.planoRecuperacao);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await encerrarPlanoDoProfessor(id, acesso.sessao.usuarioId), 200);
}
