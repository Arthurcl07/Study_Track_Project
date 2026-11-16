// GET /api/saude — estado do banco, tempos e erros recentes (SPEC-057). Só o administrador (INV-057-02).
import { RECURSOS } from "@/domain/autorizacao";
import { saudeDoSistema } from "@/server/academico/saude";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

export const GET = comRegistroDeErro(async (requisicao: Request) => {
  const acesso = await autorizarApi(requisicao, RECURSOS.saude);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await saudeDoSistema(new URL(requisicao.url).searchParams.get("codigo")));
});
