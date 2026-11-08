// Correção de cadastros (SPEC-026, RF-35, RB-32, OPEN-048). Regras puras: campos editáveis e motivo de recusa
// da exclusão. Quem pode e o escopo ficam nos casos de uso (ADR-003).
import type { ErrosDeCampo, Validacao } from "./estrutura-academica";

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const texto = (valor: unknown) => (typeof valor === "string" ? valor.trim() : "");

// AC-026-01 / AC-026-02: nome e e-mail obrigatórios; o perfil não muda.
export function validarEdicaoConta(entrada: Record<string, unknown>): Validacao<{ nome: string; email: string }> {
  const erros: ErrosDeCampo = {};
  const nome = texto(entrada.nome);
  const email = texto(entrada.email).toLowerCase();
  if (!nome) erros.nome = "Informe o nome.";
  if (!email) erros.email = "Informe o e-mail.";
  else if (!FORMATO_EMAIL.test(email)) erros.email = "E-mail inválido.";
  return Object.keys(erros).length > 0 ? { ok: false, erros } : { ok: true, dados: { nome, email } };
}

export function validarNomeTurma(entrada: Record<string, unknown>): Validacao<{ nome: string }> {
  const nome = texto(entrada.nome);
  return nome ? { ok: true, dados: { nome } } : { ok: false, erros: { nome: "Informe o nome." } };
}

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

// AC-026-11: disciplina compartilhada com curso de outra coordenação não é editada nem excluída por este coordenador.
export function motivoDisciplinaCompartilhada(cursosDeOutros: readonly string[]): string | null {
  return cursosDeOutros.length > 0
    ? `A disciplina também está na grade de ${cursosDeOutros.join(", ")}, de outra coordenação. Peça à secretaria ou à outra coordenação.`
    : null;
}

// RB-32 / INV-026-01: só se exclui o que não tem registro dependente.
export function motivoParaNaoExcluirDisciplina(turmas: number): string | null {
  return turmas > 0 ? `A disciplina tem ${plural(turmas, "turma", "turmas")} e não pode ser excluída.` : null;
}

export function motivoParaNaoExcluirTurma(c: { matriculas: number; avaliacoes: number; aulas: number; atividades: number }): string | null {
  const partes = [
    c.matriculas && plural(c.matriculas, "matrícula", "matrículas"),
    c.avaliacoes && plural(c.avaliacoes, "avaliação", "avaliações"),
    c.aulas && plural(c.aulas, "aula", "aulas"),
    c.atividades && plural(c.atividades, "atividade", "atividades"),
  ].filter(Boolean);
  return partes.length > 0 ? `A turma já tem ${partes.join(", ")} e não pode ser excluída.` : null;
}

export function motivoParaNaoExcluirAvaliacao(notas: number): string | null {
  return notas > 0 ? `A avaliação já tem ${plural(notas, "nota", "notas")} e não pode ser excluída. Você pode editar o nome, o peso e a data.` : null;
}

export function motivoParaNaoExcluirAtividade(entregas: number): string | null {
  return entregas > 0 ? `A atividade já tem ${plural(entregas, "entrega registrada", "entregas registradas")} e não pode ser excluída. Você pode editar a descrição e o prazo.` : null;
}

// AC-026-08 / AC-026-09: só sai da turma quem foi matriculado por engano. Trancar e cancelar são da secretaria.
export function motivoParaNaoTirarDaTurma(c: { notas: number; presencas: number; entregas: number; planos: number }): string | null {
  const partes = [
    c.notas && plural(c.notas, "nota", "notas"),
    c.presencas && plural(c.presencas, "registro de chamada", "registros de chamada"),
    c.entregas && plural(c.entregas, "entrega", "entregas"),
    c.planos && plural(c.planos, "plano de recuperação", "planos de recuperação"),
  ].filter(Boolean);
  return partes.length > 0
    ? `O estudante já tem ${partes.join(", ")} nesta turma e não pode ser tirado dela. Para trancar ou cancelar, procure a secretaria.`
    : null;
}
