// Painel de evasão (SPEC-050, RF-59, RB-45, UC-45). Só matrículas cursando de turmas de períodos abertos
// (INV-050-02); coordenação vê o curso dela, secretaria vê todos (escopo na query, ADR-003). Nada de evasão é
// gravado (INV-050-01); só a notificação ao coordenador, uma vez por estudante e turma (INV-050-03).
import type { Prisma } from "@prisma/client";
import { hojeEmBrasilia } from "@/domain/atividades";
import { avaliarEvasao, DIAS_SEM_PRESENCA_PARA_EVASAO, FALTAS_SEGUIDAS_PARA_EVASAO, somarDias, textoDoMotivo, type RegistroDeAula } from "@/domain/evasao";
import type { Sessao } from "@/server/auth/token";
import { MATRICULA_CURSANDO } from "@/server/dados/matriculas";
import { TURMA_DE_PERIODO_ABERTO } from "@/server/dados/periodos";
import { prisma } from "@/server/dados/prisma";

const dia = (d: Date) => d.toISOString().slice(0, 10);

export type LinhaEvasao = {
  estudanteId: string;
  nome: string;
  numeroMatricula: string | null;
  turmaId: string;
  turma: string;
  disciplina: string;
  curso: string;
  coordenadorId: string;
  motivo: "FaltasSeguidas" | "SemPresenca";
  textoMotivo: string;
  faltasSeguidas: number;
  ultimaPresenca: string | null;
};

// coordenadorId null = secretaria (todos os cursos).
export async function painelDeEvasao(coordenadorId: string | null, cursoId?: string | null, hoje = hojeEmBrasilia()): Promise<LinhaEvasao[]> {
  const escopo: Prisma.TurmaWhereInput = {
    ...TURMA_DE_PERIODO_ABERTO,
    ...(coordenadorId ? { curso: { coordenadorId } } : {}),
    ...(cursoId ? { cursoId } : {}),
  };
  // Só as aulas que importam: as 3 últimas datas de cada turma e as dos últimos 14 dias.
  const aulas = await prisma.aula.findMany({ where: { turma: escopo, data: { lte: new Date(`${hoje}T00:00:00Z`) } }, select: { id: true, turmaId: true, data: true }, orderBy: { data: "desc" } });
  const inicioJanela = somarDias(hoje, -DIAS_SEM_PRESENCA_PARA_EVASAO);
  const datasPorTurma = new Map<string, Set<string>>();
  const relevantes: string[] = [];
  for (const a of aulas) {
    const datas = datasPorTurma.get(a.turmaId) ?? new Set<string>();
    datasPorTurma.set(a.turmaId, datas);
    const d = dia(a.data);
    if (datas.size < FALTAS_SEGUIDAS_PARA_EVASAO || datas.has(d) || d > inicioJanela) {
      datas.add(d);
      relevantes.push(a.id);
    }
  }
  if (relevantes.length === 0) return [];
  const presencas = await prisma.presenca.findMany({
    where: { aulaId: { in: relevantes } },
    select: { estudanteId: true, presente: true, aula: { select: { turmaId: true, data: true } } },
  });
  const porMatricula = new Map<string, RegistroDeAula[]>();
  for (const p of presencas) {
    const chave = `${p.estudanteId}|${p.aula.turmaId}`;
    const lista = porMatricula.get(chave) ?? [];
    lista.push({ data: dia(p.aula.data), presente: p.presente });
    porMatricula.set(chave, lista);
  }
  // Candidatos sem abono; depois confere com os abonos de quem ficou (RB-31).
  const candidatos = [...porMatricula.entries()].filter(([, registros]) => avaliarEvasao(registros, hoje));
  if (candidatos.length === 0) return [];
  const estudantes = [...new Set(candidatos.map(([chave]) => chave.split("|")[0]))];
  const turmas = [...new Set(candidatos.map(([chave]) => chave.split("|")[1]))];
  const [matriculas, abonos, ultimas] = await Promise.all([
    prisma.matricula.findMany({
      where: { ...MATRICULA_CURSANDO, estudanteId: { in: estudantes }, turmaId: { in: turmas } },
      select: {
        estudanteId: true,
        turmaId: true,
        estudante: { select: { nome: true, ficha: { select: { numeroMatricula: true } } } },
        turma: { select: { nome: true, disciplina: { select: { nome: true } }, curso: { select: { nome: true, coordenadorId: true } } } },
      },
    }),
    prisma.abono.findMany({ where: { estudanteId: { in: estudantes } }, select: { estudanteId: true, inicio: true, fim: true } }),
    prisma.$queryRaw<{ estudanteId: string; turmaId: string; ultima: Date }[]>`
      SELECT p."estudanteId", a."turmaId", max(a."data") AS ultima
      FROM "Presenca" p JOIN "Aula" a ON a."id" = p."aulaId"
      WHERE p."presente" AND p."estudanteId" = ANY(${estudantes}) AND a."turmaId" = ANY(${turmas})
      GROUP BY p."estudanteId", a."turmaId"`,
  ]);
  const ultimaDe = new Map(ultimas.map((u) => [`${u.estudanteId}|${u.turmaId}`, dia(u.ultima)]));
  const linhas: LinhaEvasao[] = [];
  for (const m of matriculas) {
    const chave = `${m.estudanteId}|${m.turmaId}`;
    const intervalos = abonos.filter((a) => a.estudanteId === m.estudanteId).map((a) => ({ inicio: dia(a.inicio), fim: dia(a.fim) }));
    const evasao = avaliarEvasao(porMatricula.get(chave) ?? [], hoje, intervalos);
    if (!evasao) continue;
    linhas.push({
      estudanteId: m.estudanteId,
      nome: m.estudante.nome,
      numeroMatricula: m.estudante.ficha?.numeroMatricula ?? null,
      turmaId: m.turmaId,
      turma: m.turma.nome,
      disciplina: m.turma.disciplina.nome,
      curso: m.turma.curso.nome,
      coordenadorId: m.turma.curso.coordenadorId,
      motivo: evasao.motivo,
      textoMotivo: textoDoMotivo(evasao),
      faltasSeguidas: evasao.faltasSeguidas,
      ultimaPresenca: ultimaDe.get(chave) ?? null,
    });
  }
  linhas.sort((a, b) => b.faltasSeguidas - a.faltasSeguidas || a.nome.localeCompare(b.nome, "pt-BR"));
  return linhas;
}

