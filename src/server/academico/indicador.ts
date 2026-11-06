// Caso de uso "Recalcular Indicador Acadêmico" (SPEC-003, RB-10, UC-03 include).
// SPEC-004 e SPEC-005 chamam esta função na MESMA transação da escrita de nota ou frequência (AD-02).
import { entrouEmRisco } from "@/domain/notificacoes";
import { calcularMedia, classificarSituacao } from "@/domain/situacao-academica";
import { prisma } from "@/server/dados/prisma";
import * as dados from "@/server/dados/indicadores";
import { notificarEntradaEmRisco } from "@/server/dados/notificacoes";

export class EstudanteNaoMatriculado extends Error {
  constructor() {
    super("Estudante não matriculado na turma.");
  }
}

// Recalcula a partir dos dados persistidos. Se algo falhar, nada é gravado e o indicador anterior fica.
export async function recalcularIndicador(estudanteId: string, turmaId: string, db: dados.ClienteBanco = prisma) {
  if (!(await dados.estaMatriculado(estudanteId, turmaId, db))) throw new EstudanteNaoMatriculado();

  const media = calcularMedia(await dados.notasPonderadas(estudanteId, turmaId, db));
  const frequencia = await dados.frequenciaAtual(estudanteId, turmaId, db);
  const situacao = classificarSituacao(media, frequencia);

  // SPEC-022 (AC-022-01, INV-022-02): ao entrar em Risco, notifica o estudante e o professor na mesma transação.
  const anterior = await db.indicadorAcademico.findUnique({ where: { estudanteId_turmaId: { estudanteId, turmaId } }, select: { situacao: true } });
  const salvo = await dados.salvarIndicador({ estudanteId, turmaId, media, frequenciaAtual: frequencia, situacao }, db);
  if (entrouEmRisco(anterior?.situacao, situacao)) await notificarEntradaEmRisco(db, estudanteId, turmaId, media, frequencia);
  return salvo;
}
