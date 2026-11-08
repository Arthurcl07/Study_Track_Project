// GET /api/estudantes?q=&pagina=&cursoId=&situacao= — estudantes com busca e paginação (SPEC-034/035).
// Administrador: todos; Coordenador: os dos cursos que coordena (RB-04, ADR-003).
import { RECURSOS } from "@/domain/autorizacao";
import { listarEstudantes } from "@/server/academico/secretaria";
import { autorizarApi } from "@/server/auth/guardas";

export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.estudantes);
  if ("negado" in acesso) return acesso.negado;
  const p = new URL(requisicao.url).searchParams;
  const lista = await listarEstudantes(acesso.sessao, { q: p.get("q"), pagina: p.get("pagina"), cursoId: p.get("cursoId"), situacao: p.get("situacao") });
  return lista ? Response.json(lista) : Response.json({ erro: "Acesso negado." }, { status: 403 });
}
