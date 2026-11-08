import { Paginacao } from "@/components/busca-paginacao";
import { Casca } from "@/components/casca";
import { ListaNotificacoes } from "@/components/lista-notificacoes";
import { CabecalhoPagina } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarNotificacoes } from "@/server/academico/notificacoes";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-022 / RF-31 (UC-21): notificações do estudante e do professor, só as próprias (RB-23).
// Layout aprovado em docs/layout/prototipo.html#notificacoes. SPEC-034: páginas de 25.
export default async function Notificacoes({ searchParams }: { searchParams: Promise<{ pagina?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.notificacoes);
  const consulta = (await consultarNotificacoes(sessao, (await searchParams).pagina))!;
  return (
    <Casca sessao={sessao} ativo="notificacoes">
      <CabecalhoPagina titulo="Notificações" subtitulo="Avisos sobre as suas turmas. Abrir um aviso marca como lido." />
      <ListaNotificacoes notificacoes={consulta.notificacoes} naoLidas={consulta.naoLidas} />
      <Paginacao pagina={consulta.pagina} unidade="notificação(ões)" />
    </Casca>
  );
}
