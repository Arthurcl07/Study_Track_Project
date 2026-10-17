// POST /api/contas/:id/reativar — reativa a conta (SPEC-010, RB-14).
import { RECURSOS } from "@/domain/autorizacao";
import { reativarConta } from "@/server/academico/contas";
import { respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function POST(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.gestaoContas);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await reativarConta(id), 200);
}
