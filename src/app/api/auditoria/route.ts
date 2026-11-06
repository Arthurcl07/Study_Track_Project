// GET /api/auditoria?grupo=&pagina= — auditoria (SPEC-019, RF-28). Coordenador: ações acadêmicas dos cursos dele;
// Administrador: ações administrativas. Professor e Estudante: 403 (AC-019-07).
import { RECURSOS } from "@/domain/autorizacao";
import { consultarAuditoria } from "@/server/academico/auditoria";
import { autorizarApi, sessaoDaRequisicao } from "@/server/auth/guardas";

export async function GET(requisicao: Request) {
  const perfil = (await sessaoDaRequisicao(requisicao))?.perfil;
  const acesso = await autorizarApi(requisicao, perfil === "Coordenador" ? RECURSOS.auditoriaAcademica : RECURSOS.auditoriaAdministrativa);
  if ("negado" in acesso) return acesso.negado;
  const parametros = new URL(requisicao.url).searchParams;
  return Response.json(await consultarAuditoria(acesso.sessao, { grupo: parametros.get("grupo"), pagina: parametros.get("pagina") }));
}
