import { Casca } from "@/components/casca";
import { FormularioApi } from "@/components/formulario-api";
import { CabecalhoPagina, Cartao, EstadoVazio } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { listarDisciplinas } from "@/server/dados/estrutura";

// SPEC-002 / RF-04: cadastro de disciplinas (Coordenador, OPEN-001).
// Layout aprovado em docs/layout/prototipo.html#coordenador-disciplinas.
export default async function Disciplinas() {
  const sessao = await exigirAcessoPagina(RECURSOS.cadastroAcademico);
  const disciplinas = await listarDisciplinas();
  return (
    <Casca sessao={sessao} ativo="disciplinas">
      <CabecalhoPagina titulo="Disciplinas" subtitulo="Disciplinas disponíveis para criar turmas." />
      <div className="grid items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Cartao titulo={`Disciplinas cadastradas (${disciplinas.length})`}>
          {disciplinas.length === 0 ? (
            <EstadoVazio>Nenhuma disciplina cadastrada ainda.</EstadoVazio>
          ) : (
            <table className="tabela-responsiva w-full text-[15px]">
              <thead>
                <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                  <th className="pb-2.5">Nome</th>
                  <th className="pb-2.5 text-right">Carga horária</th>
                </tr>
              </thead>
              <tbody>
                {disciplinas.map((d) => (
                  <tr key={d.id} className="border-t border-traco">
                    <td data-rotulo="Nome" className="py-3 pr-2">{d.nome}</td>
                    <td data-rotulo="Carga horária" className="py-3 text-right tabular-nums">{d.cargaHoraria} h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Cartao>
        <Cartao titulo="Nova disciplina">
          <FormularioApi
            url="/api/disciplinas"
            textoBotao="Cadastrar disciplina"
            mensagemSucesso="Disciplina cadastrada."
            campos={[
              { nome: "nome", rotulo: "Nome" },
              { nome: "cargaHoraria", rotulo: "Carga horária (horas)", tipo: "number" },
            ]}
          />
        </Cartao>
      </div>
    </Casca>
  );
}
