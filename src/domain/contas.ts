// Regras da gestão de contas (SPEC-010, RF-16, RB-01, RB-14, OPEN-025). Funções puras: sem Next.js nem Prisma.
import { mensagemCoordenadorDeCurso } from "./cursos";
import { validarEstudante, type Validacao } from "./estrutura-academica";
import { ehPerfilValido, type Perfil } from "./perfil";

export type DadosNovaConta = { nome: string; email: string; senha: string; perfil: Perfil; cursoId: string | null };

// Nome, e-mail e senha inicial seguem o mesmo critério do cadastro de estudante (OPEN-009);
// o perfil precisa ser exatamente um dos quatro (RB-01, INV-010-01). SPEC-015 / RB-19: conta de Estudante
// exige o curso; os outros perfis nunca têm curso (INV-015-05), então um curso enviado para eles é ignorado.
export function validarNovaConta(entrada: Record<string, unknown>): Validacao<DadosNovaConta> {
  const base = validarEstudante(entrada);
  const erros = base.ok ? {} : { ...base.erros };
  if (!ehPerfilValido(entrada.perfil)) erros.perfil = "Escolha o perfil da conta.";
  const cursoId = entrada.perfil === "Estudante" && typeof entrada.cursoId === "string" ? entrada.cursoId.trim() : "";
  if (entrada.perfil === "Estudante" && !cursoId) erros.cursoId = "Escolha o curso do estudante.";
  if (Object.keys(erros).length > 0 || !base.ok) return { ok: false, erros };
  return { ok: true, dados: { ...base.dados, perfil: entrada.perfil as Perfil, cursoId: cursoId || null } };
}

export const MENSAGEM_DESATIVAR_A_SI_MESMO = "Você não pode desativar a sua própria conta.";

export function mensagemProfessorComTurmas(nome: string, turmas: number) {
  return `${nome} é professor responsável por ${turmas} turma(s) e não pode ser desativado. Troque o professor dessas turmas antes.`;
}

// RB-14 / INV-010-06 / INV-015-09: devolve o motivo que impede a desativação, ou null se ela é permitida.
export function motivoParaNaoDesativar(
  alvo: { id: string; nome: string; turmasComoProfessor: number; cursosCoordenados: number },
  solicitanteId: string,
): string | null {
  if (alvo.id === solicitanteId) return MENSAGEM_DESATIVAR_A_SI_MESMO;
  if (alvo.turmasComoProfessor > 0) return mensagemProfessorComTurmas(alvo.nome, alvo.turmasComoProfessor);
  if (alvo.cursosCoordenados > 0) return mensagemCoordenadorDeCurso(alvo.nome, alvo.cursosCoordenados);
  return null;
}
