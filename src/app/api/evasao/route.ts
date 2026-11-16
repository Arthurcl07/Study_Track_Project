// GET /api/evasao — painel de evasão (SPEC-050, RB-45). Coordenação: cursos dela; secretaria: todos.
import { RECURSOS } from "@/domain/autorizacao";
import { consultarEvasao } from "@/server/academico/evasao";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

export const GET = comRegistroDeErro(async (requisicao: Request) => {
  const acesso = await autorizarApi(requisicao, RECURSOS.evasao);
  if ("negado" in acesso) return acesso.negado;
  const curso = new URL(requisicao.url).searchParams.get("curso");
  return Response.json(await consultarEvasao(acesso.sessao, curso));
});
