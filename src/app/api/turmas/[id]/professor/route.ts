// POST /api/turmas/:id/professor — troca o professor da turma (SPEC-010, RF-17, Coordenador responsável).
import { RECURSOS } from "@/domain/autorizacao";
import { trocarProfessor } from "@/server/academico/cadastros";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function POST(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.cadastroAcademico);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await trocarProfessor(await lerCorpo(requisicao), id, acesso.sessao.usuarioId), 200);
}
