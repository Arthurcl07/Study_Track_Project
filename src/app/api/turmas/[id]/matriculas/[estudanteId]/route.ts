// DELETE /api/turmas/:id/matriculas/:estudanteId — tirar da turma quem foi matriculado por engano (SPEC-026, RB-32).
import { RECURSOS } from "@/domain/autorizacao";
import { tirarDaTurma } from "@/server/academico/correcoes";
import { respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function DELETE(requisicao: Request, contexto: { params: Promise<{ id: string; estudanteId: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.cadastroAcademico);
  if ("negado" in acesso) return acesso.negado;
  const { id, estudanteId } = await contexto.params;
  return respostaDeResultado(await tirarDaTurma(id, estudanteId, acesso.sessao.usuarioId), 200);
}
