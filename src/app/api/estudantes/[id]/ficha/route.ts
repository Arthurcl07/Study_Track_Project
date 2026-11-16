// GET /api/estudantes/:id/ficha — ficha do estudante (Administrador; Coordenador do curso, só leitura; RB-33).
// PUT — dados pessoais da ficha, só a secretaria (SPEC-033).
import { RECURSOS } from "@/domain/autorizacao";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { consultarFicha, salvarFicha } from "@/server/academico/secretaria";
import { comRegistroDeErro } from "@/server/dados/erros";

type Contexto = { params: Promise<{ id: string }> };

async function rotaGET(requisicao: Request, contexto: Contexto) {
  const acesso = await autorizarApi(requisicao, RECURSOS.estudantes);
  if ("negado" in acesso) return acesso.negado;
  const ficha = await consultarFicha(acesso.sessao, (await contexto.params).id);
  return ficha ? Response.json(ficha) : Response.json({ erro: "Estudante não encontrado." }, { status: 404 });
}

async function rotaPUT(requisicao: Request, contexto: Contexto) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await salvarFicha((await contexto.params).id, await lerCorpo(requisicao), acesso.sessao.usuarioId), 200);
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const GET = comRegistroDeErro(rotaGET);
export const PUT = comRegistroDeErro(rotaPUT);
