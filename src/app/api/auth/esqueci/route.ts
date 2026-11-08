// POST /api/auth/esqueci — pedido de redefinição de senha (SPEC-027, RF-36). Público, como o login.
// INV-027-01: a mesma resposta para conta existente, inexistente ou desativada.
import { MENSAGEM_PEDIDO_SENHA } from "@/domain/pedido-senha";
import { lerCorpo, respostaDeFalha } from "@/server/academico/respostas";
import { pedirRedefinicao } from "@/server/auth/pedidos-senha";

export async function POST(requisicao: Request) {
  const corpo = await lerCorpo(requisicao);
  const resultado = await pedirRedefinicao(corpo.email);
  if (!resultado.ok) return respostaDeFalha(resultado.falha);
  return Response.json({ mensagem: MENSAGEM_PEDIDO_SENHA }, { status: 202 });
}
