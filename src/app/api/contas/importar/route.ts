// POST /api/contas/importar — importar professores por CSV (nome;email), com prévia e tudo ou nada (SPEC-053).
import { RECURSOS } from "@/domain/autorizacao";
import { importarProfessores } from "@/server/academico/contas";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaPOST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.gestaoContas);
  if ("negado" in acesso) return acesso.negado;
  const corpo = await lerCorpo(requisicao);
  const resultado = await importarProfessores(corpo, acesso.sessao.usuarioId);
  return respostaDeResultado(resultado, corpo.confirmar === true ? 201 : 200);
}

export const POST = comRegistroDeErro(rotaPOST);
