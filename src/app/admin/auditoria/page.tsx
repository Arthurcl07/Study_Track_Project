import { Casca } from "@/components/casca";
import { ListaAuditoria } from "@/components/lista-auditoria";
import { CabecalhoPagina } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarAuditoria } from "@/server/academico/auditoria";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-019 / RF-28 (UC-18): auditoria. Administrador: só ações administrativas, nenhum dado acadêmico (INV-019-04, RB-13).
// Layout aprovado em docs/layout/prototipo.html#admin-auditoria.
export default async function AuditoriaAdministrador({ searchParams }: { searchParams: Promise<{ grupo?: string; pagina?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.auditoriaAdministrativa);
  const filtros = await searchParams;
  const consulta = (await consultarAuditoria(sessao, filtros))!;
  return (
    <Casca sessao={sessao} ativo="auditoria">
      <CabecalhoPagina titulo="Auditoria" subtitulo="Ações sobre contas, cursos e períodos. Alterações acadêmicas ficam com a coordenação de cada curso." />
      <ListaAuditoria consulta={consulta} caminho="/admin/auditoria" mostrarCurso={false} />
    </Casca>
  );
}
