// Casos de uso da correção de cadastros (SPEC-026, RF-35, UC-25, RB-32). Cada caso confere o escopo na query
// (ADR-003: fora do escopo e inexistente dão o mesmo 404), a trava do período (RB-20), recalcula o que depende
// da alteração e grava a auditoria na mesma transação (RB-22). Aulas: src/server/academico/chamada.ts.
import { validarAtividade } from "@/domain/atividades";
import { dataBR, numeroBR } from "@/domain/auditoria";
import {
  motivoDisciplinaCompartilhada,
  motivoParaNaoExcluirAtividade,
  motivoParaNaoExcluirAvaliacao,
  motivoParaNaoExcluirDisciplina,
  motivoParaNaoExcluirTurma,
  motivoParaNaoTirarDaTurma,
  validarEdicaoConta,
  validarNomeTurma,
} from "@/domain/correcoes";
import { validarDisciplina } from "@/domain/estrutura-academica";
import { ROTULO_TIPO, validarAvaliacao, type TipoAvaliacao } from "@/domain/registro-notas";
import { deData, paraData } from "@/server/dados/atividades";
import { auditar, turmaParaAuditoria } from "@/server/dados/auditoria";
import type { ClienteBanco } from "@/server/dados/indicadores";
import { MATRICULA_CURSANDO } from "@/server/dados/matriculas";
import { executarEmTransacao } from "@/server/dados/notas";
import { prisma } from "@/server/dados/prisma";
import type { Falha, Resultado } from "./cadastros";
import { recalcularIndicador } from "./indicador";
import { travaDoPeriodo } from "./periodos";

const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const falha = <T>(f: Falha): Resultado<T> => ({ ok: false, falha: f });
const naoEncontrado = (o: string) => falha<never>({ tipo: "nao-encontrado", erro: `${o} não encontrada.` });
const conflito = (erro: string) => falha<never>({ tipo: "conflito", erro });
const ehUnico = (erro: unknown) => (erro as { code?: string }).code === "P2002";

// ---------------------------------------------------------------- Administrador: contas

