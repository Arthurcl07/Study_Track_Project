import { Casca } from "@/components/casca";
import { Requerimentos } from "@/components/requerimentos";
import { CabecalhoPagina } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { listarRequerimentos, turmasParaRequerimento } from "@/server/academico/requerimentos";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-036 / RF-44 (UC-32, UC-33): requerimentos do perfil (escopo na query, INV-036-03).
// Layout aprovado em docs/layout/prototipo.html#requerimentos-estudante e #requerimentos-responder.
const SUBTITULO: Record<string, string> = {
  Estudante: "Peça revisão de prova, segunda chamada, declaração ou trancamento. Prazo de resposta: 5 dias úteis.",
  Professor: "Revisões de prova e segundas chamadas das suas turmas. Os atrasados aparecem primeiro.",
  Administrador: "Declarações, trancamentos e outros pedidos. Os atrasados aparecem primeiro.",
  Coordenador: "Requerimentos dos estudantes dos seus cursos.",
};

export default async function PaginaRequerimentos() {
  const sessao = await exigirAcessoPagina(RECURSOS.requerimentos);
  const [consulta, turmas] = await Promise.all([
    listarRequerimentos(sessao),
    sessao.perfil === "Estudante" ? turmasParaRequerimento(sessao.usuarioId) : Promise.resolve([]),
  ]);
  return (
    <Casca sessao={sessao} ativo="requerimentos">
      <CabecalhoPagina titulo="Requerimentos" subtitulo={SUBTITULO[sessao.perfil]} />
      <Requerimentos
        itens={consulta?.itens ?? []}
        perfil={sessao.perfil}
        podeResponder={consulta?.podeResponder ?? false}
        turmas={turmas.map((t) => ({ id: t.id, rotulo: `${t.nome} · ${t.disciplina.nome}`, professor: t.professor.nome, avaliacoes: t.avaliacoes }))}
      />
    </Casca>
  );
}
