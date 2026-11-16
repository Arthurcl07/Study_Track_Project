// Saúde do sistema (SPEC-057, RF-63, RNF-08): banco, tempo das consultas principais, tamanho e erros recentes.
// Só leitura; só o administrador chega aqui (INV-057-02, recurso saude).
import { estadoDoTempo } from "@/domain/erros";
import { contarErrosDesde, erroPeloCodigo, errosRecentes } from "@/server/dados/erros";
import { TURMA_DE_PERIODO_ABERTO } from "@/server/dados/periodos";
import { prisma } from "@/server/dados/prisma";
import { painelDeEvasao } from "./evasao";

async function medir<T>(consulta: () => Promise<T>): Promise<{ ms: number; ok: boolean }> {
  const inicio = performance.now();
  try {
    await consulta();
    return { ms: Math.round(performance.now() - inicio), ok: true };
  } catch {
    return { ms: Math.round(performance.now() - inicio), ok: false };
  }
}

export async function saudeDoSistema(busca?: string | null) {
  const banco = await medir(() => prisma.$queryRaw`SELECT 1`);
  if (!banco.ok) return { banco, consultas: [], estudantes: null, turmasAbertas: null, erros24h: null, erros: [], encontrado: null, buscou: Boolean(busca) };
  const umEstudante = await prisma.matricula.findFirst({ where: { turma: TURMA_DE_PERIODO_ABERTO }, select: { estudanteId: true } });
  const consultas: { nome: string; ms: number; ok: boolean; estado: ReturnType<typeof estadoDoTempo> }[] = [];
  for (const [nome, consulta] of [
    ["Dashboard do estudante", () => prisma.indicadorAcademico.findMany({ where: { estudanteId: umEstudante?.estudanteId ?? "-", turma: TURMA_DE_PERIODO_ABERTO }, include: { turma: { include: { disciplina: true } } } })],
    ["Relatório da faculdade inteira", () => prisma.indicadorAcademico.findMany({ where: { turma: TURMA_DE_PERIODO_ABERTO }, select: { media: true, frequenciaAtual: true, situacao: true, estudante: { select: { nome: true } }, turma: { select: { nome: true } } } })],
    ["Painel de evasão", () => painelDeEvasao(null)],
    ["Auditoria (últimos 50)", () => prisma.registroAuditoria.findMany({ orderBy: { registradoEm: "desc" }, take: 50 })],
  ] as const) {
    const r = await medir(consulta as () => Promise<unknown>);
    consultas.push({ nome, ...r, estado: r.ok ? estadoDoTempo(r.ms) : "Risco" });
  }
  const desde = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [estudantes, turmasAbertas, erros24h, erros, encontrado] = await Promise.all([
    prisma.usuario.count({ where: { perfil: "Estudante", ativo: true } }),
    prisma.turma.count({ where: TURMA_DE_PERIODO_ABERTO }),
    contarErrosDesde(desde),
    errosRecentes(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 10),
    busca ? erroPeloCodigo(busca) : Promise.resolve(null),
  ]);
  return { banco, consultas, estudantes, turmasAbertas, erros24h, erros, encontrado, buscou: Boolean(busca) };
}

export type SaudeDoSistema = Awaited<ReturnType<typeof saudeDoSistema>>;