// AC-050-05 / INV-050-03: o coordenador do curso é notificado uma vez por estudante e turma (chave única).
export async function notificarEvasao(linhas: readonly LinhaEvasao[]) {
  if (linhas.length === 0) return;
  await prisma.notificacao.createMany({
    data: linhas.map((l) => ({
      usuarioId: l.coordenadorId,
      tipo: "Evasao" as const,
      titulo: `${l.nome} pode estar abandonando ${l.disciplina}`,
      texto: `${l.turma} · ${l.textoMotivo}.`,
      link: `/evasao`,
      chave: `evasao:${l.estudanteId}:${l.turmaId}`,
    })),
    skipDuplicates: true,
  });
}

// Painel com o escopo do perfil; calcular o painel é o que dispara as notificações.
export async function consultarEvasao(sessao: Sessao, cursoId?: string | null) {
  if (sessao.perfil !== "Coordenador" && sessao.perfil !== "Administrador") return null;
  const linhas = await painelDeEvasao(sessao.perfil === "Coordenador" ? sessao.usuarioId : null, cursoId);
  await notificarEvasao(linhas);
  const estudantes = new Set(linhas.map((l) => l.estudanteId));
  return {
    linhas,
    emEvasao: estudantes.size,
    porFaltas: new Set(linhas.filter((l) => l.motivo === "FaltasSeguidas").map((l) => l.estudanteId)).size,
    porAusencia: new Set(linhas.filter((l) => l.motivo === "SemPresenca").map((l) => l.estudanteId)).size,
  };
}

// Contador do dashboard da coordenação (SPEC-050).
export async function contarEvasao(coordenadorId: string, cursoId?: string | null): Promise<number> {
  const linhas = await painelDeEvasao(coordenadorId, cursoId);
  await notificarEvasao(linhas);
  return new Set(linhas.map((l) => l.estudanteId)).size;
}
