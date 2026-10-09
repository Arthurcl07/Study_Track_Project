// Casos de uso de cadastro da SPEC-002 (RF-03, RF-04). Quem pode: Coordenador (OPEN-001),
// verificado nas rotas; aqui ficam as regras de vínculo e escopo da turma.
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

export async function cadastrarDisciplina(entrada: Record<string, unknown>) {
  const validacao = validarDisciplina(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  return sucesso(await dados.criarDisciplina(validacao.dados));
}

// INV-002-02: a turma só é criada com disciplina existente e professor com perfil Professor.
export async function cadastrarTurma(entrada: Record<string, unknown>, coordenadorId: string) {
  const validacao = validarTurma(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });

  const erros: ErrosDeCampo = {};
  if (!(await dados.buscarDisciplina(validacao.dados.disciplinaId))) erros.disciplinaId = "Disciplina inexistente.";
  if (!(await dados.buscarProfessor(validacao.dados.professorId))) erros.professorId = "Professor inexistente.";
  if (Object.keys(erros).length > 0) return falha({ tipo: "invalido", erros });

  return sucesso(await dados.criarTurma(validacao.dados, coordenadorId));
}

// RF-03: cadastra o estudante já vinculado à turma (INV-002-01), só em turma sob responsabilidade do coordenador.
export async function cadastrarEstudante(entrada: Record<string, unknown>, turmaId: string, coordenadorId: string) {
  if (!(await dados.turmaSobResponsabilidade(coordenadorId, turmaId))) return falha({ tipo: "fora-do-escopo" });

  const validacao = validarEstudante(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  if (await dados.emailJaCadastrado(validacao.dados.email)) {
    return falha({ tipo: "conflito", erro: "E-mail já cadastrado." });
  }

  const { senha, ...resto } = validacao.dados;
  try {
    return sucesso(await dados.criarEstudanteMatriculado({ ...resto, senhaHash: await gerarHashSenha(senha) }, turmaId));
  } catch (erro) {
    // Corrida entre dois cadastros com o mesmo e-mail: a constraint única do banco decide.
    if ((erro as { code?: string }).code === "P2002") return falha({ tipo: "conflito", erro: "E-mail já cadastrado." });
    throw erro;
  }
}

// RF-04 / INV-002-04: matrícula de estudante já cadastrado em outra turma (N:M).
export async function matricularEstudante(entrada: Record<string, unknown>, turmaId: string, coordenadorId: string) {
  if (!(await dados.turmaSobResponsabilidade(coordenadorId, turmaId))) return falha({ tipo: "fora-do-escopo" });

  const email = typeof entrada.email === "string" ? entrada.email.trim() : "";
  if (!email) return falha({ tipo: "invalido", erros: { email: "Informe o e-mail do estudante." } });

  const estudante = await dados.buscarEstudantePorEmail(email);
  if (!estudante) return falha({ tipo: "nao-encontrado", erro: "Estudante não encontrado." });

  await dados.matricular(estudante.id, turmaId);
  return sucesso(estudante);
}
