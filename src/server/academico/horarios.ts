// Grade horária, salas e vagas (SPEC-041, SPEC-038, RF-49, UC-38). Salas: secretaria (recurso secretaria).
// Horários e vagas: coordenador do curso da turma (escopo na query, ADR-003). Choques e capacidade (RB-39).
import { descreverHorario, motivoVagasAcimaDaSala, sobrepoe, validarHorario, validarSala, validarVagas, type Horario } from "@/domain/horarios";
import type { Sessao } from "@/server/auth/token";
import { auditar, turmaParaAuditoria } from "@/server/dados/auditoria";
import { MATRICULA_CURSANDO } from "@/server/dados/matriculas";
import { executarEmTransacao } from "@/server/dados/notas";
import { TURMA_DE_PERIODO_ABERTO } from "@/server/dados/periodos";
import { prisma } from "@/server/dados/prisma";
import type { Falha, Resultado } from "./cadastros";
import { travaDoPeriodo } from "./periodos";

const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const falha = <T>(f: Falha): Resultado<T> => ({ ok: false, falha: f });

// ---------------------------------------------------------------- Salas (secretaria)

export function listarSalas() {
  return prisma.sala.findMany({ select: { id: true, nome: true, capacidade: true, _count: { select: { horarios: true } } }, orderBy: { nome: "asc" } });
}

