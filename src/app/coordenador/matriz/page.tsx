import Link from "next/link";
import { Casca } from "@/components/casca";
import { EditorMatriz } from "@/components/coordenacao-n3";
import { SeletorCurso } from "@/components/seletor-curso";
import { CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO, CabecalhoPagina, Cartao, EstadoVazio } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { matrizDoCurso } from "@/server/academico/matriz";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { cursosDoCoordenador } from "@/server/dados/estrutura";

// SPEC-037 / RF-45 (UC-34): matriz do curso — semestre, obrigatória e pré-requisitos (RB-41).
// Layout aprovado em docs/layout/prototipo.html#matriz-coordenador.
export default async function Matriz({ searchParams }: { searchParams: Promise<{ curso?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.cadastroAcademico);
  const cursos = await cursosDoCoordenador(sessao.usuarioId);
  const pedido = (await searchParams).curso;
  const curso = cursos.find((c) => c.id === pedido) ?? cursos[0];
  const abas = (
    <span className="flex gap-2">
      <Link href={`/coordenador/disciplinas${curso ? `?curso=${curso.id}` : ""}`} className={CLASSE_BOTAO_SECUNDARIO}>Grade</Link>
      <span className={CLASSE_BOTAO_PRIMARIO} aria-current="page">Matriz</span>
    </span>
  );
  return (
    <Casca sessao={sessao} ativo="disciplinas">
      <CabecalhoPagina titulo="Disciplinas" subtitulo={curso ? `${curso.nome} · matriz: semestre, obrigatória e pré-requisitos.` : "Matriz do curso."} acao={abas} />
      {!curso ? (
        <EstadoVazio>Você ainda não coordena nenhum curso.</EstadoVazio>
      ) : (
        <>
          {cursos.length > 1 && <Cartao className="mb-5"><SeletorCurso cursos={cursos} valor={curso.id} /></Cartao>}
          <EditorMatriz cursoId={curso.id} matriz={await matrizDoCurso(curso.id)} />
        </>
      )}
    </Casca>
  );
}
