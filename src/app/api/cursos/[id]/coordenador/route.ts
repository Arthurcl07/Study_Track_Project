// POST /api/cursos/:id/coordenador — troca a coordenação do curso (SPEC-015, RF-22, Administrador).
import { RECURSOS } from "@/domain/autorizacao";
import { trocarCoordenador } from "@/server/academico/cursos";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function POST(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.gestaoCursos);
  if ("negado" in acesso) return acesso.negado;
  const { id } = await contexto.params;
  return respostaDeResultado(await trocarCoordenador(id, await lerCorpo(requisicao)), 200);
}
