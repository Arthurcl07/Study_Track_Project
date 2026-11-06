// Casos de uso do boletim e do histórico escolar (SPEC-020, RF-29, UC-19). Só leitura.
// Estudante: só os próprios documentos (o estudante pedido é ignorado, AC-020-06, RB-02). Coordenador: estudante de
// curso que coordena (AC-020-07, RB-04), filtrado na própria query (ADR-003). Outros perfis: nada (INV-020-05).
import { resumoPorPeriodo } from "@/domain/comparativo";
import { periodoPadrao, resultadoDaTurma, resumoDoHistorico, type Resultado } from "@/domain/documentos";
import type { Situacao } from "@/domain/situacao-academica";
import type { Sessao } from "@/server/auth/token";
import { prisma } from "@/server/dados/prisma";

async function estudanteDoDocumento(sessao: Sessao, estudantePedido?: string | null) {
  const where =
    sessao.perfil === "Estudante"
      ? { id: sessao.usuarioId, perfil: "Estudante" as const }
      : sessao.perfil === "Coordenador" && estudantePedido
        ? { id: estudantePedido, perfil: "Estudante" as const, curso: { coordenadorId: sessao.usuarioId } }
        : null;
  if (!where) return null;
  return prisma.usuario.findFirst({ where, select: { id: true, nome: true, email: true, curso: { select: { nome: true } } } });
}

// INV-020-01 / INV-020-03: só turmas do estudante, com média, frequência e situação do indicador vigente.
async function turmasDoEstudante(estudanteId: string, periodo?: string) {
  const turmas = await prisma.turma.findMany({
    where: { matriculas: { some: { estudanteId } }, ...(periodo ? { periodo } : {}) },
    select: {
      id: true,
      nome: true,
      periodo: true,
      periodoLetivo: { select: { status: true } },
      disciplina: { select: { nome: true, cargaHoraria: true } },
      professor: { select: { nome: true } },
      avaliacoes: { select: { nome: true, peso: true, data: true, notas: { where: { estudanteId }, select: { valor: true } } }, orderBy: [{ data: "asc" }, { nome: "asc" }] },
      indicadores: { where: { estudanteId }, select: { media: true, frequenciaAtual: true, situacao: true } },
      aulas: { where: { presencas: { some: { estudanteId } } }, select: { presencas: { where: { estudanteId }, select: { presente: true } } } },
    },
    orderBy: [{ periodo: "asc" }, { disciplina: { nome: "asc" } }],
  });
  return turmas.map((t) => {
    const indicador = t.indicadores[0];
    const encerrado = t.periodoLetivo.status === "Encerrado";
    const media = indicador?.media ?? null;
    const frequencia = indicador?.frequenciaAtual ?? null;
    return {
      id: t.id,
      turma: t.nome,
      periodo: t.periodo,
      encerrado,
      disciplina: t.disciplina.nome,
      cargaHoraria: t.disciplina.cargaHoraria,
      professor: t.professor.nome,
      avaliacoes: t.avaliacoes.map((a) => ({ nome: a.nome, peso: a.peso, nota: a.notas[0]?.valor ?? null })),
      media,
      frequencia,
      aulas: t.aulas.length,
      presencas: t.aulas.filter((a) => a.presencas[0]?.presente).length,
      situacao: (indicador?.situacao ?? null) as Situacao | null,
      resultado: resultadoDaTurma({ encerrado, media, frequencia }) as Resultado,
    };
  });
}

export type LinhaDocumento = Awaited<ReturnType<typeof turmasDoEstudante>>[number];

async function periodosDoEstudante(estudanteId: string) {
  return prisma.periodoLetivo.findMany({
    where: { turmas: { some: { matriculas: { some: { estudanteId } } } } },
    select: { nome: true, status: true },
    orderBy: { nome: "desc" },
  });
}

export async function consultarBoletim(sessao: Sessao, filtros: { estudante?: string | null; periodo?: string | null }) {
  const estudante = await estudanteDoDocumento(sessao, filtros.estudante);
  if (!estudante) return null;
  const periodos = await periodosDoEstudante(estudante.id);
  const periodo = periodos.find((p) => p.nome === filtros.periodo) ?? periodos.find((p) => p.nome === periodoPadrao(periodos)) ?? null;
  const turmas = periodo ? await turmasDoEstudante(estudante.id, periodo.nome) : [];
  return { estudante, periodos, periodo, turmas, emitidoEm: new Date().toISOString() };
}

export async function consultarHistorico(sessao: Sessao, filtros: { estudante?: string | null }) {
  const estudante = await estudanteDoDocumento(sessao, filtros.estudante);
  if (!estudante) return null;
  const linhas = await turmasDoEstudante(estudante.id);
  const porPeriodo = [...new Set(linhas.map((l) => l.periodo))].map((nome) => {
    const doPeriodo = linhas.filter((l) => l.periodo === nome);
    return { nome, encerrado: doPeriodo.every((l) => l.encerrado), linhas: doPeriodo };
  });
  return { estudante, periodos: porPeriodo, resumo: resumoDoHistorico(linhas), emitidoEm: new Date().toISOString() };
}

// Página Documentos do estudante: períodos com o número de disciplinas, e o resumo do histórico.
export async function consultarDocumentosDoEstudante(sessao: Sessao) {
  const historico = await consultarHistorico(sessao, {});
  if (!historico) return null;
  return {
    periodos: [...historico.periodos].reverse().map((p) => ({ nome: p.nome, encerrado: p.encerrado, disciplinas: p.linhas.length })),
    resumo: historico.resumo,
    // SPEC-024 (AC-024-05): média e frequência de cada semestre do próprio estudante.
    semestres: resumoPorPeriodo(historico.periodos.flatMap((p) => p.linhas.map((l) => ({ ...l, disciplina: l.disciplina })))),
  };
}
