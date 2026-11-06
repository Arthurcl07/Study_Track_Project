// Regras e textos das notificações (SPEC-022, RF-31, RB-23, OPEN-043). Funções puras: sem Next.js nem Prisma.
import { numeroBR } from "./auditoria";
import type { Situacao } from "./situacao-academica";

export type TipoNotificacao = "Risco" | "Nota" | "Plano" | "Prazo" | "Comunicado";
export type NovaNotificacao = { tipo: TipoNotificacao; titulo: string; texto: string; link: string; chave?: string };

export const DIAS_DE_AVISO_DO_PRAZO = 2;

// INV-022-02: "entrou em Risco" só quando a situação anterior não era Risco (ou não existia).
export function entrouEmRisco(anterior: Situacao | null | undefined, nova: Situacao): boolean {
  return nova === "Risco" && anterior !== "Risco";
}

const percentual = (v: number | null) => (v === null ? "—" : `${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%`);

function motivoDoRisco(media: number | null, frequencia: number | null): string {
  const partes: string[] = [];
  if (frequencia !== null && frequencia < 75) partes.push(`frequência em ${percentual(frequencia)}, abaixo de 75%`);
  if (media !== null && media < 5) partes.push(`média ${numeroBR(media)}, abaixo de 5,0`);
  return partes.length > 0 ? partes.join(" e ") : "situação de Risco";
}

export function notificacaoRiscoEstudante(disciplina: string, professor: string, media: number | null, frequencia: number | null): NovaNotificacao {
  return {
    tipo: "Risco",
    titulo: `Você entrou em situação de Risco em ${disciplina}`,
    texto: `Motivo: ${motivoDoRisco(media, frequencia)}. Converse com ${professor}.`,
    link: "/estudante",
  };
}

export function notificacaoRiscoProfessor(estudante: string, turma: string, turmaId: string, media: number | null, frequencia: number | null): NovaNotificacao {
  return {
    tipo: "Risco",
    titulo: `${estudante} entrou em Risco em ${turma}`,
    texto: `Motivo: ${motivoDoRisco(media, frequencia)}. Avalie criar um plano de recuperação.`,
    link: `/professor/turmas/${turmaId}`,
  };
}

export function notificacaoNota(avaliacao: string, disciplina: string, valor: number, anterior: number | null, media: number | null): NovaNotificacao {
  return {
    tipo: "Nota",
    titulo: `Nota ${anterior === null ? "lançada" : "alterada"} em ${avaliacao} — ${disciplina}`,
    texto: `Sua nota: ${numeroBR(valor)}${anterior === null ? "" : ` (antes ${numeroBR(anterior)})`}. Média atual: ${numeroBR(media)}.`,
    link: "/estudante",
  };
}

export function notificacaoPlano(disciplina: string, itens: number, professor: string): NovaNotificacao {
  return {
    tipo: "Plano",
    titulo: `Plano de recuperação criado em ${disciplina}`,
    texto: `${itens} item(ns) previsto(s) por ${professor}.`,
    link: "/estudante",
  };
}

// SPEC-025 (AC-025-01): aviso de comunicado publicado para a turma ou o curso.
export function notificacaoComunicado(titulo: string, autor: string, alcance: string): NovaNotificacao {
  return { tipo: "Comunicado", titulo: `Comunicado: ${titulo}`, texto: `${autor} · ${alcance}`, link: "/comunicados" };
}

export const chavePrazo = (atividadeId: string, estudanteId: string) => `prazo:${atividadeId}:${estudanteId}`;

// Dias entre hoje e o prazo ("AAAA-MM-DD", horário de Brasília).
export function diasAtePrazo(prazo: string, hoje: string): number {
  return Math.round((Date.parse(`${prazo}T00:00:00Z`) - Date.parse(`${hoje}T00:00:00Z`)) / 86_400_000);
}

// RF-31: prazo de hoje até 2 dias à frente, ainda sem entrega.
export function prazoPedeAviso(prazo: string, hoje: string, entregue: boolean): boolean {
  const dias = diasAtePrazo(prazo, hoje);
  return !entregue && dias >= 0 && dias <= DIAS_DE_AVISO_DO_PRAZO;
}

export function notificacaoPrazo(atividadeId: string, estudanteId: string, descricao: string, disciplina: string, prazo: string, hoje: string): NovaNotificacao {
  const dias = diasAtePrazo(prazo, hoje);
  const quando = dias === 0 ? "hoje" : dias === 1 ? "amanhã" : `em ${dias} dias`;
  return {
    tipo: "Prazo",
    titulo: `Prazo ${quando}: ${descricao}`,
    texto: `${disciplina} · ainda sem entrega registrada.`,
    link: "/estudante/atividades",
    chave: chavePrazo(atividadeId, estudanteId),
  };
}
