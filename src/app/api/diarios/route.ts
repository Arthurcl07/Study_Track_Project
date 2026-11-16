// GET /api/diarios — diários das turmas dos cursos do coordenador (SPEC-039).
import { RECURSOS } from "@/domain/autorizacao";
import { listarDiarios } from "@/server/academico/diario";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaGET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.diarios);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await listarDiarios(acesso.sessao.usuarioId));
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const GET = comRegistroDeErro(rotaGET);
