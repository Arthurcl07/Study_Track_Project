// Acesso a dados de frequência, atividades e entregas (SPEC-005). O escopo vai dentro da própria
// query (ADR-003): professor só nas turmas que leciona (RB-03), estudante só no que é dele (RB-02).
import { MATRICULA_CURSANDO } from "./matriculas";
import type { DadosAtividade } from "@/domain/atividades";
import type { ClienteBanco } from "./indicadores";
import { prisma } from "./prisma";

// Colunas @db.Date chegam como meia-noite UTC; o texto AAAA-MM-DD é a forma usada no domínio.
export const paraData = (texto: string) => new Date(`${texto}T00:00:00Z`);
export const deData = (data: Date) => data.toISOString().slice(0, 10);

// SPEC-031 (RB-30): só matrículas cursando nas listas de trabalho.
const ESTUDANTES_DA_TURMA = {
  where: MATRICULA_CURSANDO,
  // SPEC-033 (RB-33): o professor vê nome e número de matrícula.
  select: { estudante: { select: { id: true, nome: true, ficha: { select: { numeroMatricula: true } } } } },
  orderBy: { estudante: { nome: "asc" } },
} as const;

// ---------- Frequência ----------

export function salvarFrequencia(estudanteId: string, turmaId: string, percentual: number, db: ClienteBanco) {
  return db.frequencia.upsert({
    where: { estudanteId_turmaId: { estudanteId, turmaId } },
    update: { percentual },
    create: { estudanteId, turmaId, percentual },
    select: { estudanteId: true, turmaId: true, percentual: true, atualizadaEm: true },
  });
}

// Turma lecionada pelo professor com o estudante matriculado nela (INV-005-05).
export function turmaComEstudante(professorId: string, turmaId: string, estudanteId: string) {
  return prisma.turma.findFirst({
    where: { id: turmaId, professorId, matriculas: { some: { estudanteId, ...MATRICULA_CURSANDO } } },
    select: { id: true },
  });
}

// SPEC-017 (RB-20): telas de lançamento mostram só turmas de períodos abertos.
export function turmasParaFrequencia(professorId: string) {
  return prisma.turma.findMany({
    where: { professorId, periodoLetivo: { status: "Aberto" } },
    select: {
      id: true,
      nome: true,
      periodo: true,
      // SPEC-039: diário fechado ou homologado deixa a turma somente leitura.
      diario: true,
      disciplina: { select: { nome: true } },
      matriculas: ESTUDANTES_DA_TURMA,
      frequencias: { select: { estudanteId: true, percentual: true } },
      indicadores: { select: { estudanteId: true, situacao: true } },
      // SPEC-018: aulas com as presenças, para a tela de chamada. SPEC-028: número da aula na data.
      aulas: { select: { id: true, data: true, numero: true, conteudo: true, presencas: { select: { estudanteId: true, presente: true } } }, orderBy: [{ data: "desc" }, { numero: "asc" }] },
    },
    orderBy: [{ periodo: "desc" }, { nome: "asc" }],
  });
}

// ---------- Atividades ----------

export function criarAtividade(turmaId: string, dados: DadosAtividade, db: ClienteBanco = prisma) {
  return db.atividade.create({
    data: { turmaId, descricao: dados.descricao, prazo: paraData(dados.prazo) },
    select: { id: true, turmaId: true, descricao: true, prazo: true },
  });
}

export function turmasComAtividades(professorId: string) {
  return prisma.turma.findMany({
    where: { professorId, periodoLetivo: { status: "Aberto" } },
    select: {
      id: true,
      nome: true,
      periodo: true,
      disciplina: { select: { nome: true } },
      matriculas: { where: MATRICULA_CURSANDO, select: { estudanteId: true } },
      atividades: {
        select: { id: true, descricao: true, prazo: true, entregas: { select: { estudanteId: true, dataEntrega: true } } },
        orderBy: [{ prazo: "asc" }, { descricao: "asc" }],
      },
    },
    orderBy: [{ periodo: "desc" }, { nome: "asc" }],
  });
}

// Atividade de uma turma que o professor leciona; fora do escopo e inexistente dão o mesmo null.
export function atividadeDoProfessor(professorId: string, atividadeId: string) {
  return prisma.atividade.findFirst({
    where: { id: atividadeId, turma: { professorId } },
    select: {
      id: true,
      descricao: true,
      prazo: true,
      turma: { select: { id: true, nome: true, periodo: true, disciplina: { select: { nome: true } }, matriculas: ESTUDANTES_DA_TURMA } },
      entregas: { select: { id: true, estudanteId: true, dataEntrega: true } },
    },
  });
}

// ---------- Entregas ----------

// Atividade numa turma lecionada pelo professor, com o estudante matriculado nela (INV-005-05).
export function atividadeParaEntrega(professorId: string, atividadeId: string, estudanteId: string) {
  return prisma.atividade.findFirst({
    where: { id: atividadeId, turma: { professorId, matriculas: { some: { estudanteId, ...MATRICULA_CURSANDO } } } },
    select: { id: true, prazo: true, descricao: true, turmaId: true },
  });
}

export function criarEntrega(atividadeId: string, estudanteId: string, dataEntrega: string, db: ClienteBanco = prisma) {
  return db.entrega.create({
    data: { atividadeId, estudanteId, dataEntrega: paraData(dataEntrega) },
    select: { id: true, atividadeId: true, estudanteId: true, dataEntrega: true },
  });
}

export function entregaDoProfessor(professorId: string, entregaId: string) {
  return prisma.entrega.findFirst({
    where: { id: entregaId, atividade: { turma: { professorId } } },
    select: { id: true, dataEntrega: true, estudanteId: true, atividade: { select: { descricao: true, turmaId: true } } },
  });
}

export function removerEntrega(entregaId: string, db: ClienteBanco = prisma) {
  return db.entrega.delete({ where: { id: entregaId }, select: { id: true } });
}

// ---------- Consultas por perfil ----------

// RB-02 / AC-005-09: atividades das turmas do estudante, trazendo SÓ a entrega dele.
export function atividadesDoEstudante(estudanteId: string) {
  return prisma.atividade.findMany({
    // SPEC-017 (INV-017-05): só turmas de períodos abertos.
    where: { turma: { matriculas: { some: { estudanteId, ...MATRICULA_CURSANDO } }, periodoLetivo: { status: "Aberto" } } },
    select: {
      id: true,
      descricao: true,
      prazo: true,
      turma: { select: { id: true, nome: true, disciplina: { select: { nome: true } } } },
      entregas: { where: { estudanteId }, select: { dataEntrega: true } },
    },
    orderBy: [{ prazo: "asc" }, { descricao: "asc" }],
  });
}
