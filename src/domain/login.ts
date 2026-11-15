// Limite de tentativas no login (SPEC-046, RF-55, RB-44, OPEN-068). Funções puras: sem Next.js nem Prisma.
import { FUSO_ACADEMICO } from "./atividades";

export const LIMITE_TENTATIVAS = 5;
export const MINUTOS_BLOQUEIO = 15;
// O aviso "Restam N tentativas" aparece a partir da 3ª errada (SPEC-046, escopo).
const AVISO_A_PARTIR_DE = 3;

export const MENSAGEM_CREDENCIAIS_INVALIDAS = "E-mail ou senha inválidos.";

export type Tentativas = { erradas: number; bloqueadoAte: Date | null };

export const SEM_TENTATIVAS: Tentativas = { erradas: 0, bloqueadoAte: null };

export function estaBloqueado(estado: Tentativas | null, agora: Date): boolean {
  return !!estado?.bloqueadoAte && estado.bloqueadoAte.getTime() > agora.getTime();
}

// RB-44: cada erro soma 1; a 5ª errada seguida bloqueia por 15 minutos. Depois de um bloqueio vencido, a contagem
// recomeça do zero.
export function aposErro(estado: Tentativas | null, agora: Date): Tentativas & { bloqueou: boolean } {
  const anterior = estado?.bloqueadoAte && estado.bloqueadoAte.getTime() <= agora.getTime() ? SEM_TENTATIVAS : (estado ?? SEM_TENTATIVAS);
  const erradas = anterior.erradas + 1;
  if (erradas >= LIMITE_TENTATIVAS) {
    return { erradas, bloqueadoAte: new Date(agora.getTime() + MINUTOS_BLOQUEIO * 60_000), bloqueou: true };
  }
  return { erradas, bloqueadoAte: null, bloqueou: false };
}

export function tentativasRestantes(erradas: number): number {
  return Math.max(0, LIMITE_TENTATIVAS - erradas);
}

export function horaBR(data: Date): string {
  return data.toLocaleTimeString("pt-BR", { timeZone: FUSO_ACADEMICO, hour: "2-digit", minute: "2-digit" });
}

// INV-046-02: a mesma mensagem para e-mail com conta e sem conta.
export function mensagemDeErro(erradas: number): string {
  const restam = tentativasRestantes(erradas);
  if (erradas < AVISO_A_PARTIR_DE || restam === 0) return MENSAGEM_CREDENCIAIS_INVALIDAS;
  return `${MENSAGEM_CREDENCIAIS_INVALIDAS} ${restam === 1 ? "Resta 1 tentativa" : `Restam ${restam} tentativas`} antes do bloqueio de ${MINUTOS_BLOQUEIO} minutos.`;
}

export function mensagemDeBloqueio(ate: Date): string {
  return `Muitas tentativas erradas. Este e-mail está bloqueado até ${horaBR(ate)} (${MINUTOS_BLOQUEIO} minutos). Se esqueceu a senha, use "Esqueci minha senha".`;
}
