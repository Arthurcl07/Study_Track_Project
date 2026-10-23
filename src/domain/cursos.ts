// Regras de curso, grade e vínculo do estudante (SPEC-015, RF-22, RF-23, RB-17, RB-18, RB-19, OPEN-030 a OPEN-033).
// Funções puras: sem Next.js nem Prisma.
import type { ErrosDeCampo, Validacao } from "./estrutura-academica";
import type { Perfil } from "./perfil";

export type DadosCurso = { nome: string; coordenadorId: string };

const texto = (valor: unknown) => (typeof valor === "string" ? valor.trim() : "");

// RF-22: nome e coordenador obrigatórios. Nome repetido e coordenador inválido dependem do banco (abaixo).
export function validarCurso(entrada: Record<string, unknown>): Validacao<DadosCurso> {
  const erros: ErrosDeCampo = {};
  const dados = { nome: texto(entrada.nome), coordenadorId: texto(entrada.coordenadorId) };
  if (!dados.nome) erros.nome = "Informe o nome do curso.";
  if (!dados.coordenadorId) erros.coordenadorId = "Escolha o coordenador.";
  return Object.keys(erros).length > 0 ? { ok: false, erros } : { ok: true, dados };
}

export const MENSAGEM_COORDENADOR_INVALIDO = "Escolha uma conta ativa com perfil Coordenador.";
export const MENSAGEM_NOME_CURSO_EM_USO = "Já existe um curso com este nome.";

// RB-17 / INV-015-01: só uma conta ativa com perfil Coordenador pode coordenar um curso.
export function podeCoordenar(conta: { perfil: Perfil; ativo: boolean } | null): boolean {
  return conta !== null && conta.perfil === "Coordenador" && conta.ativo;
}

// RB-18 / INV-015-03: a disciplina da turma precisa estar na grade do curso da turma.
export function disciplinaNaGrade(gradeDoCurso: readonly string[], disciplinaId: string): boolean {
  return gradeDoCurso.includes(disciplinaId);
}

// RB-19 / INV-015-06: só há matrícula de estudante em turma do seu curso.
export function podeMatricular(cursoDoEstudante: string | null, cursoDaTurma: string): boolean {
  return cursoDoEstudante === cursoDaTurma;
}

export const MENSAGEM_DISCIPLINA_FORA_DA_GRADE = "Esta disciplina não faz parte da grade do curso escolhido.";
export const MENSAGEM_ESTUDANTE_DE_OUTRO_CURSO = "Este estudante é de outro curso e não pode ser matriculado nesta turma.";
export const MENSAGEM_JA_NA_GRADE = "Esta disciplina já faz parte da grade do curso.";

// SPEC-015: escolhe o curso de uma operação do coordenador. Com um só curso, ele pode ser omitido;
// com mais de um, precisa ser informado. Curso que ele não coordena nunca é aceito (RB-04, INV-015-07).
export type EscolhaCurso = { ok: true; cursoId: string } | { ok: false; motivo: "sem-curso" | "informe" | "fora-do-escopo" };

export function escolherCurso(cursosDoCoordenador: readonly string[], pedido: unknown): EscolhaCurso {
  const cursoId = texto(pedido);
  if (cursoId) return cursosDoCoordenador.includes(cursoId) ? { ok: true, cursoId } : { ok: false, motivo: "fora-do-escopo" };
  if (cursosDoCoordenador.length === 1) return { ok: true, cursoId: cursosDoCoordenador[0] };
  return { ok: false, motivo: cursosDoCoordenador.length === 0 ? "sem-curso" : "informe" };
}

export function mensagemCoordenadorDeCurso(nome: string, cursos: number) {
  return `${nome} coordena ${cursos} curso(s) e não pode ser desativado(a). Escolha outra coordenação em Cursos antes.`;
}
