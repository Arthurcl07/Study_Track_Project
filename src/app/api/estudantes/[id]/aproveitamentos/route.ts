import { RECURSOS } from "@/domain/autorizacao";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { registrarAproveitamento } from "@/server/academico/matriz";

// POST /api/estudantes/:id/aproveitamentos — registra aproveitamento de estudos (SPEC-042, secretaria).
export async function POST(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await registrarAproveitamento((await contexto.params).id, await lerCorpo(requisicao), acesso.sessao.usuarioId));
}
