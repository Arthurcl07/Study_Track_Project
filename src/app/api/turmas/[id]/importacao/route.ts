// POST /api/turmas/:id/importacao — importação de estudantes por planilha CSV (SPEC-021, RF-30, Coordenador).
// { csv, confirmar: false } devolve a prévia; { csv, confirmar: true } grava tudo ou nada.
import { RECURSOS } from "@/domain/autorizacao";
import { importarEstudantes } from "@/server/academico/importacao";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaPOST(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.cadastroAcademico);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await importarEstudantes(await lerCorpo(requisicao), id, acesso.sessao.usuarioId), 200);
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const POST = comRegistroDeErro(rotaPOST);
