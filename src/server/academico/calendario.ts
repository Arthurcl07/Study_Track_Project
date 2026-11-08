// Calendário acadêmico (SPEC-040, RF-48, UC-37). A secretaria mantém os eventos (recurso secretaria); todos
// consultam o mês, e estudante e professor veem também os prazos e as avaliações das próprias turmas (INV-040-02).
import { ROTULO_EVENTO, validarEvento, type Evento, type TipoEvento } from "@/domain/calendario";
import { dataBR } from "@/domain/auditoria";
import type { Sessao } from "@/server/auth/token";
import { deData, paraData } from "@/server/dados/atividades";
import { auditar } from "@/server/dados/auditoria";
import type { ClienteBanco } from "@/server/dados/indicadores";
import { MATRICULA_CURSANDO } from "@/server/dados/matriculas";
import { executarEmTransacao } from "@/server/dados/notas";
import { TURMA_DE_PERIODO_ABERTO } from "@/server/dados/periodos";
import { prisma } from "@/server/dados/prisma";
import type { Falha, Resultado } from "./cadastros";

const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const falha = <T>(f: Falha): Resultado<T> => ({ ok: false, falha: f });

const comoEvento = (e: { tipo: TipoEvento; titulo: string; inicio: Date; fim: Date }): Evento => ({ tipo: e.tipo, titulo: e.titulo, inicio: deData(e.inicio), fim: deData(e.fim) });

// RB-38: eventos do período da turma, para a chamada.
export async function eventosDoPeriodo(periodo: string, db: ClienteBanco = prisma): Promise<Evento[]> {
  const eventos = await db.eventoCalendario.findMany({ where: { periodo }, select: { tipo: true, titulo: true, inicio: true, fim: true } });
  return eventos.map(comoEvento);
}

// RB-34: feriados e recessos de qualquer período, para contar dias úteis.
export async function folgasDoCalendario(db: ClienteBanco = prisma): Promise<Evento[]> {
  const eventos = await db.eventoCalendario.findMany({ where: { tipo: { in: ["Feriado", "Recesso"] } }, select: { tipo: true, titulo: true, inicio: true, fim: true } });
  return eventos.map(comoEvento);
}

export async function listarEventos(periodo?: string | null) {
  const eventos = await prisma.eventoCalendario.findMany({
    where: periodo ? { periodo } : {},
    select: { id: true, periodo: true, tipo: true, titulo: true, inicio: true, fim: true },
    orderBy: [{ inicio: "asc" }, { titulo: "asc" }],
  });
  return eventos.map((e) => ({ ...e, inicio: deData(e.inicio), fim: deData(e.fim) }));
}

const descrever = (e: Evento & { periodo: string }) => `${e.periodo} · ${ROTULO_EVENTO[e.tipo]} "${e.titulo}" (${dataBR(e.inicio)}${e.fim !== e.inicio ? ` a ${dataBR(e.fim)}` : ""})`;

// AC-040-03: datas em ordem, tipo da lista, período existente.
export async function salvarEvento(entrada: Record<string, unknown>, administradorId: string, id?: string) {
  const validacao = validarEvento(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  const d = validacao.dados;
  if (!(await prisma.periodoLetivo.findUnique({ where: { nome: d.periodo }, select: { id: true } }))) return falha({ tipo: "invalido", erros: { periodo: "Período inexistente." } });
  const anterior = id ? await prisma.eventoCalendario.findUnique({ where: { id } }) : null;
  if (id && !anterior) return falha({ tipo: "nao-encontrado", erro: "Evento não encontrado." });
  return sucesso(
    await executarEmTransacao(async (tx) => {
      const dados = { periodo: d.periodo, tipo: d.tipo, titulo: d.titulo, inicio: paraData(d.inicio), fim: paraData(d.fim) };
      const evento = id ? await tx.eventoCalendario.update({ where: { id }, data: dados }) : await tx.eventoCalendario.create({ data: dados });
      await auditar(tx, {
        autorId: administradorId,
        acao: "calendario.evento",
        descricao: `${id ? "Alterado" : "Cadastrado"}: ${descrever(d)}`,
        antes: anterior ? { ...comoEvento(anterior), periodo: anterior.periodo } : null,
        depois: d,
      });
      return { id: evento.id };
    }),
  );
}

export async function excluirEvento(id: string, administradorId: string) {
  const evento = await prisma.eventoCalendario.findUnique({ where: { id } });
  if (!evento) return falha({ tipo: "nao-encontrado", erro: "Evento não encontrado." });
  return sucesso(
    await executarEmTransacao(async (tx) => {
      await tx.eventoCalendario.delete({ where: { id } });
      await auditar(tx, { autorId: administradorId, acao: "calendario.evento", descricao: `Excluído: ${descrever({ ...comoEvento(evento), periodo: evento.periodo })}`, antes: { ...comoEvento(evento), periodo: evento.periodo } });
      return { id };
    }),
  );
}

export type ItemDoMes = { data: string; ate: string; tipo: TipoEvento | "Prazo" | "Avaliacao"; titulo: string };

// Turmas de período aberto do usuário (estudante cursando; professor que leciona).
function turmasDoUsuario(sessao: Sessao) {
  if (sessao.perfil === "Estudante") return { matriculas: { some: { estudanteId: sessao.usuarioId, ...MATRICULA_CURSANDO } }, ...TURMA_DE_PERIODO_ABERTO };
  if (sessao.perfil === "Professor") return { professorId: sessao.usuarioId, ...TURMA_DE_PERIODO_ABERTO };
  return null;
}

// AC-040-04 / INV-040-02: eventos do mês para todos; prazos e avaliações só das turmas do próprio usuário.
export async function consultarMes(sessao: Sessao, mes: string): Promise<ItemDoMes[]> {
  const inicio = paraData(`${mes}-01`);
  const fim = new Date(inicio);
  fim.setUTCMonth(fim.getUTCMonth() + 1);
  fim.setUTCDate(fim.getUTCDate() - 1);
  const eventos = await prisma.eventoCalendario.findMany({
    where: { inicio: { lte: fim }, fim: { gte: inicio } },
    select: { tipo: true, titulo: true, inicio: true, fim: true },
    orderBy: { inicio: "asc" },
  });
  const itens: ItemDoMes[] = eventos.map((e) => ({ data: deData(e.inicio), ate: deData(e.fim), tipo: e.tipo, titulo: e.titulo }));
  const turmas = turmasDoUsuario(sessao);
  if (turmas) {
    const [atividades, avaliacoes] = await Promise.all([
      prisma.atividade.findMany({ where: { prazo: { gte: inicio, lte: fim }, turma: turmas }, select: { descricao: true, prazo: true, turma: { select: { disciplina: { select: { nome: true } } } } } }),
      prisma.avaliacao.findMany({ where: { data: { gte: inicio, lte: fim }, turma: turmas }, select: { nome: true, data: true, turma: { select: { disciplina: { select: { nome: true } } } } } }),
    ]);
    for (const a of atividades) itens.push({ data: deData(a.prazo), ate: deData(a.prazo), tipo: "Prazo", titulo: `${a.descricao} · ${a.turma.disciplina.nome}` });
    for (const a of avaliacoes) itens.push({ data: deData(a.data), ate: deData(a.data), tipo: "Avaliacao", titulo: `${a.nome} · ${a.turma.disciplina.nome}` });
  }
  return itens.sort((a, b) => a.data.localeCompare(b.data) || a.titulo.localeCompare(b.titulo));
}
