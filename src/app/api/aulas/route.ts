// GET /api/aulas?turmaId= e POST /api/aulas — chamada por aula (SPEC-018, RF-27). Só o professor da turma
// (RB-03); substitui o antigo lançamento do percentual em /api/frequencias (OPEN-041).
import { RECURSOS } from "@/domain/autorizacao";
import { consultarAulas, registrarChamada } from "@/server/academico/chamada";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.registroFrequenciaAtividades);
  if ("negado" in acesso) return acesso.negado;
  const turmaId = new URL(requisicao.url).searchParams.get("turmaId") ?? "";
  const aulas = await consultarAulas(acesso.sessao.usuarioId, turmaId);
  return aulas ? Response.json(aulas) : Response.json({ erro: "Turma não encontrada." }, { status: 404 });
}

export async function POST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.registroFrequenciaAtividades);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await registrarChamada(await lerCorpo(requisicao), acesso.sessao.usuarioId), 200);
}
