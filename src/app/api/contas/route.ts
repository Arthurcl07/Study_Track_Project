// GET /api/contas?perfil=&q=&pagina= e POST /api/contas — gestão de contas pelo Administrador (SPEC-010, RF-16;
// busca e paginação da SPEC-034).
import { RECURSOS } from "@/domain/autorizacao";
import { criarConta, listarContas } from "@/server/academico/contas";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaGET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.gestaoContas);
  if ("negado" in acesso) return acesso.negado;
  const p = new URL(requisicao.url).searchParams;
  return Response.json(await listarContas(p.get("perfil"), { q: p.get("q"), pagina: p.get("pagina") }));
}

async function rotaPOST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.gestaoContas);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await criarConta(await lerCorpo(requisicao), acesso.sessao.usuarioId));
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const GET = comRegistroDeErro(rotaGET);
export const POST = comRegistroDeErro(rotaPOST);
