// POST /api/frequencias — registrar ou alterar frequência (SPEC-005, RF-07): turma, estudante e percentual.
import { RECURSOS } from "@/domain/autorizacao";
import { registrarFrequencia } from "@/server/academico/atividades";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function POST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.registroFrequenciaAtividades);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await registrarFrequencia(await lerCorpo(requisicao), acesso.sessao.usuarioId), 200);
}
