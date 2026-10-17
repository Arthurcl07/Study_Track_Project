// POST /api/contas/:id/desativar — desativa a conta sem apagar dados (SPEC-010, RB-14).
import { RECURSOS } from "@/domain/autorizacao";
import { desativarConta } from "@/server/academico/contas";
import { respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function POST(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.gestaoContas);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await desativarConta(id, acesso.sessao.usuarioId), 200);
}
