// Caso de uso do painel do coordenador (SPEC-014, RF-21, OPEN-029). Só leitura. Os números por turma vêm
// da mesma consolidação do relatório (SPEC-009, INV-014-01), no escopo do coordenador (RB-04, ADR-003).
import { turmasQuePedemAtencao } from "@/domain/relatorio";
import type { Sessao } from "@/server/auth/token";
import { listarDisciplinas, listarTurmasDoEscopo } from "@/server/dados/estrutura";
import { estudantesEmRiscoDoCoordenador } from "@/server/dados/relatorios";
import { gerarRelatorio } from "./relatorios";

export async function consultarPainelCoordenador(sessao: Sessao) {
  const [disciplinas, turmas, relatorio, emRisco] = await Promise.all([
    listarDisciplinas(),
    listarTurmasDoEscopo(sessao),
    gerarRelatorio(sessao, {}),
    estudantesEmRiscoDoCoordenador(sessao.usuarioId),
  ]);
  const resumo = relatorio.ok ? relatorio.relatorio.resumo : [];
  const estudantes = new Set(turmas.flatMap((t) => (t.estudantes ?? []).map((e) => e.id)));
  return {
    totais: { disciplinas: disciplinas.length, turmas: turmas.length, estudantes: estudantes.size, emRisco },
    resumo,
    atencao: turmasQuePedemAtencao(resumo),
  };
}

export type PainelCoordenador = Awaited<ReturnType<typeof consultarPainelCoordenador>>;
