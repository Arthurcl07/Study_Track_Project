// Caso de uso do painel do coordenador (SPEC-014, RF-21, OPEN-029), que é o dashboard dele na SPEC-016 (RF-24).
// Só leitura. Os números por turma vêm da mesma consolidação do relatório (SPEC-009, INV-014-01, INV-016-02), no
// escopo do coordenador: as turmas dos cursos que ele coordena (RB-04, ADR-003).
import { riscoSemPlano, situacaoPorCurso } from "@/domain/dashboard";
import { turmasQuePedemAtencao } from "@/domain/relatorio";
import type { Sessao } from "@/server/auth/token";
import { matriculasEmRisco, planosAtivos } from "@/server/dados/dashboard";
import { cursosDoCoordenador, disciplinasDosCursos, listarTurmasDoEscopo } from "@/server/dados/estrutura";
import { filtroDePeriodo, periodosDasTurmas } from "@/server/dados/periodos";
import { estudantesEmRiscoDoCoordenador } from "@/server/dados/relatorios";
import { gerarRelatorio } from "./relatorios";

// SPEC-016 (AC-016-07): curso pedido que não é dele é ignorado e o painel mostra todos os cursos dele.
// SPEC-017 (AC-017-07): período pedido sem turma no escopo é ignorado; sem período, só os abertos.
export async function consultarPainelCoordenador(sessao: Sessao, cursoPedido?: string | null, periodoPedido?: string | null) {
  const [cursos, periodos] = await Promise.all([cursosDoCoordenador(sessao.usuarioId), periodosDasTurmas({ curso: { coordenadorId: sessao.usuarioId } })]);
  const filtro = cursos.find((c) => c.id === cursoPedido) ?? null;
  const periodo = periodos.find((p) => p.nome === periodoPedido)?.nome ?? null;
  const cursoIds = filtro ? [filtro.id] : cursos.map((c) => c.id);
  const escopo = { curso: { coordenadorId: sessao.usuarioId }, cursoId: { in: cursoIds }, ...filtroDePeriodo(periodo) };

  const [disciplinas, todasAsTurmas, relatorio, emRisco, planos, riscos] = await Promise.all([
    // SPEC-015: só as disciplinas da grade dos cursos que ele coordena.
    disciplinasDosCursos(cursoIds),
    listarTurmasDoEscopo(sessao, filtroDePeriodo(periodo)),
    gerarRelatorio(sessao, { curso: filtro?.id ?? null, periodo }),
    estudantesEmRiscoDoCoordenador(sessao.usuarioId, cursoIds, periodo),
    planosAtivos(escopo),
    matriculasEmRisco(escopo),
  ]);
  const turmas = todasAsTurmas.filter((t) => cursoIds.includes(t.curso.id));
  const resumo = relatorio.ok ? relatorio.relatorio.resumo : [];
  const cursoDaTurma = new Map(turmas.map((t) => [t.id, t.curso]));
  const estudantes = new Set(turmas.flatMap((t) => (t.estudantes ?? []).map((e) => e.id)));
  return {
    cursos,
    filtro,
    periodos,
    periodo,
    totais: {
      cursos: cursoIds.length,
      disciplinas: disciplinas.length,
      turmas: turmas.length,
      estudantes: estudantes.size,
      emRisco,
      planosAtivos: planos.length,
      // Estudantes distintos, como o cartão Em Risco: um aluno em Risco sem plano em duas turmas conta uma vez.
      riscoSemPlano: new Set(riscoSemPlano(riscos, planos).map((r) => r.estudanteId)).size,
    },
    resumo,
    porCurso: situacaoPorCurso(
      resumo.map((r) => ({ ...r, cursoId: cursoDaTurma.get(r.id)?.id ?? "", curso: cursoDaTurma.get(r.id)?.nome ?? "" })),
    ),
    atencao: turmasQuePedemAtencao(resumo).map((t) => ({ ...t, curso: cursoDaTurma.get(t.id)?.nome ?? "" })),
  };
}

export type PainelCoordenador = Awaited<ReturnType<typeof consultarPainelCoordenador>>;
