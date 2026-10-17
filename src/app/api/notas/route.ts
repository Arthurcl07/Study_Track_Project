// POST /api/notas — registrar nota (SPEC-004, UC-03): turma, avaliação, estudante e valor.
import { RECURSOS } from "@/domain/autorizacao";
import { registrarNota } from "@/server/academico/notas";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function POST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.registroDesempenho);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await registrarNota(await lerCorpo(requisicao), acesso.sessao.usuarioId));
}
