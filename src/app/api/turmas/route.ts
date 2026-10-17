// /api/turmas — GET: turmas do escopo do perfil (INV-002-06); POST: cadastro de turma (Coordenador).
import { RECURSOS } from "@/domain/autorizacao";
import { cadastrarTurma } from "@/server/academico/cadastros";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { listarTurmasDoEscopo } from "@/server/dados/estrutura";

export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.consultaTurmas);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await listarTurmasDoEscopo(acesso.sessao));
}

export async function POST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.cadastroAcademico);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await cadastrarTurma(await lerCorpo(requisicao), acesso.sessao.usuarioId));
}
