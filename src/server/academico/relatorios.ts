// Caso de uso da SPEC-009 (RF-15, UC-05): relatório consolidado para Professor e Coordenador.
// Escopo na própria query (ADR-003): professor = turmas que leciona (RB-03); coordenador = turmas sob
// sua responsabilidade (RB-04). Situação vigente (RB-10) e entregas atrasadas pela regra única (OPEN-010).
import { hojeEmBrasilia, statusEntrega } from "@/domain/atividades";
import { consolidarTurma, ehSituacaoRelatorio, type LinhaEstudante, type ResumoTurma, type SituacaoRelatorio } from "@/domain/relatorio";
import type { Sessao } from "@/server/auth/token";
import { deData } from "@/server/dados/atividades";
import { turmasDoRelatorio } from "@/server/dados/relatorios";

export type Relatorio = {
  // SPEC-015: cursos das turmas do escopo, para o filtro de curso do coordenador com mais de um curso.
  cursosDisponiveis: { id: string; nome: string }[];
  turmasDisponiveis: { id: string; rotulo: string }[];
  resumo: ({ id: string; rotulo: string } & ResumoTurma)[];
  linhas: LinhaEstudante[];
};

export type FiltrosRelatorio = { turma?: string | null; situacao?: string | null; curso?: string | null };

export async function gerarRelatorio(sessao: Sessao, filtros: FiltrosRelatorio, hoje = hojeEmBrasilia()):
  Promise<{ ok: true; relatorio: Relatorio } | { ok: false; motivo: "fora-do-escopo" }> {
  const todas = await turmasDoRelatorio(sessao);
  const cursosDisponiveis = [...new Map(todas.map((t) => [t.curso.id, t.curso])).values()].sort((a, b) => a.nome.localeCompare(b.nome));
  // AC-015-15: curso pedido fora do escopo é bloqueado, como a turma (AC-009-03).
  if (filtros.curso && !cursosDisponiveis.some((c) => c.id === filtros.curso)) return { ok: false, motivo: "fora-do-escopo" };
  const turmas = filtros.curso ? todas.filter((t) => t.curso.id === filtros.curso) : todas;
  const turmasDisponiveis = turmas.map((t) => ({ id: t.id, rotulo: `${t.nome} · ${t.disciplina.nome}` }));

  // AC-009-03: turma pedida fora do escopo é bloqueada (não só escondida).
  if (filtros.turma && !turmas.some((t) => t.id === filtros.turma)) return { ok: false, motivo: "fora-do-escopo" };
  const situacao: SituacaoRelatorio | null = ehSituacaoRelatorio(filtros.situacao) ? filtros.situacao : null;

  const resumo: Relatorio["resumo"] = [];
  const linhas: LinhaEstudante[] = [];
  for (const t of turmas.filter((x) => !filtros.turma || x.id === filtros.turma)) {
    const rotulo = `${t.nome} · ${t.disciplina.nome}`;
    const daTurma: LinhaEstudante[] = t.matriculas.map(({ estudante }) => {
      const indicador = t.indicadores.find((i) => i.estudanteId === estudante.id);
      const entregasAtrasadas = t.atividades.filter((a) => {
        const entrega = a.entregas.find((e) => e.estudanteId === estudante.id);
        return statusEntrega(deData(a.prazo), entrega ? deData(entrega.dataEntrega) : null, hoje) === "Atrasada";
      }).length;
      return {
        turmaId: t.id,
        turma: rotulo,
        estudante: estudante.nome,
        media: indicador?.media ?? null,
        frequencia: indicador?.frequenciaAtual ?? null,
        situacao: indicador?.situacao ?? "SemDados",
        entregasAtrasadas,
      };
    });
    // O resumo da turma considera todos os estudantes; o filtro de situação só recorta o detalhe.
    resumo.push({ id: t.id, rotulo, ...consolidarTurma(daTurma) });
    linhas.push(...daTurma.filter((l) => !situacao || l.situacao === situacao));
  }
  return { ok: true, relatorio: { cursosDisponiveis, turmasDisponiveis, resumo, linhas } };
}
