// POST /api/cursos/:id/disciplinas — adiciona à grade do curso uma disciplina que já existe
// (SPEC-015, RF-23, OPEN-033). Só o coordenador do curso (RB-04).
import { RECURSOS } from "@/domain/autorizacao";
import { adicionarDisciplinaAoCurso } from "@/server/academico/cadastros";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function POST(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.cadastroAcademico);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await adicionarDisciplinaAoCurso(id, await lerCorpo(requisicao), acesso.sessao.usuarioId));
}
