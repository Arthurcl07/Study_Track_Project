// GET /api/turmas/:id — turma do escopo do perfil; fora do escopo responde 404 (não revela existência).
import { RECURSOS } from "@/domain/autorizacao";
import { autorizarApi } from "@/server/auth/guardas";
import { buscarTurmaDoEscopo } from "@/server/dados/estrutura";

export async function GET(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.consultaTurmas);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  const turma = await buscarTurmaDoEscopo(acesso.sessao, id);
  return turma ? Response.json(turma) : Response.json({ erro: "Turma não encontrada." }, { status: 404 });
}
