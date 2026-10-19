// GET /api/historico-notas?turma= — histórico de notas no escopo do perfil (SPEC-013, RF-20).
// Não há POST, PATCH nem DELETE: os registros só nascem junto com a nota (RB-16).
import { RECURSOS } from "@/domain/autorizacao";
import { consultarHistorico } from "@/server/academico/historico";
import { autorizarApi } from "@/server/auth/guardas";

export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.historicoNotas);
  if ("negado" in acesso) return acesso.negado;
  const resultado = await consultarHistorico(acesso.sessao, new URL(requisicao.url).searchParams.get("turma"));
  if (!resultado.ok) return Response.json({ erro: "Acesso negado: esta turma não está no seu escopo." }, { status: 403 });
  return Response.json(resultado);
}
