import { Casca } from "@/components/casca";
import { CalendarioMes, NavegacaoMes } from "@/components/calendario";
import { EventosCalendario } from "@/components/gestao-secretaria-n3";
import { CabecalhoPagina } from "@/components/ui";
import { hojeEmBrasilia } from "@/domain/atividades";
import { RECURSOS } from "@/domain/autorizacao";
import { mesValido } from "@/domain/calendario";
import { consultarMes, listarEventos } from "@/server/academico/calendario";
import { listarPeriodos } from "@/server/academico/periodos";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-040 / RF-48 (UC-37): eventos do calendário, mantidos pela secretaria. Layout em docs/layout/prototipo.html#calendario-secretaria.
export default async function CalendarioDaSecretaria({ searchParams }: { searchParams: Promise<{ periodo?: string; mes?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.secretaria);
  const filtros = await searchParams;
  const lista = await listarPeriodos();
  const periodos = lista.map((p) => p.nome);
  // Padrão: o semestre em andamento (o período aberto mais antigo), não o próximo aberto só para a rematrícula.
  const emAndamento = lista.filter((p) => p.status === "Aberto").map((p) => p.nome).sort()[0] ?? periodos[0] ?? "";
  const periodo = periodos.includes(filtros.periodo ?? "") ? filtros.periodo! : emAndamento;
  const mes = mesValido(filtros.mes, hojeEmBrasilia().slice(0, 7));
  const [eventos, itens] = await Promise.all([listarEventos(periodo), consultarMes(sessao, mes)]);
  return (
    <Casca sessao={sessao} ativo="calendario">
      <CabecalhoPagina titulo="Calendário acadêmico" subtitulo="Eventos do período. Feriado e recesso bloqueiam a chamada; fora do início e fim das aulas também." />
      <EventosCalendario eventos={eventos} periodos={periodos} periodo={periodo} />
      <div className="mt-5 space-y-3">
        <div className="flex justify-end"><NavegacaoMes mes={mes} base={`/admin/calendario?periodo=${encodeURIComponent(periodo)}`} /></div>
        <CalendarioMes mes={mes} itens={itens} />
      </div>
    </Casca>
  );
}
