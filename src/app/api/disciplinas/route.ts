// /api/disciplinas — cadastro e lista de disciplinas, exclusivo de Coordenador (SPEC-002, OPEN-001).
// SPEC-015 (RF-23): só as disciplinas da grade dos cursos que ele coordena; a nova entra na grade do curso.
import { RECURSOS } from "@/domain/autorizacao";
import { cadastrarDisciplina } from "@/server/academico/cadastros";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { cursosDoCoordenador, disciplinasDosCursos } from "@/server/dados/estrutura";

export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.cadastroAcademico);
  if ("negado" in acesso) return acesso.negado;
  const cursos = await cursosDoCoordenador(acesso.sessao.usuarioId);
  return Response.json(await disciplinasDosCursos(cursos.map((c) => c.id)));
}

export async function POST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.cadastroAcademico);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await cadastrarDisciplina(await lerCorpo(requisicao), acesso.sessao.usuarioId));
}
