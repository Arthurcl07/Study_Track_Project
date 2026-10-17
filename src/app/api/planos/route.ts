// POST /api/planos — criar plano de recuperação (SPEC-008, RF-14, UC-04): turma, estudante e itens.
import { RECURSOS } from "@/domain/autorizacao";
import { criarPlano } from "@/server/academico/planos";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function POST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.planoRecuperacao);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await criarPlano(await lerCorpo(requisicao), acesso.sessao.usuarioId));
}
