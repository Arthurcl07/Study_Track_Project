// Caso de uso "Consultar histórico de notas" (SPEC-013, UC-13, RF-20, RB-16).
import type { Sessao } from "@/server/auth/token";
import * as dados from "@/server/dados/historico";

export async function consultarHistorico(sessao: Sessao, turmaPedida?: string | null) {
  const turmas = (await dados.turmasDoHistorico(sessao)).map((t) => ({ id: t.id, rotulo: `${t.nome} · ${t.disciplina.nome}` }));
  // Turma pedida fora do escopo é bloqueada, não só escondida (mesmo critério do relatório, AC-009-03).
  if (turmaPedida && !turmas.some((t) => t.id === turmaPedida)) return { ok: false as const };
  const turmaId = turmaPedida || turmas[0]?.id || null;
  const registros = turmaId
    ? (await dados.historicoDaTurma(sessao, turmaId)).map((r) => ({
        id: r.id,
        registradoEm: r.registradoEm.toISOString(),
        avaliacao: r.avaliacao.nome,
        estudante: r.estudante.nome,
        valorAnterior: r.valorAnterior,
        valorNovo: r.valorNovo,
        autor: r.autor.nome,
      }))
    : [];
  return { ok: true as const, turmas, turmaId, registros };
}
