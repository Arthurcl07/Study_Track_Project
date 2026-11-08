// Rematrícula pelo estudante (SPEC-038, RF-46, UC-35, RB-36). Estudante Ativo, turmas do próprio curso, período
// aberto com a janela de hoje. A vaga é conferida dentro da transação com a turma bloqueada (INV-038-01).
// A janela é definida pela secretaria (recurso secretaria).
import { hojeEmBrasilia } from "@/domain/atividades";
import { dataBR } from "@/domain/auditoria";
import { motivoParaNaoTirarDaTurma } from "@/domain/correcoes";
import { concluida } from "@/domain/matriz";
import { choqueDeHorario, janelaAberta, motivoParaNaoRematricular, validarJanela, vagasRestantes } from "@/domain/rematricula";
import type { Sessao } from "@/server/auth/token";
import { deData, paraData } from "@/server/dados/atividades";
import { auditar, turmaParaAuditoria } from "@/server/dados/auditoria";
import { MATRICULA_CURSANDO } from "@/server/dados/matriculas";
import { executarEmTransacao } from "@/server/dados/notas";
import { prisma } from "@/server/dados/prisma";
import type { Falha, Resultado } from "./cadastros";
import { historicoParaMatriz, matrizDoCurso } from "./matriz";

const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const falha = <T>(f: Falha): Resultado<T> => ({ ok: false, falha: f });

async function estudanteParaRematricula(estudanteId: string) {
  return prisma.usuario.findFirst({ where: { id: estudanteId, perfil: "Estudante" }, select: { id: true, nome: true, cursoId: true, ficha: { select: { situacaoCurso: true } } } });
}

// Turmas do curso no período, com horários, vagas e o que impede cada uma (AC-038-03, AC-038-04, AC-038-07).
async function turmasDoPeriodo(estudanteId: string, cursoId: string, periodo: string) {
  const [turmas, matriz, historico] = await Promise.all([
    prisma.turma.findMany({
      where: { cursoId, periodo },
      select: {
        id: true,
        nome: true,
        vagas: true,
        disciplinaId: true,
        disciplina: { select: { nome: true, cargaHoraria: true } },
        professor: { select: { nome: true } },
        horarios: { select: { diaSemana: true, inicio: true, fim: true, sala: { select: { nome: true } } }, orderBy: [{ diaSemana: "asc" }, { inicio: "asc" }] },
        matriculas: { where: MATRICULA_CURSANDO, select: { estudanteId: true } },
      },
      orderBy: [{ disciplina: { nome: "asc" } }, { nome: "asc" }],
    }),
    matrizDoCurso(cursoId),
    historicoParaMatriz(estudanteId),
  ]);
  const minhas = turmas.filter((t) => t.matriculas.some((m) => m.estudanteId === estudanteId));
  const meusHorarios = minhas.flatMap((t) => t.horarios.map((h) => ({ ...h, turma: `${t.nome} · ${t.disciplina.nome}` })));
  const nome = (id: string) => matriz.find((m) => m.disciplinaId === id)?.nome ?? id;
  return turmas.map((t) => {
    const linha = matriz.find((m) => m.disciplinaId === t.disciplinaId);
    const matriculado = t.matriculas.some((m) => m.estudanteId === estudanteId);
    const outros = meusHorarios.filter((h) => !h.turma.startsWith(`${t.nome} · `));
    const situacao = {
      matriculado,
      vagas: t.vagas,
      ocupadas: t.matriculas.length,
      aprovado: historico.aprovadas.has(t.disciplinaId) || historico.aproveitadas.has(t.disciplinaId),
      requisitosFaltando: (linha?.requisitos ?? []).filter((r) => !concluida(r, historico)).map(nome),
      choque: matriculado ? null : choqueDeHorario(t.horarios, outros),
    };
    return {
      id: t.id,
      nome: t.nome,
      disciplina: t.disciplina.nome,
      cargaHoraria: t.disciplina.cargaHoraria,
      professor: t.professor.nome,
      semestre: linha?.semestre ?? null,
      horarios: t.horarios.map((h) => ({ diaSemana: h.diaSemana, inicio: h.inicio, fim: h.fim, sala: h.sala.nome })),
      vagas: t.vagas,
      restantes: vagasRestantes(t.vagas, t.matriculas.length),
      matriculado,
      motivo: matriculado ? null : motivoParaNaoRematricular(situacao),
    };
  });
}

