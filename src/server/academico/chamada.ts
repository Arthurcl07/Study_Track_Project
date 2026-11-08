// Caso de uso "Registrar chamada" (SPEC-018, RF-27, UC-08 reescrito). Quem pode: Professor da turma (RB-03),
// conferido na rota pelo perfil e aqui pela query (ADR-003). Aulas, presenças, frequências e indicadores são
// gravados na MESMA transação (INV-018-04, RB-10): se algo falhar, nada muda.
// SPEC-028: de 1 a 4 aulas na data (INV-028-01). SPEC-026: mudar a data e excluir aula (INV-026-03).
import { hojeEmBrasilia } from "@/domain/atividades";
import { MAXIMO_AULAS_POR_DATA, MENSAGEM_DATA_AULA, dataDeAulaValida, faltaAbonada, validarChamada } from "@/domain/frequencia";
import { recalcularIndicador } from "@/server/academico/indicador";
import { dataBR } from "@/domain/auditoria";
import { deData, paraData } from "@/server/dados/atividades";
import { auditar, nomeDoUsuario, turmaParaAuditoria } from "@/server/dados/auditoria";
import * as dados from "@/server/dados/chamada";
import { MATRICULA_CURSANDO } from "@/server/dados/matriculas";
import { executarEmTransacao } from "@/server/dados/notas";
import { prisma } from "@/server/dados/prisma";
import type { ClienteBanco } from "@/server/dados/indicadores";
import type { Falha, Resultado } from "./cadastros";
import { travaDoPeriodo } from "./periodos";

const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const falha = <T>(f: Falha): Resultado<T> => ({ ok: false, falha: f });

export async function registrarChamada(entrada: Record<string, unknown>, professorId: string, hoje = hojeEmBrasilia()) {
  const turmaId = typeof entrada.turmaId === "string" ? entrada.turmaId.trim() : "";
  if (!turmaId) return falha({ tipo: "invalido", erros: { turmaId: "Escolha a turma." } });

  const turma = await dados.turmaParaChamada(professorId, turmaId);
  if (!turma) return falha({ tipo: "fora-do-escopo" });
  const trava = await travaDoPeriodo({ id: turmaId });
  if (trava) return falha(trava);

  const validacao = validarChamada(entrada, turma.matriculas.map((m) => m.estudanteId), hoje);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  const { data, aulas } = validacao.dados;

  return sucesso(
    await executarEmTransacao(async (tx) => {
      const gravada = await dados.salvarChamada(turmaId, data, aulas, tx);
      // SPEC-019: "ES-A · Modelagem · 05/11/2026 (2 aulas): 6 presentes, 2 faltas (Carla Mendes, Paula Nunes)".
      const contexto = await turmaParaAuditoria(turmaId, tx);
      const faltas = [...new Set(aulas.flatMap((a) => a.filter((p) => !p.presente).map((p) => p.estudanteId)))];
      const nomes = await Promise.all(faltas.slice(0, 5).map((id) => nomeDoUsuario(id, tx)));
      const lista = nomes.length > 0 ? ` (${nomes.join(", ")}${faltas.length > 5 ? "…" : ""})` : "";
      const presentesNa1 = aulas[0].filter((p) => p.presente).length;
      await auditar(tx, {
        autorId: professorId,
        acao: gravada.corrigida ? "chamada.corrigida" : "chamada.registrada",
        ...contexto,
        descricao:
          aulas.length === 1
            ? `${contexto.rotulo} · ${dataBR(data)}: ${presentesNa1} presente(s), ${faltas.length} falta(s)${lista}`
            : `${contexto.rotulo} · ${dataBR(data)} (${aulas.length} aulas): ${presentesNa1} presente(s) na 1ª aula; ${faltas.length} estudante(s) com falta${lista}`,
        depois: { data, aulas },
      });
      const indicadores = [];
      for (const { estudanteId } of aulas[0]) {
        const indicador = await recalcularIndicador(estudanteId, turmaId, tx);
        indicadores.push({ estudanteId, frequenciaAtual: indicador.frequenciaAtual, situacao: indicador.situacao });
      }
      return { ...gravada, data, quantidade: aulas.length, presentes: presentesNa1, total: aulas[0].length, indicadores };
    }),
  );
}

export async function consultarAulas(professorId: string, turmaId: string) {
  if (!(await dados.turmaParaChamada(professorId, turmaId))) return null;
  return dados.aulasDaTurma(professorId, turmaId);
}

