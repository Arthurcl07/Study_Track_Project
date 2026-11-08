// GET /api/grade — grade da semana do estudante ou do professor (SPEC-041).
import { RECURSOS } from "@/domain/autorizacao";
import { gradeDaSemana } from "@/server/academico/horarios";
import { autorizarApi } from "@/server/auth/guardas";

export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.calendario);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await gradeDaSemana(acesso.sessao));
}
