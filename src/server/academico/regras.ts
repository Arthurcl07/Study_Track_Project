// Regras de avaliação configuráveis (SPEC-052, RF-61, RB-47, UC-47). Só a secretaria (recurso secretaria).
// A classificação continua sendo a função pura única (DA-02, INV-052-01); aqui só a prévia, a gravação e o
// recálculo em lote dos indicadores dos períodos abertos, na mesma transação, com auditoria.
import type { Prisma } from "@prisma/client";
import { entrouEmRisco, notificacaoRiscoEstudante, notificacaoRiscoProfessor } from "@/domain/notificacoes";
import { classificarSituacao, mesmaRegra, validarRegra, type RegraAvaliacao, type Situacao } from "@/domain/situacao-academica";
import { auditar } from "@/server/dados/auditoria";
import type { ClienteBanco } from "@/server/dados/indicadores";
import { prisma } from "@/server/dados/prisma";
import { regraVigente } from "@/server/dados/regras";
import type { Falha, Resultado } from "./cadastros";

const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const falha = <T>(f: Falha): Resultado<T> => ({ ok: false, falha: f });

export type Mudancas = { total: number; semMudanca: number; transicoes: { de: Situacao; para: Situacao; quantidade: number }[] };

const ORDEM: Situacao[] = ["Normal", "Atencao", "Risco"];

async function indicadoresParaRecalcular(escopo: Prisma.TurmaWhereInput, db: ClienteBanco) {
  return db.indicadorAcademico.findMany({ where: { turma: escopo }, select: { id: true, estudanteId: true, turmaId: true, media: true, frequenciaAtual: true, situacao: true } });
}

function contarMudancas(indicadores: Awaited<ReturnType<typeof indicadoresParaRecalcular>>, regra: RegraAvaliacao) {
  const novas = indicadores.map((i) => ({ ...i, nova: classificarSituacao(i.media, i.frequenciaAtual, regra) }));
  const transicoes: Mudancas["transicoes"] = [];
  for (const de of ORDEM) {
    for (const para of ORDEM) {
      if (de === para) continue;
      const quantidade = novas.filter((i) => i.situacao === de && i.nova === para).length;
      if (quantidade > 0) transicoes.push({ de, para, quantidade });
    }
  }
  const mudancas: Mudancas = { total: novas.length, semMudanca: novas.filter((i) => i.situacao === i.nova).length, transicoes };
  return { novas, mudancas };
}

const DE_PERIODO_ABERTO: Prisma.TurmaWhereInput = { periodoLetivo: { status: "Aberto" } };

// AC-052-01: quantos mudariam de situação, sem gravar nada.
export async function previaDaRegra(entrada: Record<string, unknown>): Promise<Resultado<{ regra: RegraAvaliacao; atual: RegraAvaliacao; mudancas: Mudancas }>> {
  const validacao = validarRegra(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  const [atual, indicadores] = await Promise.all([regraVigente(), indicadoresParaRecalcular(DE_PERIODO_ABERTO, prisma)]);
  return sucesso({ regra: validacao.regra, atual, mudancas: contarMudancas(indicadores, validacao.regra).mudancas });
}

// Grava a nova situação dos indicadores que mudaram, em lote, e notifica quem entrou em Risco (SPEC-022).
export async function aplicarRegra(escopo: Prisma.TurmaWhereInput, regra: RegraAvaliacao, db: ClienteBanco) {
  const { novas, mudancas } = contarMudancas(await indicadoresParaRecalcular(escopo, db), regra);
  const mudaram = novas.filter((i) => i.situacao !== i.nova);
  const agora = new Date();
  for (const situacao of ORDEM) {
    const ids = mudaram.filter((i) => i.nova === situacao).map((i) => i.id);
    for (let k = 0; k < ids.length; k += 1000) {
      await db.indicadorAcademico.updateMany({ where: { id: { in: ids.slice(k, k + 1000) } }, data: { situacao, atualizadoEm: agora } });
    }
  }
  const emRisco = mudaram.filter((i) => entrouEmRisco(i.situacao, i.nova));
  if (emRisco.length > 0) {
    const turmas = await db.turma.findMany({
      where: { id: { in: [...new Set(emRisco.map((i) => i.turmaId))] }, periodoLetivo: { status: "Aberto" } },
      select: { id: true, nome: true, professorId: true, professor: { select: { nome: true } }, disciplina: { select: { nome: true } } },
    });
    const estudantes = new Map((await db.usuario.findMany({ where: { id: { in: [...new Set(emRisco.map((i) => i.estudanteId))] } }, select: { id: true, nome: true } })).map((e) => [e.id, e.nome]));
    const turmaDe = new Map(turmas.map((t) => [t.id, t]));
    const notificacoes = emRisco.flatMap((i) => {
      const t = turmaDe.get(i.turmaId);
      if (!t) return [];
      return [
        { usuarioId: i.estudanteId, ...notificacaoRiscoEstudante(t.disciplina.nome, t.professor.nome, i.media, i.frequenciaAtual, regra) },
        { usuarioId: t.professorId, ...notificacaoRiscoProfessor(estudantes.get(i.estudanteId) ?? "Estudante", `${t.nome} · ${t.disciplina.nome}`, t.id, i.media, i.frequenciaAtual, regra) },
      ];
    });
    for (let k = 0; k < notificacoes.length; k += 1000) await db.notificacao.createMany({ data: notificacoes.slice(k, k + 1000) });
  }
  return mudancas;
}

// AC-052-02: grava a regra, recalcula os indicadores dos períodos abertos e audita, tudo na mesma transação.
export async function salvarRegra(entrada: Record<string, unknown>, administradorId: string): Promise<Resultado<{ regra: RegraAvaliacao; mudancas: Mudancas }>> {
  const validacao = validarRegra(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  const regra = validacao.regra;
  const instituicao = await prisma.instituicao.findUnique({ where: { id: 1 }, select: { id: true } });
  if (!instituicao) return falha({ tipo: "conflito", erro: "Cadastre os dados da instituição antes de mudar as regras." });
  return sucesso(
    await prisma.$transaction(async (tx) => {
      const antes = await regraVigente(tx);
      await tx.instituicao.update({ where: { id: 1 }, data: regra });
      const mudancas = await aplicarRegra(DE_PERIODO_ABERTO, regra, tx);
      const mudaram = mudancas.total - mudancas.semMudanca;
      await auditar(tx, {
        autorId: administradorId,
        acao: "regras.alteradas",
        descricao: mesmaRegra(antes, regra) ? "Regras de avaliação salvas sem mudança" : `Regras de avaliação alteradas: ${mudaram} matrícula(s) mudaram de situação`,
        antes,
        depois: { ...regra, matriculasQueMudaram: mudaram },
      });
      return { regra, mudancas };
    }, { timeout: 60_000, maxWait: 10_000 }),
  );
}

