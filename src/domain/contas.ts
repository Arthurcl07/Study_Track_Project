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

// ---------------------------------------------------------------- SPEC-053 / RB-48 (OPEN-074): troca de perfil

export type VinculosDaConta = { id: string; nome: string; perfil: Perfil; turmas: string[]; cursos: string[]; matriculas: number };
export type RecusaDaTroca = { tipo: "conflito" | "invalido"; erro: string };

const listaCurta = (nomes: readonly string[]) => (nomes.length <= 3 ? nomes.join(", ") : `${nomes.slice(0, 3).join(", ")} e mais ${nomes.length - 3}`);

// INV-053-01: sem vínculo que o novo perfil não pode ter; Estudante precisa de curso; ninguém troca o próprio perfil.
export function motivoParaNaoTrocarPerfil(conta: VinculosDaConta, novo: unknown, cursoId: string | null, administradorId: string): RecusaDaTroca | null {
  if (!ehPerfilValido(novo)) return { tipo: "invalido", erro: "Escolha o novo perfil." };
  if (conta.id === administradorId) return { tipo: "conflito", erro: "Você não pode trocar o seu próprio perfil." };
  if (novo === conta.perfil) return { tipo: "invalido", erro: `${conta.nome} já é ${novo}.` };
  if (novo === "Estudante" && !cursoId) return { tipo: "invalido", erro: "Escolha o curso do estudante." };
  if (conta.turmas.length > 0) {
    return { tipo: "conflito", erro: `Não dá para trocar: ${conta.nome} leciona ${conta.turmas.length} turma(s) (${listaCurta(conta.turmas)}). Troque o professor dessas turmas antes.` };
  }
  if (conta.cursos.length > 0) {
    return { tipo: "conflito", erro: `Não dá para trocar: ${conta.nome} coordena ${listaCurta(conta.cursos)}. Troque a coordenação antes.` };
  }
  if (conta.matriculas > 0) {
    return { tipo: "conflito", erro: `Não dá para trocar: ${conta.nome} tem ${conta.matriculas} matrícula(s) como estudante. O histórico escolar não pode ficar sem dono.` };
  }
  return null;
}

// ---------------------------------------------------------------- SPEC-053: importar professores (nome;email)

export type LinhaProfessor = { linha: number; nome: string; email: string; erro?: string };

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// AC-053-06: e-mail repetido na planilha ou já cadastrado aponta a linha; tudo ou nada (INV-053-02).
export function preverProfessores(linhas: readonly { linha: number; nome: string; email: string }[], emailsExistentes: ReadonlySet<string>): LinhaProfessor[] {
  const primeira = new Map<string, number>();
  return linhas.map((l) => {
    if (!l.nome) return { ...l, erro: "Nome vazio" };
    if (!FORMATO_EMAIL.test(l.email)) return { ...l, erro: "E-mail inválido" };
    const anterior = primeira.get(l.email);
    if (anterior !== undefined) return { ...l, erro: `E-mail repetido na planilha (linha ${anterior})` };
    primeira.set(l.email, l.linha);
    if (emailsExistentes.has(l.email)) return { ...l, erro: "Já existe uma conta com este e-mail" };
    return { ...l };
  });
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
