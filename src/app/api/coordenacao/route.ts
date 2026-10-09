// GET /api/coordenacao — função exclusiva de Coordenador (demonstra a negação de acesso, AC-001-03).
import { RECURSOS } from "@/domain/autorizacao";
import { autorizarApi } from "@/server/auth/guardas";

export async function GET(requisicao: Request) {
  const resultado = await autorizarApi(requisicao, RECURSOS.areaCoordenacao);
  if ("negado" in resultado) return resultado.negado;
  return Response.json({ area: "coordenacao", nome: resultado.sessao.nome, perfil: resultado.sessao.perfil });
}
