// GET /api/diarios — diários das turmas dos cursos do coordenador (SPEC-039).
import { RECURSOS } from "@/domain/autorizacao";
import { listarDiarios } from "@/server/academico/diario";
import { autorizarApi } from "@/server/auth/guardas";

export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.diarios);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await listarDiarios(acesso.sessao.usuarioId));
}
