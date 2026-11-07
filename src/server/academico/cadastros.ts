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
import { MENSAGEM_PERIODO_NAO_ABERTO } from "@/domain/periodos";
import { gerarHashSenha } from "@/server/auth/senha";
import { periodoPorNome } from "@/server/dados/periodos";
import { travaDoPeriodo } from "./periodos";
import { auditar, nomeDoUsuario, turmaParaAuditoria } from "@/server/dados/auditoria";
import * as dados from "@/server/dados/estrutura";
import { executarEmTransacao } from "@/server/dados/notas";
import { prisma } from "@/server/dados/prisma";
import { MENSAGEM_ESTUDANTE_NAO_ATIVO } from "@/domain/secretaria";

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
  return sucesso(
    await executarEmTransacao(async (tx) => {
      const disciplina = await dados.criarDisciplina(validacao.dados, curso.cursoId, tx);
      await auditar(tx, { autorId: coordenadorId, acao: "disciplina.criada", cursoId: curso.cursoId, descricao: `${disciplina.nome} (${disciplina.cargaHoraria} h)`, depois: validacao.dados });
      return disciplina;
    }),
  );
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
    return sucesso(
      await executarEmTransacao(async (tx) => {
        const { disciplina, ...grade } = await dados.adicionarDisciplinaAGrade(cursoId, disciplinaId, tx);
        await auditar(tx, { autorId: coordenadorId, acao: "grade.adicionada", cursoId, descricao: disciplina.nome });
        return grade;
      }),
    );
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
  // SPEC-017 / INV-017-04: nova turma só em período letivo aberto.
  if ((await periodoPorNome(validacao.dados.periodo))?.status !== "Aberto") erros.periodo = MENSAGEM_PERIODO_NAO_ABERTO;
  if (Object.keys(erros).length > 0) return falha({ tipo: "invalido", erros });

  return sucesso(
    await executarEmTransacao(async (tx) => {
      const turma = await dados.criarTurma(validacao.dados, cursoId, tx);
      await auditar(tx, {
        autorId: coordenadorId,
        acao: "turma.criada",
        cursoId,
        turmaId: turma.id,
        descricao: `${turma.nome} · ${turma.disciplina.nome} (${turma.periodo}), professor ${turma.professor.nome}`,
      });
      return turma;
    }),
  );
}

