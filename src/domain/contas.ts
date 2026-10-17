// Regras da gestão de contas (SPEC-010, RF-16, RB-01, RB-14, OPEN-025). Funções puras: sem Next.js nem Prisma.
import { validarEstudante, type Validacao } from "./estrutura-academica";
import { ehPerfilValido, type Perfil } from "./perfil";

export type DadosNovaConta = { nome: string; email: string; senha: string; perfil: Perfil };

// Nome, e-mail e senha inicial seguem o mesmo critério do cadastro de estudante (OPEN-009);
// o perfil precisa ser exatamente um dos quatro (RB-01, INV-010-01).
export function validarNovaConta(entrada: Record<string, unknown>): Validacao<DadosNovaConta> {
  const base = validarEstudante(entrada);
  const erros = base.ok ? {} : { ...base.erros };
  if (!ehPerfilValido(entrada.perfil)) erros.perfil = "Escolha o perfil da conta.";
  if (Object.keys(erros).length > 0 || !base.ok) return { ok: false, erros };
  return { ok: true, dados: { ...base.dados, perfil: entrada.perfil as Perfil } };
}

export const MENSAGEM_DESATIVAR_A_SI_MESMO = "Você não pode desativar a sua própria conta.";

export function mensagemProfessorComTurmas(nome: string, turmas: number) {
  return `${nome} é professor responsável por ${turmas} turma(s) e não pode ser desativado. Troque o professor dessas turmas antes.`;
}

// RB-14 / INV-010-06: devolve o motivo que impede a desativação, ou null se ela é permitida.
export function motivoParaNaoDesativar(alvo: { id: string; nome: string; turmasComoProfessor: number }, solicitanteId: string): string | null {
  if (alvo.id === solicitanteId) return MENSAGEM_DESATIVAR_A_SI_MESMO;
  if (alvo.turmasComoProfessor > 0) return mensagemProfessorComTurmas(alvo.nome, alvo.turmasComoProfessor);
  return null;
}
