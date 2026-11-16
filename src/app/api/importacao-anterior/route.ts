// POST /api/importacao-anterior — alunos e histórico do sistema anterior: prévia ou gravação (SPEC-058, RB-49).
// Só a secretaria.
import { RECURSOS } from "@/domain/autorizacao";
import { importarDoSistemaAnterior } from "@/server/academico/importacao-anterior";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaPOST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  const corpo = await lerCorpo(requisicao);
  return respostaDeResultado(await importarDoSistemaAnterior(corpo, acesso.sessao.usuarioId), corpo.confirmar === true ? 201 : 200);
}

export const POST = comRegistroDeErro(rotaPOST);
