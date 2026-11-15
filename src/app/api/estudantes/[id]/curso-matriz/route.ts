// GET /api/estudantes/:id/curso-matriz — matriz com a situação de cada disciplina e a integralização (SPEC-037).
// O próprio estudante, o coordenador do curso e a secretaria (escopo na query).
import { consultarCursoDoEstudante } from "@/server/academico/matriz";
import { contaDaRequisicao } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaGET(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const conta = await contaDaRequisicao(requisicao);
  if (!conta) return Response.json({ erro: "Autenticação necessária." }, { status: 401 });
  if (conta.trocarSenha) return Response.json({ erro: "Defina a sua senha antes de continuar." }, { status: 403 });
  const curso = await consultarCursoDoEstudante(conta.sessao, (await contexto.params).id);
  return curso ? Response.json(curso) : Response.json({ erro: "Estudante não encontrado." }, { status: 404 });
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const GET = comRegistroDeErro(rotaGET);