// RF-03: cadastra o estudante já vinculado à turma (INV-002-01), só em turma sob responsabilidade do coordenador.
// SPEC-015 / AC-015-10: o estudante novo pertence ao curso da turma (RB-19).
export async function cadastrarEstudante(entrada: Record<string, unknown>, turmaId: string, coordenadorId: string) {
  const turma = await dados.turmaSobResponsabilidade(coordenadorId, turmaId);
  if (!turma) return falha({ tipo: "fora-do-escopo" });
  const trava = await travaDoPeriodo({ id: turmaId });
  if (trava) return falha(trava);

  const validacao = validarEstudante(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  if (await dados.emailJaCadastrado(validacao.dados.email)) {
    return falha({ tipo: "conflito", erro: "E-mail já cadastrado." });
  }

  const { senha, ...resto } = validacao.dados;
  try {
    const senhaHash = await gerarHashSenha(senha);
    return sucesso(
      await executarEmTransacao(async (tx) => {
        const estudante = await dados.criarEstudanteMatriculado({ ...resto, senhaHash }, turma, tx);
        const contexto = await turmaParaAuditoria(turmaId, tx);
        await auditar(tx, { autorId: coordenadorId, acao: "estudante.cadastrado", ...contexto, descricao: `${estudante.nome} (${estudante.email}) em ${contexto.rotulo}, com senha provisória`, depois: estudante });
        return estudante;
      }),
    );
  } catch (erro) {
    // Corrida entre dois cadastros com o mesmo e-mail: a constraint única do banco decide.
    if ((erro as { code?: string }).code === "P2002") return falha({ tipo: "conflito", erro: "E-mail já cadastrado." });
    throw erro;
  }
}

// RF-17 (SPEC-010): o coordenador responsável troca o professor da turma por outro professor ativo.
export async function trocarProfessor(entrada: Record<string, unknown>, turmaId: string, coordenadorId: string) {
  if (!(await dados.turmaSobResponsabilidade(coordenadorId, turmaId))) return falha({ tipo: "fora-do-escopo" });
  const trava = await travaDoPeriodo({ id: turmaId });
  if (trava) return falha(trava);
  const professorId = typeof entrada.professorId === "string" ? entrada.professorId.trim() : "";
  if (!professorId) return falha({ tipo: "invalido", erros: { professorId: "Escolha o novo professor." } });
  if (!(await dados.buscarProfessor(professorId))) {
    return falha({ tipo: "invalido", erros: { professorId: "Escolha um professor ativo." } });
  }
  return sucesso(
    await executarEmTransacao(async (tx) => {
      const anterior = await tx.turma.findUniqueOrThrow({ where: { id: turmaId }, select: { professor: { select: { nome: true } } } });
      const turma = await dados.trocarProfessorDaTurma(turmaId, professorId, tx);
      const contexto = await turmaParaAuditoria(turmaId, tx);
      await auditar(tx, {
        autorId: coordenadorId,
        acao: "turma.professor",
        ...contexto,
        descricao: `${contexto.rotulo}: ${anterior.professor.nome} → ${turma.professor.nome}`,
        antes: { professor: anterior.professor.nome },
        depois: { professor: turma.professor.nome },
      });
      return turma;
    }),
  );
}

// RF-04 / INV-002-04: matrícula de estudante já cadastrado em outra turma (N:M).
// SPEC-015 / RB-19 (AC-015-11): só de estudante do mesmo curso da turma.
export async function matricularEstudante(entrada: Record<string, unknown>, turmaId: string, coordenadorId: string) {
  const turma = await dados.turmaSobResponsabilidade(coordenadorId, turmaId);
  if (!turma) return falha({ tipo: "fora-do-escopo" });
  const trava = await travaDoPeriodo({ id: turmaId });
  if (trava) return falha(trava);

  const email = typeof entrada.email === "string" ? entrada.email.trim() : "";
  if (!email) return falha({ tipo: "invalido", erros: { email: "Informe o e-mail do estudante." } });

  const estudante = await dados.buscarEstudantePorEmail(email);
  if (!estudante) return falha({ tipo: "nao-encontrado", erro: "Estudante não encontrado." });
  if (!podeMatricular(estudante.cursoId, turma.cursoId)) return falha({ tipo: "conflito", erro: MENSAGEM_ESTUDANTE_DE_OUTRO_CURSO });
  // SPEC-031 / RB-30 (AC-031-04): só estudante Ativo no curso é matriculado.
  const ficha = await prisma.fichaEstudante.findUnique({ where: { estudanteId: estudante.id }, select: { situacaoCurso: true } });
  if (ficha && ficha.situacaoCurso !== "Ativo") return falha({ tipo: "conflito", erro: MENSAGEM_ESTUDANTE_NAO_ATIVO });

  await executarEmTransacao(async (tx) => {
    // Já matriculado: nada muda e nada é registrado (INV-002-04).
    const existente = await tx.matricula.findUnique({ where: { estudanteId_turmaId: { estudanteId: estudante.id, turmaId } } });
    if (existente) return;
    await dados.matricular(estudante.id, turmaId, tx);
    const contexto = await turmaParaAuditoria(turmaId, tx);
    await auditar(tx, { autorId: coordenadorId, acao: "estudante.matriculado", ...contexto, descricao: `${estudante.nome} em ${contexto.rotulo}` });
  });
  const { cursoId: _curso, ...publico } = estudante;
  return sucesso(publico);
}
