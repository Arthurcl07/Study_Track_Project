// Documentos oficiais da turma (SPEC-048, RF-57, UC-43). Professor: turmas que leciona; coordenação: turmas dos
// cursos dela; secretaria: todas. Escopo na própria query (RB-03, RB-04, ADR-003); fora dele, não encontrada.
// Nada é gravado.
import type { Prisma } from "@prisma/client";
import { ataLiberada, linhasDaAta, marcaDaPresenca } from "@/domain/documentos-turma";
import type { Sessao } from "@/server/auth/token";
import { MATRICULA_CURSANDO } from "@/server/dados/matriculas";
import { prisma } from "@/server/dados/prisma";
import { CAMPOS_REGRA_DO_PERIODO, regraGuardada, regraVigente } from "@/server/dados/regras";

const dia = (d: Date) => d.toISOString().slice(0, 10);

function escopo(sessao: Sessao): Prisma.TurmaWhereInput | null {
  if (sessao.perfil === "Professor") return { professorId: sessao.usuarioId };
  if (sessao.perfil === "Coordenador") return { curso: { coordenadorId: sessao.usuarioId } };
  if (sessao.perfil === "Administrador") return {};
  return null;
}

export function voltarDaTurma(sessao: Sessao, turmaId: string) {
  return sessao.perfil === "Professor" ? `/professor/turmas/${turmaId}` : sessao.perfil === "Coordenador" ? `/coordenador/turmas/${turmaId}` : "/admin";
}

async function turmaDoEscopo(sessao: Sessao, turmaId: string | undefined) {
  const filtro = escopo(sessao);
  if (!filtro || !turmaId) return null;
  return prisma.turma.findFirst({
    where: { id: turmaId, ...filtro },
    select: {
      id: true,
      nome: true,
      periodo: true,
      diario: true,
      diarioHomologadoEm: true,
      disciplina: { select: { nome: true, cargaHoraria: true } },
      professor: { select: { nome: true } },
      curso: { select: { nome: true } },
      periodoLetivo: { select: CAMPOS_REGRA_DO_PERIODO },
    },
  });
}

export async function ataDeResultados(sessao: Sessao, turmaId: string | undefined) {
  const turma = await turmaDoEscopo(sessao, turmaId);
  if (!turma) return null;
  const encerrado = turma.periodoLetivo.status === "Encerrado";
  const regra = (encerrado ? regraGuardada(turma.periodoLetivo) : null) ?? (await regraVigente());
  if (!ataLiberada(turma.diario, encerrado)) return { turma, regra, liberada: false as const };
  const [matriculas, exames] = await Promise.all([
    prisma.matricula.findMany({
      where: { turmaId: turma.id },
      select: { situacao: true, estudanteId: true, estudante: { select: { nome: true, ficha: { select: { numeroMatricula: true } } } }, indicador: { select: { media: true, frequenciaAtual: true } } },
      orderBy: { estudante: { nome: "asc" } },
    }),
    prisma.nota.findMany({ where: { avaliacao: { turmaId: turma.id, tipo: "Exame" } }, select: { estudanteId: true, valor: true } }),
  ]);
  const exameDe = new Map(exames.map((e) => [e.estudanteId, e.valor]));
  const ata = linhasDaAta(
    matriculas.map((m) => ({
      nome: m.estudante.nome,
      numeroMatricula: m.estudante.ficha?.numeroMatricula ?? null,
      media: m.indicador?.media ?? null,
      frequencia: m.indicador?.frequenciaAtual ?? null,
      exame: exameDe.get(m.estudanteId) ?? null,
      matricula: m.situacao,
    })),
    regra,
  );
  return { turma, regra, liberada: true as const, ...ata };
}

export async function diarioDeClasse(sessao: Sessao, turmaId: string | undefined) {
  const turma = await turmaDoEscopo(sessao, turmaId);
  if (!turma) return null;
  const [aulas, matriculas] = await Promise.all([
    prisma.aula.findMany({ where: { turmaId: turma.id }, select: { id: true, data: true, numero: true, conteudo: true, presencas: { select: { estudanteId: true, presente: true } } }, orderBy: [{ data: "asc" }, { numero: "asc" }] }),
    prisma.matricula.findMany({
      where: { turmaId: turma.id },
      select: { situacao: true, estudanteId: true, estudante: { select: { nome: true, abonos: { select: { inicio: true, fim: true } } } }, indicador: { select: { frequenciaAtual: true } } },
      orderBy: { estudante: { nome: "asc" } },
    }),
  ]);
  const colunas = aulas.map((a) => ({ id: a.id, data: dia(a.data), numero: a.numero, conteudo: a.conteudo }));
  const estudantes = matriculas.map((m) => {
    const abonos = m.estudante.abonos.map((a) => ({ inicio: dia(a.inicio), fim: dia(a.fim) }));
    return {
      nome: m.estudante.nome,
      situacao: m.situacao,
      frequencia: m.indicador?.frequenciaAtual ?? null,
      marcas: aulas.map((a) => marcaDaPresenca(a.presencas.find((p) => p.estudanteId === m.estudanteId)?.presente, dia(a.data), abonos)),
    };
  });
  return { turma, aulas: colunas, estudantes };
}

export async function listaDePresenca(sessao: Sessao, turmaId: string | undefined) {
  const turma = await turmaDoEscopo(sessao, turmaId);
  if (!turma) return null;
  const matriculas = await prisma.matricula.findMany({
    where: { turmaId: turma.id, ...MATRICULA_CURSANDO },
    select: { estudante: { select: { nome: true, ficha: { select: { numeroMatricula: true } } } } },
    orderBy: { estudante: { nome: "asc" } },
  });
  return { turma, estudantes: matriculas.map((m) => ({ nome: m.estudante.nome, numeroMatricula: m.estudante.ficha?.numeroMatricula ?? null })) };
}
