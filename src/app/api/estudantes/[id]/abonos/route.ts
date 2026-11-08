// GET e POST /api/estudantes/:id/abonos — abonos de faltas do estudante (SPEC-032, RB-31). Só a secretaria.
// POST com "previa": true só conta as faltas que seriam abonadas.
import { RECURSOS } from "@/domain/autorizacao";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { listarAbonos, registrarAbono } from "@/server/academico/secretaria";

type Contexto = { params: Promise<{ id: string }> };

export async function GET(requisicao: Request, contexto: Contexto) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await listarAbonos((await contexto.params).id));
}

export async function POST(requisicao: Request, contexto: Contexto) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  const corpo = await lerCorpo(requisicao);
  return respostaDeResultado(await registrarAbono((await contexto.params).id, corpo, acesso.sessao.usuarioId), corpo.previa === true ? 200 : 201);
}
