// PUT /api/turmas/:id/vagas — vagas da turma para a rematrícula (SPEC-038, coordenador do curso).
import { RECURSOS } from "@/domain/autorizacao";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { definirVagas } from "@/server/academico/horarios";

export async function PUT(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.cadastroAcademico);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await definirVagas((await contexto.params).id, await lerCorpo(requisicao), acesso.sessao.usuarioId), 200);
}
