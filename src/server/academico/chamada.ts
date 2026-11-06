// Caso de uso "Registrar chamada" (SPEC-018, RF-27, UC-08 reescrito). Quem pode: Professor da turma (RB-03),
// conferido na rota pelo perfil e aqui pela query (ADR-003). Aula, presenças, frequências e indicadores são
// gravados na MESMA transação (INV-018-04, RB-10): se algo falhar, nada muda.
import { hojeEmBrasilia } from "@/domain/atividades";
import { validarChamada } from "@/domain/frequencia";
import { recalcularIndicador } from "@/server/academico/indicador";
import * as dados from "@/server/dados/chamada";
import { executarEmTransacao } from "@/server/dados/notas";
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
  const { data, presencas } = validacao.dados;

  return sucesso(
    await executarEmTransacao(async (tx) => {
      const gravada = await dados.salvarChamada(turmaId, data, presencas, tx);
      const indicadores = [];
      for (const { estudanteId } of presencas) {
        const indicador = await recalcularIndicador(estudanteId, turmaId, tx);
        indicadores.push({ estudanteId, frequenciaAtual: indicador.frequenciaAtual, situacao: indicador.situacao });
      }
      return { ...gravada, data, presentes: presencas.filter((p) => p.presente).length, total: presencas.length, indicadores };
    }),
  );
}

export async function consultarAulas(professorId: string, turmaId: string) {
  if (!(await dados.turmaParaChamada(professorId, turmaId))) return null;
  return dados.aulasDaTurma(professorId, turmaId);
}