export async function consultarRematricula(sessao: Sessao, hoje = hojeEmBrasilia()) {
  if (sessao.perfil !== "Estudante") return null;
  const estudante = await estudanteParaRematricula(sessao.usuarioId);
  if (!estudante?.cursoId) return null;
  const ativo = estudante.ficha?.situacaoCurso === "Ativo";
  const periodos = await prisma.periodoLetivo.findMany({ where: { status: "Aberto", rematriculaInicio: { not: null } }, select: { nome: true, rematriculaInicio: true, rematriculaFim: true }, orderBy: { nome: "asc" } });
  const comJanela = periodos.map((p) => ({ nome: p.nome, inicio: p.rematriculaInicio ? deData(p.rematriculaInicio) : null, fim: p.rematriculaFim ? deData(p.rematriculaFim) : null }));
  const abertos = comJanela.filter((p) => janelaAberta(hoje, p.inicio, p.fim));
  return {
    ativo,
    proximas: comJanela.filter((p) => p.inicio && p.inicio > hoje),
    periodos: await Promise.all(abertos.map(async (p) => ({ ...p, turmas: await turmasDoPeriodo(estudante.id, estudante.cursoId!, p.nome) }))),
  };
}

async function turmaDaRematricula(estudante: { id: string; cursoId: string | null }, turmaId: string, hoje: string) {
  const turma = await prisma.turma.findFirst({
    where: { id: turmaId, cursoId: estudante.cursoId ?? "-", periodoLetivo: { status: "Aberto" } },
    select: { id: true, periodo: true, diario: true, periodoLetivo: { select: { rematriculaInicio: true, rematriculaFim: true } } },
  });
  if (!turma) return { tipo: "nao-encontrado", erro: "Turma não encontrada." } as Falha;
  const p = turma.periodoLetivo;
  if (!janelaAberta(hoje, p.rematriculaInicio ? deData(p.rematriculaInicio) : null, p.rematriculaFim ? deData(p.rematriculaFim) : null)) {
    return { tipo: "conflito", erro: `A rematrícula de ${turma.periodo} não está aberta hoje.` } as Falha;
  }
  if (turma.diario !== "Aberto") return { tipo: "conflito", erro: "O diário desta turma está fechado." } as Falha;
  return turma;
}

