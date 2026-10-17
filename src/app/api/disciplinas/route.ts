// /api/disciplinas — cadastro e lista de disciplinas, exclusivo de Coordenador (SPEC-002, OPEN-001).
import { RECURSOS } from "@/domain/autorizacao";
import { cadastrarDisciplina } from "@/server/academico/cadastros";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { listarDisciplinas } from "@/server/dados/estrutura";

export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.cadastroAcademico);
  if ("negado" in acesso) return acesso.negado;
  return Response.json(await listarDisciplinas());
}

export async function POST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.cadastroAcademico);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await cadastrarDisciplina(await lerCorpo(requisicao)));
}
