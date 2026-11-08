import { RECURSOS } from "@/domain/autorizacao";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { abrirRequerimento, listarRequerimentos } from "@/server/academico/requerimentos";

// GET e POST /api/requerimentos — lista do escopo e abertura pelo estudante (SPEC-036, RB-34).
export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.requerimentos);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await listarRequerimentos(acesso.sessao));
}

export async function POST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.requerimentos);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await abrirRequerimento(acesso.sessao, await lerCorpo(requisicao)));
}