// Recalcula frequência e indicador de cada estudante que constava da aula (INV-026-03).
async function recalcularEstudantes(estudantes: string[], turmaId: string, tx: ClienteBanco) {
  for (const estudanteId of estudantes) {
    await dados.recalcularFrequencia(estudanteId, turmaId, tx);
    const matriculado = await tx.matricula.findFirst({ where: { estudanteId, turmaId }, select: { estudanteId: true } });
    if (matriculado) await recalcularIndicador(estudanteId, turmaId, tx);
  }
}

// AC-026-06 / RB-32: excluir a aula leva as presenças dela; frequência e indicador recalculados na transação.
export async function excluirAula(aulaId: string, professorId: string): Promise<Resultado<{ id: string }>> {
  const aula = await dados.aulaDoProfessor(professorId, aulaId);
  if (!aula) return falha({ tipo: "nao-encontrado", erro: "Aula não encontrada." });
  const trava = await travaDoPeriodo({ id: aula.turmaId });
  if (trava) return falha(trava);
  return sucesso(
    await executarEmTransacao(async (tx) => {
      await tx.aula.delete({ where: { id: aulaId } });
      await recalcularEstudantes(aula.presencas.map((p) => p.estudanteId), aula.turmaId, tx);
      const contexto = await turmaParaAuditoria(aula.turmaId, tx);
      await auditar(tx, {
        autorId: professorId,
        acao: "aula.excluida",
        ...contexto,
        descricao: `${contexto.rotulo} · ${dataBR(deData(aula.data))}, ${aula.numero}ª aula (${aula.presencas.length} presença(s) excluída(s))`,
        antes: { data: deData(aula.data), numero: aula.numero },
      });
      return { id: aulaId };
    }),
  );
}

// AC-026-07 / INV-026-03: a data nova não pode ser futura nem ter já 4 aulas; a aula vira a última da data nova.
export async function mudarDataDaAula(aulaId: string, entrada: Record<string, unknown>, professorId: string, hoje = hojeEmBrasilia()): Promise<Resultado<{ id: string; data: string; numero: number }>> {
  const aula = await dados.aulaDoProfessor(professorId, aulaId);
  if (!aula) return falha({ tipo: "nao-encontrado", erro: "Aula não encontrada." });
  const trava = await travaDoPeriodo({ id: aula.turmaId });
  if (trava) return falha(trava);
  const data = dataDeAulaValida(entrada.data, hoje);
  if (!data) return falha({ tipo: "invalido", erros: { data: MENSAGEM_DATA_AULA } });
  const anterior = deData(aula.data);
  if (data === anterior) return sucesso({ id: aulaId, data, numero: aula.numero });
  return executarEmTransacao(async (tx) => {
    const numero = await dados.proximoNumeroDaData(aula.turmaId, data, tx);
    if (numero > MAXIMO_AULAS_POR_DATA) return falha<{ id: string; data: string; numero: number }>({ tipo: "invalido", erros: { data: `Esta data já tem ${MAXIMO_AULAS_POR_DATA} aulas.` } });
    await tx.aula.update({ where: { id: aulaId }, data: { data: paraData(data), numero } });
    // O abono depende da data (RB-31): a frequência pode mudar.
    await recalcularEstudantes(aula.presencas.map((p) => p.estudanteId), aula.turmaId, tx);
    const contexto = await turmaParaAuditoria(aula.turmaId, tx);
    await auditar(tx, {
      autorId: professorId,
      acao: "aula.editada",
      ...contexto,
      descricao: `${contexto.rotulo} · aula de ${dataBR(anterior)} passou para ${dataBR(data)}`,
      antes: { data: anterior, numero: aula.numero },
      depois: { data, numero },
    });
    return sucesso({ id: aulaId, data, numero });
  });
}

// SPEC-032 (AC-032-05): datas abonadas de cada estudante cursando a turma, para a chamada mostrar "Abonada".
export async function abonosDaTurma(turmaId: string) {
  const abonos = await prisma.abono.findMany({
    where: { estudante: { matriculas: { some: { turmaId, ...MATRICULA_CURSANDO } } } },
    select: { estudanteId: true, inicio: true, fim: true },
  });
  return abonos.map((a) => ({ estudanteId: a.estudanteId, inicio: deData(a.inicio), fim: deData(a.fim) }));
}

export function abonadaNaData(estudanteId: string, data: string, abonos: { estudanteId: string; inicio: string; fim: string }[]) {
  return faltaAbonada(data, abonos.filter((a) => a.estudanteId === estudanteId));
}
