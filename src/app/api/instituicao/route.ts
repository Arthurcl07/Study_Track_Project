// GET e PUT /api/instituicao — dados da instituição usados nos documentos (SPEC-033, RF-42). Só a secretaria.
import { RECURSOS } from "@/domain/autorizacao";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { obterInstituicao, salvarInstituicao } from "@/server/academico/secretaria";

export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await obterInstituicao());
}

export async function PUT(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await salvarInstituicao(await lerCorpo(requisicao), acesso.sessao.usuarioId), 200);
}
