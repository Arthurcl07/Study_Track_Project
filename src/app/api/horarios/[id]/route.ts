// DELETE /api/horarios/:id — exclui horário de turma (SPEC-041, coordenador do curso).
import { RECURSOS } from "@/domain/autorizacao";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { excluirHorario } from "@/server/academico/horarios";

export async function DELETE(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.cadastroAcademico);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await excluirHorario((await contexto.params).id, acesso.sessao.usuarioId), 200);
}
