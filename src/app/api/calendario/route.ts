// GET /api/calendario?mes=AAAA-MM — eventos do mês e os prazos das turmas do usuário (SPEC-040, todos os perfis).
// POST — cadastra evento (secretaria).
import { RECURSOS } from "@/domain/autorizacao";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { hojeEmBrasilia } from "@/domain/atividades";
import { mesValido } from "@/domain/calendario";
import { consultarMes, salvarEvento } from "@/server/academico/calendario";

export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.calendario);
  if ("negado" in acesso) return acesso.negado;
  const mes = mesValido(new URL(requisicao.url).searchParams.get("mes"), hojeEmBrasilia().slice(0, 7));
  return Response.json({ mes, itens: await consultarMes(acesso.sessao, mes) });
}

export async function POST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await salvarEvento(await lerCorpo(requisicao), acesso.sessao.usuarioId));
}
