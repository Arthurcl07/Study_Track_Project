import { notFound } from "next/navigation";
import { Casca } from "@/components/casca";
import { ListaEstudantes } from "@/components/lista-estudantes";
import { CabecalhoPagina, Cartao } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { listarEstudantes } from "@/server/academico/secretaria";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-034 / SPEC-035 (RF-41, RF-43): estudantes com busca e paginação. Coordenação: só os estudantes dos cursos que coordena (RB-04).
// Layout aprovado em docs/layout/prototipo.html#estudantes-lista.
export default async function Estudantes({ searchParams }: { searchParams: Promise<{ q?: string; pagina?: string; cursoId?: string; situacao?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.estudantes);
  const lista = await listarEstudantes(sessao, await searchParams);
  if (!lista) notFound();
  return (
    <Casca sessao={sessao} ativo="estudantes">
      <CabecalhoPagina titulo="Estudantes" subtitulo="Estudantes dos cursos que você coordena, com a ficha e a situação no curso." />
      <Cartao>
        <ListaEstudantes estudantes={lista.estudantes} pagina={lista.pagina} cursos={lista.cursos} base="/coordenador/estudantes" />
      </Cartao>
    </Casca>
  );
}
