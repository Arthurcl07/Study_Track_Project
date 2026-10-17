// GET /api/contas?perfil= e POST /api/contas — gestão de contas pelo Administrador (SPEC-010, RF-16).
import { RECURSOS } from "@/domain/autorizacao";
import { criarConta, listarContas } from "@/server/academico/contas";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.gestaoContas);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await listarContas(new URL(requisicao.url).searchParams.get("perfil")));
}

export async function POST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.gestaoContas);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await criarConta(await lerCorpo(requisicao)));
}
