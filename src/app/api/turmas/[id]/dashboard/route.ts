// GET /api/turmas/:id/dashboard — dashboard da turma do professor (SPEC-008, RF-13). Fora do escopo: 403.
import { RECURSOS } from "@/domain/autorizacao";
import { consultarTurmaDoProfessor } from "@/server/academico/planos";
import { autorizarApi } from "@/server/auth/guardas";

export async function GET(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.planoRecuperacao);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  const turma = await consultarTurmaDoProfessor(acesso.sessao.usuarioId, id);
  return turma ? Response.json(turma) : Response.json({ erro: "Acesso negado." }, { status: 403 });
}
