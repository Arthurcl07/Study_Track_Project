// GET /api/historico-notas?turma= — histórico de notas no escopo do perfil (SPEC-013, RF-20).
// Não há POST, PATCH nem DELETE: os registros só nascem junto com a nota (RB-16).
import { RECURSOS } from "@/domain/autorizacao";
import { consultarHistorico } from "@/server/academico/historico";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaGET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.historicoNotas);
  if ("negado" in acesso) return acesso.negado;
  const p = new URL(requisicao.url).searchParams;
  const resultado = await consultarHistorico(acesso.sessao, p.get("turma"), p.get("pagina"));
  if (!resultado.ok) return Response.json({ erro: "Acesso negado: esta turma não está no seu escopo." }, { status: 403 });
  return Response.json(resultado);
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const GET = comRegistroDeErro(rotaGET);
