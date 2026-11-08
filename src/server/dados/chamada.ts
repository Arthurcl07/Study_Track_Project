// Acesso a dados da chamada por aula (SPEC-018, RF-27, RB-21). O escopo do professor vai na própria query
// (ADR-003, RB-03); a gravação recebe o cliente da transação do caso de uso (INV-018-04).
// SPEC-028: de 1 a 4 aulas por data (número da aula). SPEC-032: falta abonada conta como presença (RB-31).
// SPEC-031: só matrículas Cursando entram na chamada (RB-30).
import { frequenciaPelaChamada, presencasEfetivas, type IntervaloAbono, type PresencaDoEstudante } from "@/domain/frequencia";
import { deData, paraData, salvarFrequencia } from "./atividades";
import type { ClienteBanco } from "./indicadores";
import { MATRICULA_CURSANDO } from "./matriculas";
import { prisma } from "./prisma";

// Turma lecionada pelo professor, com os estudantes cursando (fora do escopo e inexistente: null).
export function turmaParaChamada(professorId: string, turmaId: string) {
  return prisma.turma.findFirst({
    where: { id: turmaId, professorId },
    select: { id: true, nome: true, matriculas: { where: MATRICULA_CURSANDO, select: { estudanteId: true } } },
  });
}

// Aulas da turma (mais recentes primeiro; na mesma data, pela ordem) com as presenças.
export async function aulasDaTurma(professorId: string, turmaId: string) {
  const aulas = await prisma.aula.findMany({
    where: { turmaId, turma: { professorId } },
    select: { id: true, data: true, numero: true, presencas: { select: { estudanteId: true, presente: true } } },
    orderBy: [{ data: "desc" }, { numero: "asc" }],
  });
  return aulas.map((a) => ({ ...a, data: deData(a.data) }));
}

// SPEC-032: intervalos de abono do estudante, em "AAAA-MM-DD".
export async function abonosDoEstudante(estudanteId: string, db: ClienteBanco = prisma): Promise<IntervaloAbono[]> {
  const abonos = await db.abono.findMany({ where: { estudanteId }, select: { inicio: true, fim: true } });
  return abonos.map((a) => ({ inicio: deData(a.inicio), fim: deData(a.fim) }));
}

// RB-21 / RB-31: frequência = (presenças + faltas abonadas) ÷ aulas em que o estudante constou. Sem aula, o
// registro de frequência deixa de existir (frequência não registrada).
export async function recalcularFrequencia(estudanteId: string, turmaId: string, db: ClienteBanco) {
  const registros = await db.presenca.findMany({ where: { estudanteId, aula: { turmaId } }, select: { presente: true, aula: { select: { data: true } } } });
  const abonos = await abonosDoEstudante(estudanteId, db);
  const percentual = frequenciaPelaChamada(presencasEfetivas(registros.map((r) => ({ data: deData(r.aula.data), presente: r.presente })), abonos));
  if (percentual === null) {
    await db.frequencia.deleteMany({ where: { estudanteId, turmaId } });
    return null;
  }
  await salvarFrequencia(estudanteId, turmaId, percentual, db);
  return percentual;
}

// Grava (ou corrige) as aulas da data: aulas[0] é a 1ª aula, aulas[1] a 2ª... Aula que já existe tem as presenças
// dos estudantes da lista substituídas; as outras são criadas com o número seguinte. Recalcula a frequência (RB-21).
export async function salvarChamada(turmaId: string, data: string, aulas: PresencaDoEstudante[][], db: ClienteBanco) {
  const existentes = await db.aula.findMany({ where: { turmaId, data: paraData(data) }, select: { id: true, numero: true }, orderBy: { numero: "asc" } });
  const porNumero = new Map(existentes.map((a) => [a.numero, a.id]));
  const gravadas: { aulaId: string; numero: number; corrigida: boolean }[] = [];
  for (const [i, presencas] of aulas.entries()) {
    const numero = i + 1;
    const existente = porNumero.get(numero);
    const aulaId = existente ?? (await db.aula.create({ data: { turmaId, data: paraData(data), numero }, select: { id: true } })).id;
    await db.presenca.deleteMany({ where: { aulaId, estudanteId: { in: presencas.map((p) => p.estudanteId) } } });
    await db.presenca.createMany({ data: presencas.map((p) => ({ aulaId, ...p })) });
    gravadas.push({ aulaId, numero, corrigida: existente !== undefined });
  }

  const estudantes = [...new Set(aulas.flatMap((a) => a.map((p) => p.estudanteId)))];
  const frequencias: { estudanteId: string; percentual: number }[] = [];
  for (const estudanteId of estudantes) {
    const percentual = await recalcularFrequencia(estudanteId, turmaId, db);
    if (percentual !== null) frequencias.push({ estudanteId, percentual });
  }
  return { aulaId: gravadas[0].aulaId, aulas: gravadas, corrigida: gravadas.every((a) => a.corrigida), frequencias };
}

// SPEC-026: aula lecionada pelo professor (para mudar a data ou excluir).
export function aulaDoProfessor(professorId: string, aulaId: string) {
  return prisma.aula.findFirst({
    where: { id: aulaId, turma: { professorId } },
    select: { id: true, turmaId: true, data: true, numero: true, presencas: { select: { estudanteId: true } } },
  });
}

export function proximoNumeroDaData(turmaId: string, data: string, db: ClienteBanco) {
  return db.aula.aggregate({ where: { turmaId, data: paraData(data) }, _max: { numero: true } }).then((r) => (r._max.numero ?? 0) + 1);
}
