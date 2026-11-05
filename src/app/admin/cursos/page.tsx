import { Casca } from "@/components/casca";
import { FormularioApi } from "@/components/formulario-api";
import { TrocarCoordenacao } from "@/components/trocar-coordenacao";
import { CabecalhoPagina, Cartao, EstadoVazio, Mensagem } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { listarCursos } from "@/server/academico/cursos";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { listarCoordenadoresAtivos } from "@/server/dados/cursos";

// SPEC-015 / RF-22 (UC-14): cursos e coordenação, só para o Administrador. Só estrutura (nome, coordenação
// e contagens), nunca nota, frequência ou situação (RB-13, INV-015-08).
// Layout aprovado em docs/layout/prototipo.html#admin-cursos.
export default async function Cursos() {
  const sessao = await exigirAcessoPagina(RECURSOS.gestaoCursos);
  const [cursos, coordenadores] = await Promise.all([listarCursos(), listarCoordenadoresAtivos()]);
  const opcoesCoordenador = coordenadores.map((c) => ({ valor: c.id, rotulo: c.nome }));

  return (
    <Casca sessao={sessao} ativo="cursos">
      <CabecalhoPagina titulo="Cursos" subtitulo="Crie os cursos e escolha quem coordena cada um. Notas, frequência e situação não aparecem aqui." />
      <div className="grid items-start gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Cartao titulo={`Cursos (${cursos.length})`}>
          {cursos.length === 0 ? (
            <EstadoVazio>Nenhum curso cadastrado ainda.</EstadoVazio>
          ) : (
            <table className="tabela-responsiva w-full text-[15px]">
              <thead>
                <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                  <th className="pr-2 pb-2.5">Curso</th>
                  <th className="px-2 pb-2.5">Coordenação</th>
                  <th className="px-2 pb-2.5 text-right">Disciplinas</th>
                  <th className="px-2 pb-2.5 text-right">Turmas</th>
                  <th className="pb-2.5 pl-2 text-right">Estudantes</th>
                </tr>
              </thead>
              <tbody>
                {cursos.map((c) => (
                  <tr key={c.id} className="border-t border-traco">
                    <td data-rotulo="Curso" className="py-3 pr-2 font-medium">{c.nome}</td>
                    <td data-rotulo="Coordenação" className="px-2 py-3">{c.coordenador.nome}</td>
                    <td data-rotulo="Disciplinas" className="px-2 py-3 text-right tabular-nums">{c.disciplinas}</td>
                    <td data-rotulo="Turmas" className="px-2 py-3 text-right tabular-nums">{c.turmas}</td>
                    <td data-rotulo="Estudantes" className="py-3 pl-2 text-right tabular-nums">{c.estudantes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="mt-3 text-sm text-mudo">Uma disciplina pode estar na grade de mais de um curso; cada curso abre as próprias turmas.</p>
        </Cartao>
        <div className="space-y-5">
          <Cartao titulo="Novo curso">
            {coordenadores.length === 0 ? (
              <Mensagem tipo="info">Crie antes uma conta com perfil Coordenador em Contas.</Mensagem>
            ) : (
              <FormularioApi
                url="/api/cursos"
                textoBotao="Criar curso"
                mensagemSucesso="Curso criado. A coordenação já pode montar a grade e as turmas."
                campos={[
                  { nome: "nome", rotulo: "Nome do curso" },
                  { nome: "coordenadorId", rotulo: "Coordenador(a)", tipo: "select", opcoes: opcoesCoordenador },
                ]}
              />
            )}
            <p className="mt-3 text-sm text-mudo">Só contas ativas com perfil Coordenador. Uma pessoa pode coordenar mais de um curso.</p>
          </Cartao>
          {cursos.length > 0 && coordenadores.length > 0 && (
            <Cartao titulo="Trocar coordenação">
              <TrocarCoordenacao cursos={cursos.map((c) => ({ valor: c.id, rotulo: `${c.nome} · hoje: ${c.coordenador.nome}` }))} coordenadores={opcoesCoordenador} />
            </Cartao>
          )}
        </div>
      </div>
    </Casca>
  );
}
