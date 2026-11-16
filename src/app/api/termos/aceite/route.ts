// POST /api/termos/aceite — aceitar a versão vigente dos termos (SPEC-045, RB-43). Liberada para quem ainda não
// aceitou (é a única rota de dados, além de sair e da senha provisória).
import { painelDoPerfil } from "@/domain/autorizacao";
import { lerCorpo } from "@/server/academico/respostas";
import { aceitarTermos } from "@/server/academico/lgpd";
import { contaDaRequisicao } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaPOST(requisicao: Request) {
  const conta = await contaDaRequisicao(requisicao);
  if (!conta) return Response.json({ erro: "Autenticação necessária." }, { status: 401 });
  if (conta.trocarSenha) return Response.json({ erro: "Defina sua senha antes de continuar.", trocarSenha: true }, { status: 403 });
  const corpo = await lerCorpo(requisicao);
  const resultado = await aceitarTermos(conta.sessao, corpo.versao);
  if (!resultado.ok) return Response.json({ erro: resultado.erro }, { status: 400 });
  return Response.json({ destino: painelDoPerfil(conta.sessao.perfil) });
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const POST = comRegistroDeErro(rotaPOST);
