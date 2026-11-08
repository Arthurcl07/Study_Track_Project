import { Casca } from "@/components/casca";
import { CalendarioMes, GradeDaSemana, NavegacaoMes } from "@/components/calendario";
import { CabecalhoPagina } from "@/components/ui";
import { hojeEmBrasilia } from "@/domain/atividades";
import { RECURSOS } from "@/domain/autorizacao";
import { mesValido } from "@/domain/calendario";
import { consultarMes } from "@/server/academico/calendario";
import { gradeDaSemana } from "@/server/academico/horarios";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-040 / SPEC-041 (RF-48, RF-49): calendário do mês com os eventos e os prazos das próprias turmas, e a grade da
// semana (estudante e professor). Layout aprovado em docs/layout/prototipo.html#calendario.
export default async function Calendario({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.calendario);
  const mes = mesValido((await searchParams).mes, hojeEmBrasilia().slice(0, 7));
  const [itens, grade] = await Promise.all([consultarMes(sessao, mes), gradeDaSemana(sessao)]);
  const comGrade = sessao.perfil === "Estudante" || sessao.perfil === "Professor";
  return (
    <Casca sessao={sessao} ativo="calendario">
      <CabecalhoPagina
        titulo="Calendário"
        subtitulo={comGrade ? "Eventos da instituição e os prazos e avaliações das suas turmas." : "Eventos da instituição."}
        acao={<NavegacaoMes mes={mes} base="/calendario" />}
      />
      <div className="space-y-5">
        <CalendarioMes mes={mes} itens={itens} />
        {comGrade && <GradeDaSemana horarios={grade} />}
      </div>
    </Casca>
  );
}
