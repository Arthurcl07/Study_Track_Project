// Caso de uso "Recalcular Indicador Acadêmico" (SPEC-003, RB-10, UC-03 include).
// SPEC-004 e SPEC-005 chamam esta função na MESMA transação da escrita de nota ou frequência (AD-02).
import { entrouEmRisco } from "@/domain/notificacoes";
import { calcularMediaDaTurma, classificarSituacao, type RegraAvaliacao } from "@/domain/situacao-academica";
import { prisma } from "@/server/dados/prisma";
import * as dados from "@/server/dados/indicadores";
import { notificarEntradaEmRisco } from "@/server/dados/notificacoes";
import { regraDaTurma } from "@/server/dados/regras";

export class EstudanteNaoMatriculado extends Error {
  constructor() {
    super("Estudante não matriculado na turma.");
  }
}

// Recalcula a partir dos dados persistidos. Se algo falhar, nada é gravado e o indicador anterior fica.
// SPEC-052 / RB-47: com a regra do período da turma (a vigente, se aberto); o recálculo em lote já passa a regra.
export async function recalcularIndicador(estudanteId: string, turmaId: string, db: dados.ClienteBanco = prisma, regraInformada?: RegraAvaliacao) {
  if (!(await dados.estaMatriculado(estudanteId, turmaId, db))) throw new EstudanteNaoMatriculado();

  // SPEC-029: média com a substitutiva (RB-28); o exame não entra (RB-29, INV-029-04).
  const media = calcularMediaDaTurma(await dados.avaliacoesDaMedia(estudanteId, turmaId, db));
  const frequencia = await dados.frequenciaAtual(estudanteId, turmaId, db);
  const regra = regraInformada ?? (await regraDaTurma(turmaId, db));
  const situacao = classificarSituacao(media, frequencia, regra);

  // SPEC-022 (AC-022-01, INV-022-02): ao entrar em Risco, notifica o estudante e o professor na mesma transação.
  const anterior = await db.indicadorAcademico.findUnique({ where: { estudanteId_turmaId: { estudanteId, turmaId } }, select: { situacao: true } });
  const salvo = await dados.salvarIndicador({ estudanteId, turmaId, media, frequenciaAtual: frequencia, situacao }, db);
  if (entrouEmRisco(anterior?.situacao, situacao)) await notificarEntradaEmRisco(db, estudanteId, turmaId, media, frequencia, regra);
  return salvo;
}
