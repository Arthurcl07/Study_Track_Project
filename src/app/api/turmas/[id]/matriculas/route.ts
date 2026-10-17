// POST /api/turmas/:id/matriculas — matricula estudante já cadastrado (RF-04, N:M, Coordenador responsável).
import { RECURSOS } from "@/domain/autorizacao";
import { matricularEstudante } from "@/server/academico/cadastros";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function POST(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.cadastroAcademico);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await matricularEstudante(await lerCorpo(requisicao), id, acesso.sessao.usuarioId));
}
