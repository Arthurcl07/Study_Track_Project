import Link from "next/link";
import { notFound } from "next/navigation";
import { Casca } from "@/components/casca";
import { FichaEstudante } from "@/components/ficha-estudante";
import { CLASSE_BOTAO_SECUNDARIO, CabecalhoPagina } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarFicha } from "@/server/academico/secretaria";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-031 a SPEC-033 / SPEC-035: ficha do estudante. O coordenador do curso só consulta (RB-33).
// Layout aprovado em docs/layout/prototipo.html#estudante-secretaria.
export default async function Ficha({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.estudantes);
  const ficha = await consultarFicha(sessao, (await params).id);
  if (!ficha) notFound();
  return (
    <Casca sessao={sessao} ativo="estudantes">
      <CabecalhoPagina
        titulo={ficha.nome}
        subtitulo={`Matrícula ${ficha.numeroMatricula} · ${ficha.curso?.nome ?? "sem curso"}`}
        voltar={{ href: "/coordenador/estudantes", rotulo: "Estudantes" }}
        acao={
          <span className="flex flex-wrap gap-2">
            <Link href={`/documentos/boletim?estudante=${ficha.id}`} className={CLASSE_BOTAO_SECUNDARIO}>📄 Boletim</Link>
            <Link href={`/documentos/historico?estudante=${ficha.id}`} className={CLASSE_BOTAO_SECUNDARIO}>📜 Histórico</Link>
          </span>
        }
      />
      <FichaEstudante ficha={ficha} editavel={false} />
    </Casca>
  );
}
