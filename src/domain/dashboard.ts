// Cálculos dos dashboards por perfil (SPEC-016, RF-24, RF-25, OPEN-035). Funções puras: sem Next.js nem Prisma.
// Nada daqui é gravado: tudo é derivado na leitura (INV-016-06).
import type { Perfil } from "./perfil";
import { PERFIS } from "./perfil";
import type { SituacaoRelatorio } from "./relatorio";

export const DIAS_PROXIMOS_PRAZOS = 7;

const mediaSimples = (valores: number[]) => (valores.length === 0 ? null : valores.reduce((a, b) => a + b, 0) / valores.length);

// INV-016-03: média geral = média simples das médias das turmas que já têm nota; sem nenhuma, vazia ("—").
export function mediaGeral(turmas: readonly { media: number | null }[]): number | null {
  return mediaSimples(turmas.flatMap((t) => (t.media === null ? [] : [t.media])));
}

// INV-016-03: frequência geral = média simples das frequências registradas; sem nenhuma, vazia ("—").
export function frequenciaGeral(turmas: readonly { frequencia: number | null }[]): number | null {
  return mediaSimples(turmas.flatMap((t) => (t.frequencia === null ? [] : [t.frequencia])));
}

// "AAAA-MM-DD" + dias, sem passar por fuso horário (as datas já estão no horário de Brasília, OPEN-010).
export function somarDias(data: string, dias: number): string {
  const d = new Date(`${data}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

// Prazo de hoje até `dias` dias depois (inclusive).
export function dentroDosProximosDias(prazo: string, hoje: string, dias = DIAS_PROXIMOS_PRAZOS): boolean {
  return prazo >= hoje && prazo <= somarDias(hoje, dias);
}

// INV-016-04: próximos prazos do estudante = atividades com prazo de hoje até 7 dias depois, ainda sem entrega,
// do prazo mais próximo para o mais distante.
export function proximosPrazos<T extends { prazo: string; entregue: boolean }>(atividades: readonly T[], hoje: string, dias = DIAS_PROXIMOS_PRAZOS): T[] {
  return atividades.filter((a) => !a.entregue && dentroDosProximosDias(a.prazo, hoje, dias)).sort((a, b) => a.prazo.localeCompare(b.prazo));
}

export type ContagemContas = {
  ativasPorPerfil: Record<Perfil, number>;
  ativas: number;
  desativadas: number;
  aguardandoSenha: number;
};

// RF-25: contas por perfil (só as ativas), ativas, desativadas e as que ainda usam a senha provisória (RB-15).
export function contarContas(contas: readonly { perfil: Perfil; ativo: boolean; trocarSenha: boolean }[]): ContagemContas {
  const ativasPorPerfil = Object.fromEntries(PERFIS.map((p) => [p, 0])) as Record<Perfil, number>;
  let ativas = 0;
  let aguardandoSenha = 0;
  for (const c of contas) {
    if (!c.ativo) continue;
    ativas++;
    ativasPorPerfil[c.perfil]++;
    if (c.trocarSenha) aguardandoSenha++;
  }
  return { ativasPorPerfil, ativas, desativadas: contas.length - ativas, aguardandoSenha };
}

// Estudantes em Risco numa turma que ainda não têm plano ativo nela (RB-11: só Risco recebe plano).
export function riscoSemPlano<T extends { estudanteId: string; turmaId: string }>(
  emRisco: readonly T[],
  planosAtivos: readonly { estudanteId: string; turmaId: string }[],
): T[] {
  const comPlano = new Set(planosAtivos.map((p) => `${p.estudanteId}|${p.turmaId}`));
  return emRisco.filter((r) => !comPlano.has(`${r.estudanteId}|${r.turmaId}`));
}

export type SituacaoDoCurso = { id: string; rotulo: string; estudantes: number; contagem: Record<SituacaoRelatorio, number> };

// Situação por curso do coordenador: soma, por curso, a contagem de cada turma (uma linha por matrícula, como no
// relatório), então os números batem com o relatório das mesmas turmas (INV-016-02).
export function situacaoPorCurso(
  turmas: readonly { cursoId: string; curso: string; estudantes: number; contagem: Record<SituacaoRelatorio, number> }[],
): SituacaoDoCurso[] {
  const porCurso = new Map<string, SituacaoDoCurso>();
  for (const t of turmas) {
    const atual = porCurso.get(t.cursoId) ?? { id: t.cursoId, rotulo: t.curso, estudantes: 0, contagem: { Normal: 0, Atencao: 0, Risco: 0, SemDados: 0 } };
    atual.estudantes += t.estudantes;
    for (const chave of Object.keys(atual.contagem) as SituacaoRelatorio[]) atual.contagem[chave] += t.contagem[chave];
    porCurso.set(t.cursoId, atual);
  }
  return [...porCurso.values()].sort((a, b) => a.rotulo.localeCompare(b.rotulo, "pt-BR"));
}
