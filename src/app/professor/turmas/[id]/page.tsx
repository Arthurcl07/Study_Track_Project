import { notFound } from "next/navigation";
import { Casca } from "@/components/casca";
import { DashboardTurmaProfessor } from "@/components/dashboard-turma";
import { CabecalhoPagina } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarTurmaDoProfessor } from "@/server/academico/planos";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-008 / RF-13: dashboard de uma turma que o professor leciona (fora do escopo: não encontrada).
// Layout aprovado em docs/layout/prototipo.html#professor-turma.
const CONTADORES = [
  { chave: "Normal", rotulo: "● Normal", cor: "text-normal" },
  { chave: "Atencao", rotulo: "▲ Atenção", cor: "text-atencao" },
  { chave: "Risco", rotulo: "■ Risco", cor: "text-risco" },
  { chave: "SemDados", rotulo: "Sem dados", cor: "" },
] as const;

export default async function DashboardDaTurma({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.planoRecuperacao);
  const { id } = await params;
  const turma = await consultarTurmaDoProfessor(sessao.usuarioId, id);
  if (!turma) notFound();

  return (
    <Casca sessao={sessao} ativo="inicio">
      <CabecalhoPagina
        titulo={`${turma.nome} · ${turma.disciplina}`}
        subtitulo={`Período ${turma.periodo} · ${turma.estudantes.length} estudante(s)`}
        voltar={{ href: "/professor", rotulo: "Turmas que leciono" }}
      />
      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {CONTADORES.map((c) => (
          <div key={c.chave} className="rounded-2xl border border-traco bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <span className="text-sm text-mudo">{c.rotulo}</span>
            <strong className={`mt-1 block text-3xl font-bold tabular-nums ${c.cor}`}>{turma.contagem[c.chave]}</strong>
          </div>
        ))}
      </div>
      <DashboardTurmaProfessor turma={turma} />
    </Casca>
  );
}
