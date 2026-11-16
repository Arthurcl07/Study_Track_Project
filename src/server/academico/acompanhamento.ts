// Acompanhamento dos professores (SPEC-051, RF-60, RB-46, UC-46). Só turmas de período aberto dos cursos do
// coordenador (INV-051-02, escopo na query). Nada é gravado (INV-051-01).
import { pendenciasDaTurma, type Pendencia } from "@/domain/acompanhamento";
import { hojeEmBrasilia } from "@/domain/atividades";
import { MATRICULA_CURSANDO } from "@/server/dados/matriculas";
import { TURMA_DE_PERIODO_ABERTO } from "@/server/dados/periodos";
import { prisma } from "@/server/dados/prisma";

const dia = (d: Date) => d.toISOString().slice(0, 10);

export type ProfessorAcompanhado = {
  id: string;
  nome: string;
  turmas: { id: string; rotulo: string; pendencias: Pendencia[] }[];
  pendencias: number;
};

export async function acompanhamentoDosProfessores(coordenadorId: string, hoje = hojeEmBrasilia()) {
  const turmas = await prisma.turma.findMany({
    where: { ...TURMA_DE_PERIODO_ABERTO, curso: { coordenadorId } },
    select: {
      id: true,
      nome: true,
      periodo: true,
      diario: true,
      disciplina: { select: { nome: true } },
      professor: { select: { id: true, nome: true } },
      matriculas: { where: MATRICULA_CURSANDO, select: { estudanteId: true } },
      aulas: { select: { data: true }, orderBy: { data: "desc" }, take: 1 },
      avaliacoes: { select: { nome: true, data: true, tipo: true, notas: { select: { estudanteId: true } } } },
    },
    orderBy: { nome: "asc" },
  });
  const periodos = [...new Set(turmas.map((t) => t.periodo))];
  const eventos = await prisma.eventoCalendario.findMany({ where: { periodo: { in: periodos }, tipo: { in: ["InicioAulas", "FimAulas"] } }, select: { periodo: true, tipo: true, inicio: true } });
  const evento = (periodo: string, tipo: string) => {
    const e = eventos.find((x) => x.periodo === periodo && x.tipo === tipo);
    return e ? dia(e.inicio) : null;
  };
  const porProfessor = new Map<string, ProfessorAcompanhado>();
  for (const t of turmas) {
    const cursando = new Set(t.matriculas.map((m) => m.estudanteId));
    const pendencias = pendenciasDaTurma(
      {
        inicioAulas: evento(t.periodo, "InicioAulas"),
        fimAulas: evento(t.periodo, "FimAulas"),
        ultimaAula: t.aulas[0] ? dia(t.aulas[0].data) : null,
        diario: t.diario,
        cursando: cursando.size,
        // Só as notas de quem está cursando a turma.
        avaliacoes: t.avaliacoes.map((a) => ({ nome: a.nome, data: dia(a.data), tipo: a.tipo, notas: a.notas.filter((n) => cursando.has(n.estudanteId)).length })),
      },
      hoje,
    );
    const p = porProfessor.get(t.professor.id) ?? { id: t.professor.id, nome: t.professor.nome, turmas: [], pendencias: 0 };
    p.turmas.push({ id: t.id, rotulo: `${t.nome} · ${t.disciplina.nome}`, pendencias });
    p.pendencias += pendencias.length;
    porProfessor.set(t.professor.id, p);
  }
  const professores = [...porProfessor.values()].sort((a, b) => b.pendencias - a.pendencias || a.nome.localeCompare(b.nome, "pt-BR"));
  const todas = professores.flatMap((p) => p.turmas.flatMap((t) => t.pendencias));
  return {
    professores,
    comPendencia: professores.filter((p) => p.pendencias > 0).length,
    chamadas: todas.filter((x) => x.tipo === "Chamada").length,
    notas: todas.filter((x) => x.tipo === "Nota").length,
    diarios: todas.filter((x) => x.tipo === "Diario").length,
  };
}

// Contador do dashboard da coordenação (SPEC-051).
export async function contarPendenciasDosProfessores(coordenadorId: string): Promise<number> {
  const { chamadas, notas, diarios } = await acompanhamentoDosProfessores(coordenadorId);
  return chamadas + notas + diarios;
}