export async function salvarSala(entrada: Record<string, unknown>, administradorId: string, id?: string) {
  const validacao = validarSala(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  const { nome, capacidade } = validacao.dados;
  const anterior = id ? await prisma.sala.findUnique({ where: { id }, include: { horarios: { select: { turma: { select: { vagas: true, nome: true } } } } } }) : null;
  if (id && !anterior) return falha({ tipo: "nao-encontrado", erro: "Sala não encontrada." });
  // INV-041-02: reduzir a capacidade não pode deixar turma com mais vagas que a sala.
  const turmaAcima = anterior?.horarios.find((h) => h.turma.vagas !== null && h.turma.vagas > capacidade);
  if (turmaAcima) return falha({ tipo: "conflito", erro: `A ${turmaAcima.turma.nome} tem ${turmaAcima.turma.vagas} vagas e usa esta sala. Diminua as vagas antes.` });
  try {
    return sucesso(
      await executarEmTransacao(async (tx) => {
        const sala = id ? await tx.sala.update({ where: { id }, data: { nome, capacidade } }) : await tx.sala.create({ data: { nome, capacidade } });
        await auditar(tx, { autorId: administradorId, acao: "sala.alterada", descricao: `${id ? "Alterada" : "Cadastrada"}: ${nome} (${capacidade} lugares)`, antes: anterior ? { nome: anterior.nome, capacidade: anterior.capacidade } : null, depois: { nome, capacidade } });
        return { id: sala.id };
      }),
    );
  } catch (erro) {
    if ((erro as { code?: string }).code === "P2002") return falha({ tipo: "invalido", erros: { nome: "Já existe uma sala com este nome." } });
    throw erro;
  }
}

// AC-041-06: sala com horário não é excluída.
export async function excluirSala(id: string, administradorId: string) {
  const sala = await prisma.sala.findUnique({ where: { id }, select: { nome: true, capacidade: true, _count: { select: { horarios: true } } } });
  if (!sala) return falha({ tipo: "nao-encontrado", erro: "Sala não encontrada." });
  if (sala._count.horarios > 0) return falha({ tipo: "conflito", erro: `A ${sala.nome} está em ${sala._count.horarios} horário(s) de turma e não pode ser excluída.` });
  return sucesso(
    await executarEmTransacao(async (tx) => {
      await tx.sala.delete({ where: { id } });
      await auditar(tx, { autorId: administradorId, acao: "sala.alterada", descricao: `Excluída: ${sala.nome}`, antes: { nome: sala.nome, capacidade: sala.capacidade } });
      return { id };
    }),
  );
}

// ---------------------------------------------------------------- Horários e vagas (coordenação)

function turmaDoCoordenador(coordenadorId: string, turmaId: string) {
  return prisma.turma.findFirst({
    where: { id: turmaId, curso: { coordenadorId } },
    select: { id: true, nome: true, periodo: true, vagas: true, professorId: true, horarios: { select: { sala: { select: { capacidade: true } } } } },
  });
}

// RB-39: choque de sala ou de professor com outro horário do mesmo período.
export async function choqueDoHorario(turma: { id: string; periodo: string; professorId: string }, h: Horario & { salaId: string }) {
  const outros = await prisma.horarioTurma.findMany({
    where: { diaSemana: h.diaSemana, turmaId: { not: turma.id }, turma: { periodo: turma.periodo }, OR: [{ salaId: h.salaId }, { turma: { professorId: turma.professorId } }] },
    select: { diaSemana: true, inicio: true, fim: true, salaId: true, sala: { select: { nome: true } }, turma: { select: { nome: true, professorId: true, disciplina: { select: { nome: true } } } } },
  });
  const choque = outros.find((o) => sobrepoe(o, h));
  if (!choque) return null;
  const quem = `${choque.turma.nome} · ${choque.turma.disciplina.nome} (${descreverHorario(choque)})`;
  return choque.salaId === h.salaId ? `Choque de sala: a ${choque.sala.nome} já está com a ${quem}.` : `Choque de professor: o professor da turma já dá aula na ${quem}.`;
}

// AC-041-01 a AC-041-03 / AC-041-05.
export async function incluirHorario(turmaId: string, entrada: Record<string, unknown>, coordenadorId: string) {
  const turma = await turmaDoCoordenador(coordenadorId, turmaId);
  if (!turma) return falha({ tipo: "nao-encontrado", erro: "Turma não encontrada." });
  const trava = await travaDoPeriodo({ id: turmaId });
  if (trava) return falha(trava);
  const validacao = validarHorario(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  const h = validacao.dados;
  const sala = await prisma.sala.findUnique({ where: { id: h.salaId }, select: { nome: true, capacidade: true } });
  if (!sala) return falha({ tipo: "invalido", erros: { salaId: "Sala inexistente." } });
  const proprio = await prisma.horarioTurma.findMany({ where: { turmaId }, select: { diaSemana: true, inicio: true, fim: true } });
  if (proprio.some((o) => sobrepoe(o, h))) return falha({ tipo: "conflito", erro: "A turma já tem aula nesse horário." });
  const choque = await choqueDoHorario(turma, h);
  if (choque) return falha({ tipo: "conflito", erro: choque });
  const vagas = motivoVagasAcimaDaSala(turma.vagas, [sala.capacidade]);
  if (vagas) return falha({ tipo: "conflito", erro: `${vagas} Diminua as vagas ou escolha uma sala maior.` });
  return sucesso(
    await executarEmTransacao(async (tx) => {
      const horario = await tx.horarioTurma.create({ data: { turmaId, ...h } });
      const contexto = await turmaParaAuditoria(turmaId, tx);
      await auditar(tx, { autorId: coordenadorId, acao: "turma.horario", ...contexto, descricao: `${contexto.rotulo}: incluído ${descreverHorario(h)}, ${sala.nome}`, depois: { ...h, sala: sala.nome } });
      return { id: horario.id };
    }),
  );
}

export async function excluirHorario(horarioId: string, coordenadorId: string) {
  const horario = await prisma.horarioTurma.findFirst({ where: { id: horarioId, turma: { curso: { coordenadorId } } }, select: { turmaId: true, diaSemana: true, inicio: true, fim: true, sala: { select: { nome: true } } } });
  if (!horario) return falha({ tipo: "nao-encontrado", erro: "Horário não encontrado." });
  const trava = await travaDoPeriodo({ id: horario.turmaId });
  if (trava) return falha(trava);
  return sucesso(
    await executarEmTransacao(async (tx) => {
      await tx.horarioTurma.delete({ where: { id: horarioId } });
      const contexto = await turmaParaAuditoria(horario.turmaId, tx);
      await auditar(tx, { autorId: coordenadorId, acao: "turma.horario", ...contexto, descricao: `${contexto.rotulo}: excluído ${descreverHorario(horario)}, ${horario.sala.nome}` });
      return { id: horarioId };
    }),
  );
}

// SPEC-038: vagas da turma (vazio = sem limite), sem passar da menor sala nem ficar abaixo das matrículas cursando.
export async function definirVagas(turmaId: string, entrada: Record<string, unknown>, coordenadorId: string) {
  const turma = await turmaDoCoordenador(coordenadorId, turmaId);
  if (!turma) return falha({ tipo: "nao-encontrado", erro: "Turma não encontrada." });
  const trava = await travaDoPeriodo({ id: turmaId });
  if (trava) return falha(trava);
  const lida = validarVagas(entrada.vagas);
  if (!lida.ok) return falha({ tipo: "invalido", erros: { vagas: lida.erro } });
  const acima = motivoVagasAcimaDaSala(lida.vagas, turma.horarios.map((h) => h.sala.capacidade));
  if (acima) return falha({ tipo: "invalido", erros: { vagas: acima } });
  const cursando = await prisma.matricula.count({ where: { turmaId, ...MATRICULA_CURSANDO } });
  if (lida.vagas !== null && lida.vagas < cursando) return falha({ tipo: "invalido", erros: { vagas: `A turma já tem ${cursando} estudante(s) cursando.` } });
  return sucesso(
    await executarEmTransacao(async (tx) => {
      await tx.turma.update({ where: { id: turmaId }, data: { vagas: lida.vagas } });
      const contexto = await turmaParaAuditoria(turmaId, tx);
      await auditar(tx, { autorId: coordenadorId, acao: "turma.vagas", ...contexto, descricao: `${contexto.rotulo}: vagas ${turma.vagas ?? "sem limite"} → ${lida.vagas ?? "sem limite"}`, antes: { vagas: turma.vagas }, depois: { vagas: lida.vagas } });
      return { vagas: lida.vagas };
    }),
  );
}

export async function horariosDaTurma(turmaId: string) {
  return prisma.horarioTurma.findMany({ where: { turmaId }, select: { id: true, diaSemana: true, inicio: true, fim: true, sala: { select: { id: true, nome: true, capacidade: true } } }, orderBy: [{ diaSemana: "asc" }, { inicio: "asc" }] });
}

// AC-041-04: grade da semana do estudante (turmas cursando) ou do professor (turmas que leciona), de períodos abertos.
export async function gradeDaSemana(sessao: Sessao) {
  const turma =
    sessao.perfil === "Estudante"
      ? { matriculas: { some: { estudanteId: sessao.usuarioId, ...MATRICULA_CURSANDO } }, ...TURMA_DE_PERIODO_ABERTO }
      : sessao.perfil === "Professor"
        ? { professorId: sessao.usuarioId, ...TURMA_DE_PERIODO_ABERTO }
        : null;
  if (!turma) return [];
  const horarios = await prisma.horarioTurma.findMany({
    where: { turma },
    select: { id: true, diaSemana: true, inicio: true, fim: true, sala: { select: { nome: true } }, turma: { select: { nome: true, disciplina: { select: { nome: true } } } } },
    orderBy: [{ diaSemana: "asc" }, { inicio: "asc" }],
  });
  return horarios.map((h) => ({ id: h.id, diaSemana: h.diaSemana, inicio: h.inicio, fim: h.fim, sala: h.sala.nome, turma: h.turma.nome, disciplina: h.turma.disciplina.nome }));
}
