// GET e POST /api/comunicados — mural e publicação de comunicados (SPEC-025, RF-34, RB-26).
import { RECURSOS } from "@/domain/autorizacao";
import { consultarMural, publicarComunicado } from "@/server/academico/comunicados";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.comunicados);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await consultarMural(acesso.sessao));
}

export async function POST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.comunicados);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await publicarComunicado(acesso.sessao, await lerCorpo(requisicao)));
}
