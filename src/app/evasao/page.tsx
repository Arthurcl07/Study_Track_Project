import Link from "next/link";
import { Casca } from "@/components/casca";
import { SeletorCurso } from "@/components/seletor-curso";
import { CabecalhoPagina, Cartao, CartaoNumero, CLASSE_LINK, EstadoVazio } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { dataBR } from "@/domain/auditoria";
import { consultarEvasao } from "@/server/academico/evasao";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { prisma } from "@/server/dados/prisma";

// SPEC-050 / RF-59 (UC-45): quem sumiu das aulas (RB-45). Coordenação: cursos dela; secretaria: todos.
// Layout aprovado em docs/layout/prototipo.html#evasao.
export default async function Evasao({ searchParams }: { searchParams: Promise<{ curso?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.evasao);
  const { curso } = await searchParams;
  const cursos = await prisma.curso.findMany({
    where: sessao.perfil === "Coordenador" ? { coordenadorId: sessao.usuarioId } : {},
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });
  const cursoValido = cursos.some((c) => c.id === curso) ? curso! : null;
  const painel = (await consultarEvasao(sessao, cursoValido))!;
  const fichaDe = (id: string) => (sessao.perfil === "Administrador" ? `/admin/estudantes/${id}` : `/coordenador/estudantes/${id}`);

  return (
    <Casca sessao={sessao} ativo="evasao">
      <CabecalhoPagina
        titulo="Evasão"
        subtitulo="Estudantes que sumiram das aulas: 3 faltas seguidas ou nenhuma presença em 14 dias."
        acao={cursos.length > 1 ? <SeletorCurso cursos={cursos} valor={cursoValido ?? ""} todos={sessao.perfil === "Administrador" ? "Todos os cursos" : `Todos os meus cursos (${cursos.length})`} /> : undefined}
      />
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CartaoNumero rotulo="Em evasão" valor={painel.emEvasao} cor={painel.emEvasao > 0 ? "text-risco" : ""} detalhe="estudantes" />
        <CartaoNumero rotulo="3+ faltas seguidas" valor={painel.porFaltas} />
        <CartaoNumero rotulo="Sem presença há 14 dias" valor={painel.porAusencia} />
      </div>
      <Cartao>
        {painel.linhas.length === 0 ? (
          <EstadoVazio>Ninguém sumiu das aulas. 🎉</EstadoVazio>
        ) : (
          <table className="tabela-responsiva w-full text-[15px]">
            <thead>
              <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                <th className="pb-2.5">Estudante</th>
                <th className="pb-2.5">Turma</th>
                {sessao.perfil === "Administrador" && <th className="pb-2.5">Curso</th>}
                <th className="pb-2.5">Motivo</th>
                <th className="pb-2.5">Última presença</th>
                <th className="pb-2.5"><span className="sr-only">Ficha</span></th>
              </tr>
            </thead>
            <tbody>
              {painel.linhas.map((l) => (
                <tr key={`${l.estudanteId}-${l.turmaId}`} className="border-t border-traco">
                  <td data-rotulo="Estudante" className="py-3 pr-3">
                    <span className="font-medium">{l.nome}</span>
                    {l.numeroMatricula && <span className="block text-[13px] text-mudo">{l.numeroMatricula}</span>}
                  </td>
                  <td data-rotulo="Turma" className="py-3 pr-3">{l.turma} · {l.disciplina}</td>
                  {sessao.perfil === "Administrador" && <td data-rotulo="Curso" className="py-3 pr-3">{l.curso}</td>}
                  <td data-rotulo="Motivo" className="py-3 pr-3">
                    <span className="inline-flex rounded-full bg-risco-fundo px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap text-risco">■ {l.textoMotivo}</span>
                  </td>
                  <td data-rotulo="Última presença" className="py-3 pr-3 tabular-nums">{l.ultimaPresenca ? dataBR(l.ultimaPresenca).slice(0, 5) : "—"}</td>
                  <td className="py-3 text-right"><Link href={fichaDe(l.estudanteId)} className={CLASSE_LINK}>Ver ficha</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="mt-3 text-[13px] text-mudo">
          {sessao.perfil === "Coordenador" ? "Você é notificado quando alguém entra na lista." : "A coordenação de cada curso é notificada quando alguém entra na lista."} Nada aqui é gravado: a lista é recalculada a cada abertura.
        </p>
      </Cartao>
    </Casca>
  );
}
