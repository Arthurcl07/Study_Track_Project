// POST /api/turmas/:id/diario — fechar (professor da turma); homologar, devolver e reabrir (coordenador do curso)
// (SPEC-039, RB-37). Quem pode fazer cada ação é conferido no caso de uso, com o escopo na query.
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { mudarDiario } from "@/server/academico/diario";
import { contaDaRequisicao } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaPOST(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const conta = await contaDaRequisicao(requisicao);
  if (!conta) return Response.json({ erro: "Autenticação necessária." }, { status: 401 });
  if (conta.trocarSenha) return Response.json({ erro: "Defina a sua senha antes de continuar." }, { status: 403 });
  return respostaDeResultado(await mudarDiario((await contexto.params).id, await lerCorpo(requisicao), conta.sessao), 200);
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const POST = comRegistroDeErro(rotaPOST);
