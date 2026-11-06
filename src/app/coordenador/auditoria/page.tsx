import { Casca } from "@/components/casca";
import { ListaAuditoria } from "@/components/lista-auditoria";
import { CabecalhoPagina } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarAuditoria } from "@/server/academico/auditoria";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-019 / RF-28 (UC-18): auditoria. Coordenador: só ações acadêmicas dos cursos que coordena (INV-019-03).
// Layout aprovado em docs/layout/prototipo.html#coord-auditoria.
export default async function AuditoriaCoordenador({ searchParams }: { searchParams: Promise<{ grupo?: string; pagina?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.auditoriaAcademica);
  const filtros = await searchParams;
  const consulta = (await consultarAuditoria(sessao, filtros))!;
  return (
    <Casca sessao={sessao} ativo="auditoria">
      <CabecalhoPagina titulo="Auditoria" subtitulo="Tudo o que foi alterado nos cursos que você coordena: quem fez, quando e de quanto para quanto." />
      <ListaAuditoria consulta={consulta} caminho="/coordenador/auditoria" mostrarCurso={true} />
    </Casca>
  );
}
