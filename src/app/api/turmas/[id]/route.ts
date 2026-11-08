// GET /api/turmas/:id — turma do escopo do perfil; fora do escopo responde 404 (não revela existência).
// PATCH e DELETE: editar o nome e excluir a turma (SPEC-026, Coordenador do curso).
import { RECURSOS } from "@/domain/autorizacao";
import { editarTurma, excluirTurma } from "@/server/academico/correcoes";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { buscarTurmaDoEscopo } from "@/server/dados/estrutura";

export async function GET(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.consultaTurmas);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  const turma = await buscarTurmaDoEscopo(acesso.sessao, id);
  return turma ? Response.json(turma) : Response.json({ erro: "Turma não encontrada." }, { status: 404 });
}

export async function PATCH(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.cadastroAcademico);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await editarTurma(id, await lerCorpo(requisicao), acesso.sessao.usuarioId), 200);
}

export async function DELETE(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.cadastroAcademico);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await excluirTurma(id, acesso.sessao.usuarioId), 200);
}
