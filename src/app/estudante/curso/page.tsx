import { notFound } from "next/navigation";
import { Casca } from "@/components/casca";
import { MatrizDoEstudante } from "@/components/matriz-estudante";
import { CabecalhoPagina } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarCursoDoEstudante } from "@/server/academico/matriz";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-037 / RF-45: "Meu curso" — matriz por semestre e integralização (RB-35). Layout em docs/layout/prototipo.html#meu-curso.
export default async function MeuCurso() {
  const sessao = await exigirAcessoPagina(RECURSOS.meuCurso);
  const curso = await consultarCursoDoEstudante(sessao, sessao.usuarioId);
  if (!curso) notFound();
  return (
    <Casca sessao={sessao} ativo="meucurso">
      <CabecalhoPagina titulo="Meu curso" subtitulo={`${curso.estudante.curso}${curso.estudante.numeroMatricula ? ` · matrícula ${curso.estudante.numeroMatricula}` : ""}`} />
      <MatrizDoEstudante curso={curso} />
    </Casca>
  );
}
