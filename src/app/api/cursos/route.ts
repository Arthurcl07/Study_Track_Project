// GET /api/cursos e POST /api/cursos — cursos e coordenação, só pelo Administrador (SPEC-015, RF-22, UC-14).
import { RECURSOS } from "@/domain/autorizacao";
import { criarCurso, listarCursos } from "@/server/academico/cursos";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.gestaoCursos);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await listarCursos());
}

export async function POST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.gestaoCursos);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await criarCurso(await lerCorpo(requisicao)));
}
