import { RECURSOS } from "@/domain/autorizacao";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { consultarRematricula, rematricular } from "@/server/academico/rematricula";

// GET e POST /api/rematricula — turmas da janela e matrícula pelo próprio estudante (SPEC-038).
export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.rematricula);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await consultarRematricula(acesso.sessao));
}

export async function POST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.rematricula);
  if ("negado" in acesso) return acesso.negado;
  const corpo = await lerCorpo(requisicao);
  return respostaDeResultado(await rematricular(acesso.sessao, typeof corpo.turmaId === "string" ? corpo.turmaId : ""));
}
