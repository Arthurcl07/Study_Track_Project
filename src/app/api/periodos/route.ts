// GET /api/periodos e POST /api/periodos — períodos letivos, só pelo Administrador (SPEC-017, RF-26, UC-17).
import { RECURSOS } from "@/domain/autorizacao";
import { criarPeriodo, listarPeriodos } from "@/server/academico/periodos";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.gestaoPeriodos);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await listarPeriodos());
}

export async function POST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.gestaoPeriodos);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await criarPeriodo(await lerCorpo(requisicao)));
}
