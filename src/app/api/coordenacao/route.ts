// GET /api/coordenacao — função exclusiva de Coordenador (demonstra a negação de acesso, AC-001-03).
import { RECURSOS } from "@/domain/autorizacao";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaGET(requisicao: Request) {
  const resultado = await autorizarApi(requisicao, RECURSOS.areaCoordenacao);
  if ("negado" in resultado) return resultado.negado;
  return Response.json({ area: "coordenacao", nome: resultado.sessao.nome, perfil: resultado.sessao.perfil });
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const GET = comRegistroDeErro(rotaGET);
