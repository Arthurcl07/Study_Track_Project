// Casos de uso de cadastro da SPEC-002 (RF-03, RF-04). Quem pode: Coordenador (OPEN-001),
// verificado nas rotas; aqui ficam as regras de vínculo e escopo da turma.
// SPEC-015: o escopo do coordenador são os cursos que ele coordena (RB-04); disciplina na grade (RB-18) e
// estudante do mesmo curso da turma (RB-19).
import {
  MENSAGEM_DISCIPLINA_FORA_DA_GRADE,
  MENSAGEM_ESTUDANTE_DE_OUTRO_CURSO,
  MENSAGEM_JA_NA_GRADE,
  disciplinaNaGrade,
  escolherCurso,
  podeMatricular,
} from "@/domain/cursos";
import {
  validarDisciplina,
  validarEstudante,
  validarTurma,
  type ErrosDeCampo,
} from "@/domain/estrutura-academica";
import { gerarHashSenha } from "@/server/auth/senha";
import * as dados from "@/server/dados/estrutura";

export type Falha =
  | { tipo: "invalido"; erros: ErrosDeCampo }
  | { tipo: "conflito"; erro: string }
  | { tipo: "fora-do-escopo" }
  | { tipo: "nao-encontrado"; erro: string };

export type Resultado<T> = { ok: true; valor: T } | { ok: false; falha: Falha };

const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const falha = <T>(f: Falha): Resultado<T> => ({ ok: false, falha: f });

// Curso da operação: informado, ou implícito quando o coordenador tem um só curso (escolherCurso).
async function cursoDaOperacao(coordenadorId: string, pedido: unknown): Promise<{ ok: true; cursoId: string } | { ok: false; falha: Falha }> {
  const cursos = (await dados.cursosDoCoordenador(coordenadorId)).map((c) => c.id);
  const escolha = escolherCurso(cursos, pedido);
  if (escolha.ok) return escolha;
  if (escolha.motivo === "fora-do-escopo") return { ok: false, falha: { tipo: "fora-do-escopo" } };
  const mensagem = escolha.motivo === "sem-curso" ? "Você ainda não coordena nenhum curso." : "Escolha o curso.";
  return { ok: false, falha: { tipo: "invalido", erros: { cursoId: mensagem } } };
}

// RF-23 / AC-015-05: a disciplina nova entra só na grade do curso escolhido.
export async function cadastrarDisciplina(entrada: Record<string, unknown>, coordenadorId: string) {
  const curso = await cursoDaOperacao(coordenadorId, entrada.cursoId);
  if (!curso.ok) return falha(curso.falha);
  const validacao = validarDisciplina(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  return sucesso(await dados.criarDisciplina(validacao.dados, curso.cursoId));
}

// RF-23 / AC-015-06: disciplina existente entra na grade de outro curso, sem duplicar (INV-015-04).
export async function adicionarDisciplinaAoCurso(cursoId: string, entrada: Record<string, unknown>, coordenadorId: string) {
  const curso = await cursoDaOperacao(coordenadorId, cursoId);
  if (!curso.ok) return falha(curso.falha);
  const disciplinaId = typeof entrada.disciplinaId === "string" ? entrada.disciplinaId.trim() : "";
  if (!disciplinaId) return falha({ tipo: "invalido", erros: { disciplinaId: "Escolha a disciplina." } });
  if (!(await dados.buscarDisciplina(disciplinaId))) return falha({ tipo: "invalido", erros: { disciplinaId: "Disciplina inexistente." } });
  if (disciplinaNaGrade(await dados.gradeDoCurso(cursoId), disciplinaId)) return falha({ tipo: "conflito", erro: MENSAGEM_JA_NA_GRADE });
  try {
    return sucesso(await dados.adicionarDisciplinaAGrade(cursoId, disciplinaId));
  } catch (erro) {
    if ((erro as { code?: string }).code === "P2002") return falha({ tipo: "conflito", erro: MENSAGEM_JA_NA_GRADE });
    throw erro;
  }
}

// INV-002-02: a turma só é criada com disciplina existente e professor com perfil Professor.
// SPEC-015: num curso que o coordenador coordena (AC-015-08) e com disciplina da grade dele (RB-18, AC-015-07).
export async function cadastrarTurma(entrada: Record<string, unknown>, coordenadorId: string) {
  const curso = await cursoDaOperacao(coordenadorId, entrada.cursoId);
  if (!curso.ok) return falha(curso.falha);
  const { cursoId } = curso;
  const validacao = validarTurma(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });

  const erros: ErrosDeCampo = {};
  if (!(await dados.buscarDisciplina(validacao.dados.disciplinaId))) erros.disciplinaId = "Disciplina inexistente.";
  else if (!disciplinaNaGrade(await dados.gradeDoCurso(cursoId), validacao.dados.disciplinaId)) erros.disciplinaId = MENSAGEM_DISCIPLINA_FORA_DA_GRADE;
  if (!(await dados.buscarProfessor(validacao.dados.professorId))) erros.professorId = "Professor inexistente.";
  if (Object.keys(erros).length > 0) return falha({ tipo: "invalido", erros });

  return sucesso(await dados.criarTurma(validacao.dados, cursoId));
}

