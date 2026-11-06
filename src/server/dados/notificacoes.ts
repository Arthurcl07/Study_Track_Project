// Acesso a dados das notificações (SPEC-022, RF-31, RB-23). Gravação dentro da transação do evento (INV-022-04);
// consulta e leitura sempre filtradas pelo destinatário na própria query (ADR-003, INV-022-01).
import { hojeEmBrasilia } from "@/domain/atividades";
import {
  notificacaoPlano,
  notificacaoPrazo,
  notificacaoRiscoEstudante,
  notificacaoRiscoProfessor,
  prazoPedeAviso,
  type NovaNotificacao,
} from "@/domain/notificacoes";
import { deData } from "./atividades";
import type { ClienteBanco } from "./indicadores";
import { prisma } from "./prisma";

export function notificar(db: ClienteBanco, usuarioId: string, n: NovaNotificacao) {
  return db.notificacao.create({ data: { usuarioId, ...n }, select: { id: true } });
}

// AC-022-01: estudante e professor da turma, quando a situação muda para Risco.
export async function notificarEntradaEmRisco(db: ClienteBanco, estudanteId: string, turmaId: string, media: number | null, frequencia: number | null) {
  const turma = await db.turma.findUniqueOrThrow({
    where: { id: turmaId },
    select: { nome: true, professorId: true, professor: { select: { nome: true } }, disciplina: { select: { nome: true } } },
  });
  const estudante = await db.usuario.findUniqueOrThrow({ where: { id: estudanteId }, select: { nome: true } });
  await notificar(db, estudanteId, notificacaoRiscoEstudante(turma.disciplina.nome, turma.professor.nome, media, frequencia));
  await notificar(db, turma.professorId, notificacaoRiscoProfessor(estudante.nome, `${turma.nome} · ${turma.disciplina.nome}`, turmaId, media, frequencia));
}

export async function notificarPlano(db: ClienteBanco, estudanteId: string, turmaId: string, itens: number) {
  const turma = await db.turma.findUniqueOrThrow({ where: { id: turmaId }, select: { professor: { select: { nome: true } }, disciplina: { select: { nome: true } } } });
  await notificar(db, estudanteId, notificacaoPlano(turma.disciplina.nome, itens, turma.professor.nome));
}

// RF-31 / INV-022-03: prazos de hoje até 2 dias, sem entrega, em turmas de período aberto; uma por atividade
// (a chave única descarta as repetidas).
export async function gerarNotificacoesDePrazo(estudanteId: string, hoje = hojeEmBrasilia()) {
  const ate = new Date(`${hoje}T00:00:00Z`);
  ate.setUTCDate(ate.getUTCDate() + 2);
  const atividades = await prisma.atividade.findMany({
    where: {
      prazo: { gte: new Date(`${hoje}T00:00:00Z`), lte: ate },
      turma: { matriculas: { some: { estudanteId } }, periodoLetivo: { status: "Aberto" } },
    },
    select: { id: true, descricao: true, prazo: true, turma: { select: { disciplina: { select: { nome: true } } } }, entregas: { where: { estudanteId }, select: { id: true } } },
  });
  const novas = atividades
    .filter((a) => prazoPedeAviso(deData(a.prazo), hoje, a.entregas.length > 0))
    .map((a) => ({ usuarioId: estudanteId, ...notificacaoPrazo(a.id, estudanteId, a.descricao, a.turma.disciplina.nome, deData(a.prazo), hoje) }));
  if (novas.length > 0) await prisma.notificacao.createMany({ data: novas, skipDuplicates: true });
}

export function contarNaoLidas(usuarioId: string) {
  return prisma.notificacao.count({ where: { usuarioId, lidaEm: null } });
}

export function listarNotificacoes(usuarioId: string, quantidade = 100) {
  return prisma.notificacao.findMany({
    where: { usuarioId },
    select: { id: true, tipo: true, titulo: true, texto: true, link: true, criadaEm: true, lidaEm: true },
    orderBy: [{ criadaEm: "desc" }, { id: "asc" }],
    take: quantidade,
  });
}

// AC-022-06: notificação de outro usuário não casa com o filtro (0 linhas = não encontrada).
export function marcarLida(usuarioId: string, id: string) {
  return prisma.notificacao.updateMany({ where: { id, usuarioId, lidaEm: null }, data: { lidaEm: new Date() } });
}

export function existeDoUsuario(usuarioId: string, id: string) {
  return prisma.notificacao.findFirst({ where: { id, usuarioId }, select: { id: true, link: true } });
}

export function marcarTodasLidas(usuarioId: string) {
  return prisma.notificacao.updateMany({ where: { usuarioId, lidaEm: null }, data: { lidaEm: new Date() } });
}
