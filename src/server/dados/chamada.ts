// Acesso a dados da chamada por aula (SPEC-018, RF-27, RB-21). O escopo do professor vai na própria query
// (ADR-003, RB-03); a gravação recebe o cliente da transação do caso de uso (INV-018-04).
import { frequenciaPelaChamada } from "@/domain/frequencia";
import { deData, paraData, salvarFrequencia } from "./atividades";
import type { ClienteBanco } from "./indicadores";
import { prisma } from "./prisma";

// Turma lecionada pelo professor, com os estudantes matriculados (fora do escopo e inexistente: null).
export function turmaParaChamada(professorId: string, turmaId: string) {
  return prisma.turma.findFirst({
    where: { id: turmaId, professorId },
    select: { id: true, nome: true, matriculas: { select: { estudanteId: true } } },
  });
}

// Aulas da turma (mais recentes primeiro) com as presenças, para a tela e para corrigir uma chamada.
export async function aulasDaTurma(professorId: string, turmaId: string) {
  const aulas = await prisma.aula.findMany({
    where: { turmaId, turma: { professorId } },
    select: { id: true, data: true, presencas: { select: { estudanteId: true, presente: true } } },
    orderBy: { data: "desc" },
  });
  return aulas.map((a) => ({ ...a, data: deData(a.data) }));
}

// Grava (ou corrige) a chamada da data e recalcula a frequência de cada estudante da aula (RB-21).
export async function salvarChamada(turmaId: string, data: string, presencas: { estudanteId: string; presente: boolean }[], db: ClienteBanco) {
  const existente = await db.aula.findUnique({ where: { turmaId_data: { turmaId, data: paraData(data) } }, select: { id: true } });
  const aula = existente ?? (await db.aula.create({ data: { turmaId, data: paraData(data) }, select: { id: true } }));
  await db.presenca.deleteMany({ where: { aulaId: aula.id } });
  await db.presenca.createMany({ data: presencas.map((p) => ({ aulaId: aula.id, ...p })) });

  const frequencias: { estudanteId: string; percentual: number }[] = [];
  for (const { estudanteId } of presencas) {
    const registros = await db.presenca.findMany({ where: { estudanteId, aula: { turmaId } }, select: { presente: true } });
    const percentual = frequenciaPelaChamada(registros.map((r) => r.presente));
    if (percentual === null) continue;
    await salvarFrequencia(estudanteId, turmaId, percentual, db);
    frequencias.push({ estudanteId, percentual });
  }
  return { aulaId: aula.id, corrigida: existente !== null, frequencias };
}
