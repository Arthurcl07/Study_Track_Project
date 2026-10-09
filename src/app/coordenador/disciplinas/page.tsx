import Link from "next/link";
import { FormularioApi } from "@/components/formulario-api";
import { Painel } from "@/components/painel";
import { Secao } from "@/components/secao";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { listarDisciplinas } from "@/server/dados/estrutura";

// SPEC-002 / RF-04: cadastro de disciplinas (Coordenador, OPEN-001).
export default async function Disciplinas() {
  const sessao = await exigirAcessoPagina(RECURSOS.cadastroAcademico);
  const disciplinas = await listarDisciplinas();
  return (
    <Painel sessao={sessao}>
      <Link href="/coordenador" className="text-sm text-indigo-700 underline">Voltar</Link>
      <Secao titulo="Nova disciplina">
        <FormularioApi
          url="/api/disciplinas"
          textoBotao="Cadastrar disciplina"
          mensagemSucesso="Disciplina cadastrada."
          campos={[
            { nome: "nome", rotulo: "Nome" },
            { nome: "cargaHoraria", rotulo: "Carga horária (horas)", tipo: "number" },
          ]}
        />
      </Secao>
      <Secao titulo={`Disciplinas (${disciplinas.length})`}>
        {disciplinas.length === 0 ? (
          <p className="text-slate-600">Nenhuma disciplina cadastrada.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {disciplinas.map((d) => (
              <li key={d.id} className="py-2">{d.nome} <span className="text-slate-500">· {d.cargaHoraria} h</span></li>
            ))}
          </ul>
        )}
      </Secao>
    </Painel>
  );
}
