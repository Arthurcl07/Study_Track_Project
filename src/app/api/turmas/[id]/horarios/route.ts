// POST /api/turmas/:id/horarios — inclui horário na turma, sem choque (SPEC-041, coordenador do curso).
import { RECURSOS } from "@/domain/autorizacao";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { incluirHorario } from "@/server/academico/horarios";

export async function POST(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.cadastroAcademico);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await incluirHorario((await contexto.params).id, await lerCorpo(requisicao), acesso.sessao.usuarioId));
}
