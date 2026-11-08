import { Casca } from "@/components/casca";
import { Rematricula } from "@/components/rematricula";
import { CabecalhoPagina, EstadoVazio, Mensagem, formatarDataCurta } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarRematricula } from "@/server/academico/rematricula";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-038 / RF-46 (UC-35): rematrícula pelo próprio estudante, na janela da secretaria (RB-36).
// Layout aprovado em docs/layout/prototipo.html#rematricula.
export default async function PaginaRematricula() {
  const sessao = await exigirAcessoPagina(RECURSOS.rematricula);
  const consulta = await consultarRematricula(sessao);
  const periodos = consulta?.periodos ?? [];
  return (
    <Casca sessao={sessao} ativo="rematricula">
      <CabecalhoPagina
        titulo={periodos.length === 1 ? `Rematrícula ${periodos[0].nome}` : "Rematrícula"}
        subtitulo={periodos.length > 0 ? `Aberta de ${formatarDataCurta(periodos[0].inicio!)} a ${formatarDataCurta(periodos[0].fim!)}. A matrícula vale na hora.` : "Escolha as suas turmas quando a secretaria abrir a rematrícula."}
      />
      {consulta && !consulta.ativo && <div className="mb-4"><Mensagem tipo="erro">Só estudante com situação Ativo no curso faz rematrícula. Procure a secretaria.</Mensagem></div>}
      {periodos.length === 0 ? (
        <EstadoVazio>
          Não há rematrícula aberta hoje.
          {consulta?.proximas.length ? ` A próxima abre em ${formatarDataCurta(consulta.proximas[0].inicio!)} (${consulta.proximas[0].nome}).` : ""}
        </EstadoVazio>
      ) : (
        <div className="space-y-8">
          {periodos.map((p) => <Rematricula key={p.nome} periodo={p.nome} turmas={p.turmas} />)}
        </div>
      )}
    </Casca>
  );
}
