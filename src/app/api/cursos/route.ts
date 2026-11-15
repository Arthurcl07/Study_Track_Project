// GET /api/cursos e POST /api/cursos — cursos e coordenação, só pelo Administrador (SPEC-015, RF-22, UC-14).
import { RECURSOS } from "@/domain/autorizacao";
import { criarCurso, listarCursos } from "@/server/academico/cursos";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaGET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.gestaoCursos);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await listarCursos());
}

async function rotaPOST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.gestaoCursos);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await criarCurso(await lerCorpo(requisicao), acesso.sessao.usuarioId));
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const GET = comRegistroDeErro(rotaGET);
export const POST = comRegistroDeErro(rotaPOST);