// RF-03: cadastra o estudante já vinculado à turma (INV-002-01), só em turma sob responsabilidade do coordenador.
// SPEC-015 / AC-015-10: o estudante novo pertence ao curso da turma (RB-19).
export async function cadastrarEstudante(entrada: Record<string, unknown>, turmaId: string, coordenadorId: string) {
  const turma = await dados.turmaSobResponsabilidade(coordenadorId, turmaId);
  if (!turma) return falha({ tipo: "fora-do-escopo" });

  const validacao = validarEstudante(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  if (await dados.emailJaCadastrado(validacao.dados.email)) {
    return falha({ tipo: "conflito", erro: "E-mail já cadastrado." });
  }

  const { senha, ...resto } = validacao.dados;
  try {
    return sucesso(await dados.criarEstudanteMatriculado({ ...resto, senhaHash: await gerarHashSenha(senha) }, turma));
  } catch (erro) {
    // Corrida entre dois cadastros com o mesmo e-mail: a constraint única do banco decide.
    if ((erro as { code?: string }).code === "P2002") return falha({ tipo: "conflito", erro: "E-mail já cadastrado." });
    throw erro;
  }
}

// RF-17 (SPEC-010): o coordenador responsável troca o professor da turma por outro professor ativo.
export async function trocarProfessor(entrada: Record<string, unknown>, turmaId: string, coordenadorId: string) {
  if (!(await dados.turmaSobResponsabilidade(coordenadorId, turmaId))) return falha({ tipo: "fora-do-escopo" });
  const professorId = typeof entrada.professorId === "string" ? entrada.professorId.trim() : "";
  if (!professorId) return falha({ tipo: "invalido", erros: { professorId: "Escolha o novo professor." } });
  if (!(await dados.buscarProfessor(professorId))) {
    return falha({ tipo: "invalido", erros: { professorId: "Escolha um professor ativo." } });
  }
  return sucesso(await dados.trocarProfessorDaTurma(turmaId, professorId));
}

// RF-04 / INV-002-04: matrícula de estudante já cadastrado em outra turma (N:M).
// SPEC-015 / RB-19 (AC-015-11): só de estudante do mesmo curso da turma.
export async function matricularEstudante(entrada: Record<string, unknown>, turmaId: string, coordenadorId: string) {
  const turma = await dados.turmaSobResponsabilidade(coordenadorId, turmaId);
  if (!turma) return falha({ tipo: "fora-do-escopo" });

  const email = typeof entrada.email === "string" ? entrada.email.trim() : "";
  if (!email) return falha({ tipo: "invalido", erros: { email: "Informe o e-mail do estudante." } });

  const estudante = await dados.buscarEstudantePorEmail(email);
  if (!estudante) return falha({ tipo: "nao-encontrado", erro: "Estudante não encontrado." });
  if (!podeMatricular(estudante.cursoId, turma.cursoId)) return falha({ tipo: "conflito", erro: MENSAGEM_ESTUDANTE_DE_OUTRO_CURSO });

  await dados.matricular(estudante.id, turmaId);
  const { cursoId: _curso, ...publico } = estudante;
  return sucesso(publico);
}
