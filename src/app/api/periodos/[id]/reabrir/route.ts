// POST /api/periodos/:id/reabrir — reabre o período: as escritas voltam a ser aceitas (SPEC-017, Administrador).
import { RECURSOS } from "@/domain/autorizacao";
import { mudarStatusDoPeriodo } from "@/server/academico/periodos";
import { respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaPOST(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.gestaoPeriodos);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await mudarStatusDoPeriodo(id, "Aberto", acesso.sessao.usuarioId), 200);
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const POST = comRegistroDeErro(rotaPOST);
