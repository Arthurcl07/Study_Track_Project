import { RECURSOS } from "@/domain/autorizacao";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { salvarLinhaDaMatriz } from "@/server/academico/matriz";

// PUT /api/cursos/:id/matriz/:disciplinaId — semestre, caráter e pré-requisitos (SPEC-037, coordenador do curso).
export async function PUT(requisicao: Request, contexto: { params: Promise<{ id: string; disciplinaId: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.cadastroAcademico);
  if ("negado" in acesso) return acesso.negado;
  const { id, disciplinaId } = await contexto.params;
  return respostaDeResultado(await salvarLinhaDaMatriz(id, disciplinaId, await lerCorpo(requisicao), acesso.sessao.usuarioId), 200);
}
