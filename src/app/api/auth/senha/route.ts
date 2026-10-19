// POST /api/auth/senha — definir ou alterar a própria senha (SPEC-011, RF-18). Aceita conta com senha
// provisória (RB-15): é a única rota de dados liberada para ela, além de sair.
import { painelDoPerfil } from "@/domain/autorizacao";
import { lerCorpo, respostaDeFalha } from "@/server/academico/respostas";
import { contaDaRequisicao } from "@/server/auth/guardas";
import { trocarSenha } from "@/server/auth/senha-propria";

export async function POST(requisicao: Request) {
  const conta = await contaDaRequisicao(requisicao);
  if (!conta) return Response.json({ erro: "Autenticação necessária." }, { status: 401 });
  const resultado = await trocarSenha(conta.sessao.usuarioId, await lerCorpo(requisicao));
  if (!resultado.ok) return respostaDeFalha(resultado.falha);
  return Response.json({ destino: painelDoPerfil(conta.sessao.perfil) });
}
