import { Casca } from "@/components/casca";
import { ListaNotificacoes } from "@/components/lista-notificacoes";
import { CabecalhoPagina } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarNotificacoes } from "@/server/academico/notificacoes";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-022 / RF-31 (UC-21): notificações do estudante e do professor, só as próprias (RB-23).
// Layout aprovado em docs/layout/prototipo.html#notificacoes.
export default async function Notificacoes() {
  const sessao = await exigirAcessoPagina(RECURSOS.notificacoes);
  const consulta = (await consultarNotificacoes(sessao))!;
  return (
    <Casca sessao={sessao} ativo="notificacoes">
      <CabecalhoPagina titulo="Notificações" subtitulo="Avisos sobre as suas turmas. Abrir um aviso marca como lido." />
      <ListaNotificacoes notificacoes={consulta.notificacoes} naoLidas={consulta.naoLidas} />
    </Casca>
  );
}
