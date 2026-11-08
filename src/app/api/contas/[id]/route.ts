// PATCH /api/contas/:id — editar nome e e-mail da conta (SPEC-026, Administrador).
import { RECURSOS } from "@/domain/autorizacao";
import { editarConta } from "@/server/academico/correcoes";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function PATCH(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.gestaoContas);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await editarConta(id, await lerCorpo(requisicao), acesso.sessao.usuarioId), 200);
}
