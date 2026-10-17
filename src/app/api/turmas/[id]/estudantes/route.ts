// POST /api/turmas/:id/estudantes — cadastra estudante já vinculado à turma (RF-03, Coordenador responsável).
import { RECURSOS } from "@/domain/autorizacao";
import { cadastrarEstudante } from "@/server/academico/cadastros";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function POST(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.cadastroAcademico);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await cadastrarEstudante(await lerCorpo(requisicao), id, acesso.sessao.usuarioId));
}
