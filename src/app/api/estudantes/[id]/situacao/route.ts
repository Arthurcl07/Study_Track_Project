// PUT /api/estudantes/:id/situacao — trancar, transferir, cancelar, concluir ou reativar (SPEC-031, RB-30). Só a secretaria.
import { RECURSOS } from "@/domain/autorizacao";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { mudarSituacao } from "@/server/academico/secretaria";

export async function PUT(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await mudarSituacao((await contexto.params).id, await lerCorpo(requisicao), acesso.sessao.usuarioId), 200);
}