// AC-026-01 / AC-026-02: nome e e-mail (único); o perfil não muda (INV-026-04).
export async function editarConta(contaId: string, entrada: Record<string, unknown>, administradorId: string) {
  const validacao = validarEdicaoConta(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  const antes = await prisma.usuario.findUnique({ where: { id: contaId }, select: { nome: true, email: true, perfil: true } });
  if (!antes) return falha({ tipo: "nao-encontrado", erro: "Conta não encontrada." });
  const { nome, email } = validacao.dados;
  const emUso = await prisma.usuario.findFirst({ where: { email: { equals: email, mode: "insensitive" }, id: { not: contaId } }, select: { id: true } });
  const repetido = falha({ tipo: "invalido", erros: { email: "Já existe uma conta com este e-mail." } });
  if (emUso) return repetido;
  try {
    return sucesso(
      await executarEmTransacao(async (tx) => {
        const conta = await tx.usuario.update({ where: { id: contaId }, data: { nome, email }, select: { id: true, nome: true, email: true, perfil: true } });
        await auditar(tx, {
          autorId: administradorId,
          acao: "conta.editada",
          descricao: `${antes.nome} (${antes.perfil})${antes.nome !== nome ? ` → ${nome}` : ""}${antes.email !== email ? `; e-mail ${antes.email} → ${email}` : ""}`,
          antes: { nome: antes.nome, email: antes.email },
          depois: { nome, email },
        });
        return conta;
      }),
    );
  } catch (erro) {
    if (ehUnico(erro)) return repetido;
    throw erro;
  }
}

// ---------------------------------------------------------------- Coordenador: disciplinas, turmas e matrículas

// Disciplina na grade de algum curso do coordenador, com os cursos de outros coordenadores que também a têm.
async function disciplinaDoCoordenador(coordenadorId: string, disciplinaId: string) {
  const disciplina = await prisma.disciplina.findFirst({
    where: { id: disciplinaId, cursos: { some: { curso: { coordenadorId } } } },
    select: { id: true, nome: true, cargaHoraria: true, cursos: { select: { curso: { select: { id: true, nome: true, coordenadorId: true } } } }, _count: { select: { turmas: true } } },
  });
  if (!disciplina) return null;
  const meus = disciplina.cursos.filter((c) => c.curso.coordenadorId === coordenadorId).map((c) => c.curso.id);
  const deOutros = disciplina.cursos.filter((c) => c.curso.coordenadorId !== coordenadorId).map((c) => c.curso.nome);
  return { ...disciplina, cursoId: meus[0], deOutros };
}

// AC-026-11: só edita se todas as grades em que ela está forem de cursos dele.
export async function editarDisciplina(disciplinaId: string, entrada: Record<string, unknown>, coordenadorId: string) {
  const disciplina = await disciplinaDoCoordenador(coordenadorId, disciplinaId);
  if (!disciplina) return naoEncontrado("Disciplina");
  const compartilhada = motivoDisciplinaCompartilhada(disciplina.deOutros);
  if (compartilhada) return conflito(compartilhada);
  const validacao = validarDisciplina(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  const { nome, cargaHoraria } = validacao.dados;
  return sucesso(
    await executarEmTransacao(async (tx) => {
      const nova = await tx.disciplina.update({ where: { id: disciplinaId }, data: { nome, cargaHoraria }, select: { id: true, nome: true, cargaHoraria: true } });
      await auditar(tx, {
        autorId: coordenadorId,
        acao: "disciplina.editada",
        cursoId: disciplina.cursoId,
        descricao: `${disciplina.nome} (${disciplina.cargaHoraria} h) → ${nome} (${cargaHoraria} h)`,
        antes: { nome: disciplina.nome, cargaHoraria: disciplina.cargaHoraria },
        depois: { nome, cargaHoraria },
      });
      return nova;
    }),
  );
}

// AC-026-10: disciplina sem turma; sai junto das grades.
export async function excluirDisciplina(disciplinaId: string, coordenadorId: string) {
  const disciplina = await disciplinaDoCoordenador(coordenadorId, disciplinaId);
  if (!disciplina) return naoEncontrado("Disciplina");
  const motivo = motivoDisciplinaCompartilhada(disciplina.deOutros) ?? motivoParaNaoExcluirDisciplina(disciplina._count.turmas);
  if (motivo) return conflito(motivo);
  return sucesso(
    await executarEmTransacao(async (tx) => {
      await tx.cursoDisciplina.deleteMany({ where: { disciplinaId } });
      await tx.disciplina.delete({ where: { id: disciplinaId } });
      await auditar(tx, { autorId: coordenadorId, acao: "disciplina.excluida", cursoId: disciplina.cursoId, descricao: `${disciplina.nome} (${disciplina.cargaHoraria} h)`, antes: { nome: disciplina.nome, cargaHoraria: disciplina.cargaHoraria } });
      return { id: disciplinaId };
    }),
  );
}

function turmaDoCoordenador(coordenadorId: string, turmaId: string) {
  return prisma.turma.findFirst({
    where: { id: turmaId, curso: { coordenadorId } },
    select: { id: true, nome: true, cursoId: true, _count: { select: { matriculas: true, avaliacoes: true, aulas: true, atividades: true } } },
  });
}

export async function editarTurma(turmaId: string, entrada: Record<string, unknown>, coordenadorId: string) {
  const turma = await turmaDoCoordenador(coordenadorId, turmaId);
  if (!turma) return naoEncontrado("Turma");
  const trava = await travaDoPeriodo({ id: turmaId });
  if (trava) return falha(trava);
  const validacao = validarNomeTurma(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  const { nome } = validacao.dados;
  return sucesso(
    await executarEmTransacao(async (tx) => {
      const nova = await tx.turma.update({ where: { id: turmaId }, data: { nome }, select: { id: true, nome: true } });
      const contexto = await turmaParaAuditoria(turmaId, tx);
      await auditar(tx, { autorId: coordenadorId, acao: "turma.editada", ...contexto, descricao: `${turma.nome} → ${contexto.rotulo}`, antes: { nome: turma.nome }, depois: { nome } });
      return nova;
    }),
  );
}

export async function excluirTurma(turmaId: string, coordenadorId: string) {
  const turma = await turmaDoCoordenador(coordenadorId, turmaId);
  if (!turma) return naoEncontrado("Turma");
  const trava = await travaDoPeriodo({ id: turmaId });
  if (trava) return falha(trava);
  const motivo = motivoParaNaoExcluirTurma(turma._count);
  if (motivo) return conflito(motivo);
  return sucesso(
    await executarEmTransacao(async (tx) => {
      const contexto = await turmaParaAuditoria(turmaId, tx);
      // O registro de auditoria não guarda a turma (ela deixa de existir), só o curso e o rótulo.
      await auditar(tx, { autorId: coordenadorId, acao: "turma.excluida", cursoId: turma.cursoId, descricao: contexto.rotulo, antes: { nome: turma.nome } });
      await tx.turma.delete({ where: { id: turmaId } });
      return { id: turmaId };
    }),
  );
}

// AC-026-08 / AC-026-09: tirar da turma só quem não tem nota, presença, entrega nem plano nela.
export async function tirarDaTurma(turmaId: string, estudanteId: string, coordenadorId: string) {
  const matricula = await prisma.matricula.findFirst({
    where: { turmaId, estudanteId, turma: { curso: { coordenadorId } } },
    select: { estudante: { select: { nome: true } } },
  });
  if (!matricula) return falha({ tipo: "nao-encontrado", erro: "Matrícula não encontrada." });
  const trava = await travaDoPeriodo({ id: turmaId });
  if (trava) return falha(trava);
  const [notas, presencas, entregas, planos] = await Promise.all([
    prisma.nota.count({ where: { estudanteId, avaliacao: { turmaId } } }),
    prisma.presenca.count({ where: { estudanteId, aula: { turmaId } } }),
    prisma.entrega.count({ where: { estudanteId, atividade: { turmaId } } }),
    prisma.planoRecuperacao.count({ where: { estudanteId, turmaId } }),
  ]);
  const motivo = motivoParaNaoTirarDaTurma({ notas, presencas, entregas, planos });
  if (motivo) return conflito(motivo);
  return sucesso(
    await executarEmTransacao(async (tx) => {
      await tx.matricula.delete({ where: { estudanteId_turmaId: { estudanteId, turmaId } } });
      // Sem nota nem presença, o indicador e a frequência são vazios; saem junto.
      await tx.indicadorAcademico.deleteMany({ where: { estudanteId, turmaId } });
      await tx.frequencia.deleteMany({ where: { estudanteId, turmaId } });
      const contexto = await turmaParaAuditoria(turmaId, tx);
      await auditar(tx, { autorId: coordenadorId, acao: "matricula.excluida", ...contexto, descricao: `${matricula.estudante.nome} tirado(a) de ${contexto.rotulo} (matrícula feita por engano)` });
      return { estudanteId, turmaId };
    }),
  );
}

// ---------------------------------------------------------------- Professor: avaliações e atividades

function avaliacaoDoProfessor(professorId: string, avaliacaoId: string) {
  return prisma.avaliacao.findFirst({
    where: { id: avaliacaoId, turma: { professorId } },
    select: { id: true, nome: true, peso: true, data: true, tipo: true, turmaId: true, _count: { select: { notas: true } } },
  });
}

// INV-026-02: depois de mudar peso ou tipo, a média de todos os estudantes cursando é recalculada.
async function recalcularTurma(turmaId: string, tx: ClienteBanco) {
  const matriculas = await tx.matricula.findMany({ where: { turmaId, ...MATRICULA_CURSANDO }, select: { estudanteId: true } });
  for (const { estudanteId } of matriculas) await recalcularIndicador(estudanteId, turmaId, tx);
}

// SPEC-029: com notas, o tipo só muda entre Prova e Trabalho (substitutiva e exame têm regra própria).
function motivoParaNaoMudarTipo(atual: TipoAvaliacao, novo: TipoAvaliacao, notas: number): string | null {
  if (atual === novo || notas === 0) return null;
  const comuns = (t: TipoAvaliacao) => t === "Prova" || t === "Trabalho";
  return comuns(atual) && comuns(novo) ? null : `A avaliação já tem notas: o tipo só pode mudar entre Prova e Trabalho.`;
}

// AC-026-03: editar nome, peso, data e tipo; peso e tipo recalculam a média da turma.
export async function editarAvaliacao(avaliacaoId: string, entrada: Record<string, unknown>, professorId: string) {
  const avaliacao = await avaliacaoDoProfessor(professorId, avaliacaoId);
  if (!avaliacao) return naoEncontrado("Avaliação");
  const trava = await travaDoPeriodo({ id: avaliacao.turmaId });
  if (trava) return falha(trava);
  const validacao = validarAvaliacao({ tipo: avaliacao.tipo, ...entrada });
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  const novo = validacao.dados;
  const motivoTipo = motivoParaNaoMudarTipo(avaliacao.tipo, novo.tipo, avaliacao._count.notas);
  if (motivoTipo) return conflito(motivoTipo);
  try {
    return sucesso(
      await executarEmTransacao(async (tx) => {
        const salva = await tx.avaliacao.update({ where: { id: avaliacaoId }, data: novo, select: { id: true, nome: true, peso: true, data: true, tipo: true } });
        if (avaliacao.peso !== novo.peso || avaliacao.tipo !== novo.tipo) await recalcularTurma(avaliacao.turmaId, tx);
        const contexto = await turmaParaAuditoria(avaliacao.turmaId, tx);
        const descreve = (a: { nome: string; peso: number; tipo: TipoAvaliacao; data: Date }) => `${a.nome} (${ROTULO_TIPO[a.tipo]}, peso ${numeroBR(a.peso)}, ${dataBR(deData(a.data))})`;
        await auditar(tx, {
          autorId: professorId,
          acao: "avaliacao.editada",
          ...contexto,
          descricao: `${contexto.rotulo}: ${descreve(avaliacao)} → ${descreve(novo)}`,
          antes: { nome: avaliacao.nome, peso: avaliacao.peso, tipo: avaliacao.tipo, data: deData(avaliacao.data) },
          depois: { nome: novo.nome, peso: novo.peso, tipo: novo.tipo, data: deData(novo.data) },
        });
        return salva;
      }),
    );
  } catch (erro) {
    if (ehUnico(erro)) return conflito(`A turma já tem uma avaliação do tipo ${ROTULO_TIPO[novo.tipo]}.`);
    throw erro;
  }
}

// AC-026-04 / AC-026-05: só sem nota (o histórico de notas é imutável, RB-16).
export async function excluirAvaliacao(avaliacaoId: string, professorId: string) {
  const avaliacao = await avaliacaoDoProfessor(professorId, avaliacaoId);
  if (!avaliacao) return naoEncontrado("Avaliação");
  const trava = await travaDoPeriodo({ id: avaliacao.turmaId });
  if (trava) return falha(trava);
  const motivo = motivoParaNaoExcluirAvaliacao(avaliacao._count.notas);
  if (motivo) return conflito(motivo);
  return sucesso(
    await executarEmTransacao(async (tx) => {
      await tx.avaliacao.delete({ where: { id: avaliacaoId } });
      const contexto = await turmaParaAuditoria(avaliacao.turmaId, tx);
      await auditar(tx, { autorId: professorId, acao: "avaliacao.excluida", ...contexto, descricao: `${avaliacao.nome} (${ROTULO_TIPO[avaliacao.tipo]}) em ${contexto.rotulo}`, antes: { nome: avaliacao.nome, peso: avaliacao.peso, tipo: avaliacao.tipo } });
      return { id: avaliacaoId };
    }),
  );
}

function atividadeDoProfessor(professorId: string, atividadeId: string) {
  return prisma.atividade.findFirst({
    where: { id: atividadeId, turma: { professorId } },
    select: { id: true, descricao: true, prazo: true, turmaId: true, _count: { select: { entregas: true } } },
  });
}

// AC-026-14: descrição e prazo.
export async function editarAtividade(atividadeId: string, entrada: Record<string, unknown>, professorId: string) {
  const atividade = await atividadeDoProfessor(professorId, atividadeId);
  if (!atividade) return naoEncontrado("Atividade");
  const trava = await travaDoPeriodo({ id: atividade.turmaId });
  if (trava) return falha(trava);
  const validacao = validarAtividade(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  const { descricao, prazo } = validacao.dados;
  return sucesso(
    await executarEmTransacao(async (tx) => {
      const salva = await tx.atividade.update({ where: { id: atividadeId }, data: { descricao, prazo: paraData(prazo) }, select: { id: true, descricao: true, prazo: true } });
      const contexto = await turmaParaAuditoria(atividade.turmaId, tx);
      await auditar(tx, {
        autorId: professorId,
        acao: "atividade.editada",
        ...contexto,
        descricao: `${contexto.rotulo}: ${atividade.descricao} (prazo ${dataBR(deData(atividade.prazo))}) → ${descricao} (prazo ${dataBR(prazo)})`,
        antes: { descricao: atividade.descricao, prazo: deData(atividade.prazo) },
        depois: { descricao, prazo },
      });
      return { ...salva, prazo };
    }),
  );
}

export async function excluirAtividade(atividadeId: string, professorId: string) {
  const atividade = await atividadeDoProfessor(professorId, atividadeId);
  if (!atividade) return naoEncontrado("Atividade");
  const trava = await travaDoPeriodo({ id: atividade.turmaId });
  if (trava) return falha(trava);
  const motivo = motivoParaNaoExcluirAtividade(atividade._count.entregas);
  if (motivo) return conflito(motivo);
  return sucesso(
    await executarEmTransacao(async (tx) => {
      await tx.atividade.delete({ where: { id: atividadeId } });
      // Notificações de prazo da atividade apontam para ela: saem junto.
      await tx.notificacao.deleteMany({ where: { tipo: "Prazo", chave: { contains: atividadeId } } });
      const contexto = await turmaParaAuditoria(atividade.turmaId, tx);
      await auditar(tx, { autorId: professorId, acao: "atividade.excluida", ...contexto, descricao: `${atividade.descricao} (prazo ${dataBR(deData(atividade.prazo))}) em ${contexto.rotulo}`, antes: { descricao: atividade.descricao, prazo: deData(atividade.prazo) } });
      return { id: atividadeId };
    }),
  );
}
