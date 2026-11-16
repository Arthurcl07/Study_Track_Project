// PUT /api/contas/:id/perfil — trocar o perfil de uma conta (SPEC-053, RB-48). Só o Administrador.
import { RECURSOS } from "@/domain/autorizacao";
import { trocarPerfil } from "@/server/academico/contas";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaPUT(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.gestaoContas);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await trocarPerfil(id, await lerCorpo(requisicao), acesso.sessao.usuarioId), 200);
}

export const PUT = comRegistroDeErro(rotaPUT);
