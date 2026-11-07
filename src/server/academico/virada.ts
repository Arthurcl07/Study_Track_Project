// Caso de uso "Virar o semestre" (SPEC-030, RF-38, UC-27). Quem pode: Administrador (secretaria), conferido na rota.
// A prévia não grava nada; a cópia grava turmas, matrículas e auditoria numa única transação (INV-030-05).
import { planoDaVirada, type PlanoDaTurma } from "@/domain/secretaria";
import { auditar } from "@/server/dados/auditoria";
import { MATRICULA_CURSANDO } from "@/server/dados/matriculas";
import { executarEmTransacao } from "@/server/dados/notas";
import { prisma } from "@/server/dados/prisma";
import type { Falha, Resultado } from "./cadastros";

const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const falha = <T>(f: Falha): Resultado<T> => ({ ok: false, falha: f });

async function periodos(origem: unknown, destino: unknown) {
  const nomeOrigem = typeof origem === "string" ? origem : "";
  const nomeDestino = typeof destino === "string" ? destino : "";
  const [o, d] = await Promise.all([
    prisma.periodoLetivo.findUnique({ where: { nome: nomeOrigem }, select: { nome: true } }),
    prisma.periodoLetivo.findUnique({ where: { nome: nomeDestino }, select: { nome: true, status: true } }),
  ]);
  const erros: Record<string, string> = {};
  if (!o) erros.origem = "Escolha o período de origem.";
  if (!d) erros.destino = "Escolha o período de destino.";
  else if (d.status !== "Aberto") erros.destino = "O período de destino precisa estar aberto.";
  if (o && d && o.nome === d.nome) erros.destino = "O destino precisa ser diferente da origem.";
  return Object.keys(erros).length > 0 ? { erros } : { origem: o!.nome, destino: d!.nome };
}

async function turmasDaOrigem(origem: string) {
  return prisma.turma.findMany({
    where: { periodo: origem },
    select: {
      id: true,
      nome: true,
      disciplinaId: true,
      cursoId: true,
      disciplina: { select: { nome: true } },
      curso: { select: { nome: true } },
      professor: { select: { id: true, nome: true, ativo: true } },
      // INV-030-04: só estudantes Ativos no curso vão para a turma nova.
      matriculas: { where: MATRICULA_CURSANDO, select: { estudanteId: true, estudante: { select: { ativo: true, ficha: { select: { situacaoCurso: true } } } } } },
      _count: { select: { matriculas: true } },
    },
    orderBy: [{ curso: { nome: "asc" } }, { nome: "asc" }],
  });
}

const levaveis = (t: Awaited<ReturnType<typeof turmasDaOrigem>>[number]) =>
  t.matriculas.filter((m) => m.estudante.ativo && m.estudante.ficha?.situacaoCurso === "Ativo").map((m) => m.estudanteId);

async function montarPrevia(origem: string, destino: string) {
  const [turmas, existentes] = await Promise.all([
    turmasDaOrigem(origem),
    prisma.turma.findMany({ where: { periodo: destino }, select: { nome: true, disciplinaId: true, cursoId: true } }),
  ]);
  const plano = planoDaVirada(
    turmas.map((t) => ({ id: t.id, nome: t.nome, disciplinaId: t.disciplinaId, cursoId: t.cursoId, professorAtivo: t.professor.ativo })),
    existentes,
  );
  const acao = new Map<string, PlanoDaTurma["acao"]>(plano.map((p) => [p.id, p.acao]));
  return turmas.map((t) => ({
    id: t.id,
    nome: t.nome,
    disciplinaId: t.disciplinaId,
    cursoId: t.cursoId,
    disciplina: t.disciplina.nome,
    curso: t.curso.nome,
    professorId: t.professor.id,
    professor: t.professor.nome,
    estudantes: t._count.matriculas,
    estudantesAtivos: levaveis(t),
    acao: acao.get(t.id)!,
  }));
}

export async function previaDaVirada(origem: unknown, destino: unknown) {
  const p = await periodos(origem, destino);
  if ("erros" in p) return falha({ tipo: "invalido", erros: p.erros! });
  const turmas = await montarPrevia(p.origem, p.destino);
  return sucesso({ origem: p.origem, destino: p.destino, turmas: turmas.map(({ estudantesAtivos, ...t }) => ({ ...t, estudantesAtivos: estudantesAtivos.length })) });
}

// AC-030-01 a AC-030-05: copia as turmas marcadas que a prévia permite; o resto volta como pulada com o motivo.
export async function executarVirada(entrada: Record<string, unknown>, administradorId: string) {
  const p = await periodos(entrada.origem, entrada.destino);
  if ("erros" in p) return falha({ tipo: "invalido", erros: p.erros! });
  const pedidas = Array.isArray(entrada.turmas)
    ? entrada.turmas.flatMap((x) => {
        const item = x as { id?: unknown; levarEstudantes?: unknown };
        return typeof item?.id === "string" ? [{ id: item.id, levarEstudantes: item.levarEstudantes === true }] : [];
      })
    : [];
  if (pedidas.length === 0) return falha({ tipo: "invalido", erros: { turmas: "Marque ao menos uma turma." } });
  const previa = new Map((await montarPrevia(p.origem, p.destino)).map((t) => [t.id, t]));
  const destino = p.destino;

  return sucesso(
    await executarEmTransacao(async (tx) => {
      const criadas: { nome: string; curso: string; matriculas: number }[] = [];
      const puladas: { nome: string; motivo: string }[] = [];
      for (const pedida of pedidas) {
        const t = previa.get(pedida.id);
        if (!t) continue;
        if (t.acao !== "copiar") {
          puladas.push({ nome: `${t.nome} · ${t.disciplina}`, motivo: t.acao === "ja-existe" ? `já existe em ${destino}` : "professor desativado" });
          continue;
        }
        const nova = await tx.turma.create({ data: { nome: t.nome, periodo: destino, disciplinaId: t.disciplinaId, cursoId: t.cursoId, professorId: t.professorId }, select: { id: true } });
        const estudantes = pedida.levarEstudantes ? t.estudantesAtivos : [];
        if (estudantes.length > 0) await tx.matricula.createMany({ data: estudantes.map((estudanteId) => ({ estudanteId, turmaId: nova.id })) });
        await auditar(tx, {
          autorId: administradorId,
          acao: "turma.copiada",
          cursoId: t.cursoId,
          turmaId: nova.id,
          descricao: `${t.nome} · ${t.disciplina} copiada de ${p.origem} para ${destino}${estudantes.length > 0 ? ` com ${estudantes.length} estudante(s)` : " sem estudantes"}`,
          depois: { origem: p.origem, destino, professor: t.professor, estudantes: estudantes.length },
        });
        criadas.push({ nome: `${t.nome} · ${t.disciplina}`, curso: t.curso, matriculas: estudantes.length });
      }
      return { origem: p.origem, destino, criadas, puladas, matriculas: criadas.reduce((s, c) => s + c.matriculas, 0) };
    }),
  );
}
