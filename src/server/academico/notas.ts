// Casos de uso da SPEC-004 (UC-03): cadastrar avaliação, registrar nota e alterar nota.
// Quem pode: Professor (OPEN-001, OPEN-017), conferido na rota; aqui fica o escopo da turma (RB-03),
// sempre dentro da própria query (ADR-003). Toda escrita de nota recalcula o indicador na MESMA
// transação (INV-004-03, RB-10, AD-02): se o recálculo falhar, a nota anterior fica como estava.
import { validarAvaliacao, validarValorNota } from "@/domain/registro-notas";
import { recalcularIndicador } from "@/server/academico/indicador";
import { numeroBR } from "@/domain/auditoria";
import { auditar, nomeDoUsuario, turmaParaAuditoria } from "@/server/dados/auditoria";
import type { ClienteBanco } from "@/server/dados/indicadores";
import * as dados from "@/server/dados/notas";
import { travaDoPeriodo } from "./periodos";
import type { Falha, Resultado } from "./cadastros";

const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const falha = <T>(f: Falha): Resultado<T> => ({ ok: false, falha: f });

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

// OPEN-017: o professor cadastra avaliação (nome, peso, data) só nas turmas que leciona.
export async function cadastrarAvaliacao(entrada: Record<string, unknown>, turmaId: string, professorId: string) {
  if (!(await dados.turmaLecionada(professorId, turmaId))) return falha({ tipo: "fora-do-escopo" });
  const trava = await travaDoPeriodo({ id: turmaId });
  if (trava) return falha(trava);

  const validacao = validarAvaliacao(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  return sucesso(
    await dados.executarEmTransacao(async (tx) => {
      const avaliacao = await dados.criarAvaliacao(turmaId, validacao.dados, tx);
      const contexto = await turmaParaAuditoria(turmaId, tx);
      await auditar(tx, { autorId: professorId, acao: "avaliacao.criada", ...contexto, descricao: `${avaliacao.nome} (peso ${numeroBR(avaliacao.peso)}) em ${contexto.rotulo}` });
      return avaliacao;
    }),
  );
}

// Contrato "Registrar nota": turma, avaliação, estudante e valor.
export async function registrarNota(entrada: Record<string, unknown>, professorId: string) {
  const alvo = { turmaId: texto(entrada.turmaId), avaliacaoId: texto(entrada.avaliacaoId), estudanteId: texto(entrada.estudanteId) };
  if (!alvo.turmaId || !alvo.avaliacaoId || !alvo.estudanteId) {
    return falha({ tipo: "invalido", erros: { selecao: "Escolha a turma, a avaliação e o estudante." } });
  }

  // INV-004-02: avaliação da turma informada, turma lecionada pelo professor e estudante matriculado nela.
  const avaliacao = await dados.avaliacaoParaLancamento(professorId, alvo);
  if (!avaliacao) return falha({ tipo: "fora-do-escopo" });
  const trava = await travaDoPeriodo({ id: avaliacao.turmaId });
  if (trava) return falha(trava);

  const validacao = validarValorNota(entrada.valor);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });

  try {
    return sucesso(
      await dados.executarEmTransacao(async (tx) => {
        const nota = await dados.inserirNota({ avaliacaoId: avaliacao.id, estudanteId: alvo.estudanteId, valor: validacao.dados }, tx);
        // RB-16 (SPEC-013): lançamento registrado no histórico, sem valor anterior.
        await dados.registrarHistorico({ avaliacaoId: avaliacao.id, estudanteId: alvo.estudanteId, autorId: professorId, valorAnterior: null, valorNovo: validacao.dados }, tx);
        await auditarNota(tx, professorId, "nota.lancada", avaliacao.id, alvo.estudanteId, null, validacao.dados);
        const indicador = await recalcularIndicador(alvo.estudanteId, avaliacao.turmaId, tx);
        return { nota, indicador: { media: indicador.media, situacao: indicador.situacao } };
      }),
    );
  } catch (erro) {
    // INV-004-01: uma nota por estudante e avaliação (índice único da migração spec_003_indicador).
    if ((erro as { code?: string }).code === "P2002") {
      return falha({ tipo: "conflito", erro: "Este estudante já tem nota nesta avaliação. Use a alteração de nota." });
    }
    throw erro;
  }
}

// Contrato "Alterar nota": nota e novo valor. Sobrescreve o valor e recalcula (fluxo alternativo).
export async function alterarNota(notaId: string, entrada: Record<string, unknown>, professorId: string) {
  const nota = await dados.notaDoProfessor(professorId, notaId);
  if (!nota) return falha({ tipo: "fora-do-escopo" });
  const trava = await travaDoPeriodo({ id: nota.avaliacao.turmaId });
  if (trava) return falha(trava);

  const validacao = validarValorNota(entrada.valor);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });

  return sucesso(
    await dados.executarEmTransacao(async (tx) => {
      const atualizada = await dados.atualizarValorNota(nota.id, validacao.dados, tx);
      // RB-16 (SPEC-013): alteração registrada com o valor anterior e o novo.
      await dados.registrarHistorico({ avaliacaoId: nota.avaliacaoId, estudanteId: nota.estudanteId, autorId: professorId, valorAnterior: nota.valor, valorNovo: validacao.dados }, tx);
      await auditarNota(tx, professorId, "nota.alterada", nota.avaliacaoId, nota.estudanteId, nota.valor, validacao.dados);
      const indicador = await recalcularIndicador(nota.estudanteId, nota.avaliacao.turmaId, tx);
      return { nota: atualizada, indicador: { media: indicador.media, situacao: indicador.situacao } };
    }),
  );
}

// SPEC-019 (AC-019-01): "Carla Mendes em Prova 1 (ES-A · Modelagem de Software): 5,0 → 6,5".
async function auditarNota(
  tx: ClienteBanco,
  autorId: string,
  acao: "nota.lancada" | "nota.alterada",
  avaliacaoId: string,
  estudanteId: string,
  antes: number | null,
  depois: number,
) {
  const avaliacao = await tx.avaliacao.findUniqueOrThrow({ where: { id: avaliacaoId }, select: { nome: true, turmaId: true } });
  const contexto = await turmaParaAuditoria(avaliacao.turmaId, tx);
  const estudante = await nomeDoUsuario(estudanteId, tx);
  const valores = antes === null ? numeroBR(depois) : `${numeroBR(antes)} → ${numeroBR(depois)}`;
  await auditar(tx, { autorId, acao, ...contexto, descricao: `${estudante} em ${avaliacao.nome} (${contexto.rotulo}): ${valores}`, antes: antes === null ? null : { valor: antes }, depois: { valor: depois } });
}
