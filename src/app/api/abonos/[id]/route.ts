// DELETE /api/abonos/:id — exclui o abono; as faltas voltam a contar (SPEC-032, AC-032-02). Só a secretaria.
import { RECURSOS } from "@/domain/autorizacao";
import { respostaDeResultado } from "@/server/academico/respostas";
import { excluirAbono } from "@/server/academico/secretaria";
import { autorizarApi } from "@/server/auth/guardas";

export async function DELETE(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await excluirAbono((await contexto.params).id, acesso.sessao.usuarioId), 200);
}