// AC-038-01 / AC-038-02: vale na hora, com a vaga conferida na transação (turma bloqueada com FOR UPDATE).
export async function rematricular(sessao: Sessao, turmaId: string, hoje = hojeEmBrasilia()) {
  const estudante = await estudanteParaRematricula(sessao.usuarioId);
  if (!estudante) return falha({ tipo: "fora-do-escopo" });
  if (estudante.ficha?.situacaoCurso !== "Ativo") return falha({ tipo: "conflito", erro: "Só estudante Ativo no curso faz rematrícula." });
  const r = await turmaDaRematricula(estudante, turmaId, hoje);
  if ("tipo" in r) return falha(r);
  return executarEmTransacao(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "Turma" WHERE "id" = ${turmaId} FOR UPDATE`;
    const situacao = (await turmasDoPeriodo(estudante.id, estudante.cursoId!, r.periodo)).find((t) => t.id === turmaId)!;
    const ocupadas = await tx.matricula.count({ where: { turmaId, ...MATRICULA_CURSANDO } });
    const motivo = situacao.motivo ?? (situacao.vagas !== null && ocupadas >= situacao.vagas ? "Sem vaga." : null);
    if (motivo) return falha<{ turmaId: string }>({ tipo: "conflito", erro: motivo });
    const existente = await tx.matricula.findUnique({ where: { estudanteId_turmaId: { estudanteId: estudante.id, turmaId } } });
    if (existente) await tx.matricula.update({ where: { estudanteId_turmaId: { estudanteId: estudante.id, turmaId } }, data: { situacao: "Cursando" } });
    else await tx.matricula.create({ data: { estudanteId: estudante.id, turmaId } });
    const contexto = await turmaParaAuditoria(turmaId, tx);
    await auditar(tx, { autorId: estudante.id, acao: "rematricula.feita", ...contexto, descricao: `${estudante.nome} se matriculou em ${contexto.rotulo}` });
    return sucesso({ turmaId });
  });
}

// AC-038-06: cancelar na janela, só sem registros (RB-32).
export async function cancelarRematricula(sessao: Sessao, turmaId: string, hoje = hojeEmBrasilia()) {
  const estudante = await estudanteParaRematricula(sessao.usuarioId);
  if (!estudante) return falha({ tipo: "fora-do-escopo" });
  const r = await turmaDaRematricula(estudante, turmaId, hoje);
  if ("tipo" in r) return falha(r);
  const matricula = await prisma.matricula.findUnique({ where: { estudanteId_turmaId: { estudanteId: estudante.id, turmaId } } });
  if (!matricula) return falha({ tipo: "nao-encontrado", erro: "Você não está matriculado nesta turma." });
  const [notas, presencas, entregas, planos] = await Promise.all([
    prisma.nota.count({ where: { estudanteId: estudante.id, avaliacao: { turmaId } } }),
    prisma.presenca.count({ where: { estudanteId: estudante.id, aula: { turmaId } } }),
    prisma.entrega.count({ where: { estudanteId: estudante.id, atividade: { turmaId } } }),
    prisma.planoRecuperacao.count({ where: { estudanteId: estudante.id, turmaId } }),
  ]);
  const motivo = motivoParaNaoTirarDaTurma({ notas, presencas, entregas, planos });
  if (motivo) return falha({ tipo: "conflito", erro: motivo.replace("O estudante já tem", "Você já tem").replace(" Para trancar ou cancelar, procure a secretaria.", " Procure a secretaria.") });
  return sucesso(
    await executarEmTransacao(async (tx) => {
      await tx.matricula.delete({ where: { estudanteId_turmaId: { estudanteId: estudante.id, turmaId } } });
      const contexto = await turmaParaAuditoria(turmaId, tx);
      await auditar(tx, { autorId: estudante.id, acao: "rematricula.cancelada", ...contexto, descricao: `${estudante.nome} cancelou a matrícula em ${contexto.rotulo}` });
      return { turmaId };
    }),
  );
}

// AC-038-08: janela da rematrícula do período aberto (secretaria).
export async function definirJanela(periodoId: string, entrada: Record<string, unknown>, administradorId: string) {
  const periodo = await prisma.periodoLetivo.findUnique({ where: { id: periodoId }, select: { nome: true, status: true, rematriculaInicio: true, rematriculaFim: true } });
  if (!periodo) return falha({ tipo: "nao-encontrado", erro: "Período não encontrado." });
  if (periodo.status !== "Aberto") return falha({ tipo: "conflito", erro: `O período ${periodo.nome} está encerrado.` });
  const validacao = validarJanela(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  const { inicio, fim } = validacao.dados;
  return sucesso(
    await executarEmTransacao(async (tx) => {
      await tx.periodoLetivo.update({ where: { id: periodoId }, data: { rematriculaInicio: inicio ? paraData(inicio) : null, rematriculaFim: fim ? paraData(fim) : null } });
      await auditar(tx, {
        autorId: administradorId,
        acao: "periodo.rematricula",
        descricao: inicio && fim ? `${periodo.nome}: rematrícula de ${dataBR(inicio)} a ${dataBR(fim)}` : `${periodo.nome}: rematrícula fechada`,
        antes: { inicio: periodo.rematriculaInicio ? deData(periodo.rematriculaInicio) : null, fim: periodo.rematriculaFim ? deData(periodo.rematriculaFim) : null },
        depois: { inicio, fim },
      });
      return { inicio, fim };
    }),
  );
}
