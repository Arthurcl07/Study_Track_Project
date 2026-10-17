// GET /api/professores — professores disponíveis para o cadastro de turma (Coordenador, SPEC-002).
import { RECURSOS } from "@/domain/autorizacao";
import { autorizarApi } from "@/server/auth/guardas";
import { listarProfessores } from "@/server/dados/estrutura";

export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.cadastroAcademico);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await listarProfessores());
}
