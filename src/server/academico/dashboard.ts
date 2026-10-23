// Casos de uso dos dashboards do Estudante, do Professor e do Administrador (SPEC-016, RF-24, RF-25, UC-16).
// O do Coordenador é o painel da SPEC-014 com o filtro de curso (painel-coordenador.ts). Só leitura: nada é
// gravado (INV-016-06); os números por turma vêm da consolidação do relatório (INV-016-02).
import { hojeEmBrasilia } from "@/domain/atividades";
import { contarContas, dentroDosProximosDias, frequenciaGeral, mediaGeral, proximosPrazos, riscoSemPlano } from "@/domain/dashboard";
import { progressoDoPlano } from "@/domain/plano";
import type { Sessao } from "@/server/auth/token";
import { listarCursos } from "@/server/dados/cursos";
import * as dados from "@/server/dados/dashboard";
import { filtroTurmasDoEscopo, listarTurmasDoEscopo } from "@/server/dados/estrutura";
import { consultarAtividades } from "./atividades";
import { consultarAlertas, consultarPainel } from "./painel";
import { gerarRelatorio } from "./relatorios";

// RF-24 (estudante): painel da SPEC-007 + curso, médias gerais, contagens e próximos prazos (só os próprios, RB-02).
export async function consultarDashboardEstudante(sessao: Sessao, hoje = hojeEmBrasilia()) {
  const [painel, curso, atividades] = await Promise.all([consultarPainel(sessao), dados.cursoDoEstudante(sessao.usuarioId), consultarAtividades(sessao, hoje)]);
  const minhas = atividades.map((a) => ({
    id: a.id,
    descricao: a.descricao,
    disciplina: a.turma.disciplina,
    prazo: a.prazo,
    entregue: a.entregas[0]?.dataEntrega !== null && a.entregas[0]?.dataEntrega !== undefined,
  }));
  return {
    ...painel,
    curso,
    resumo: {
      mediaGeral: mediaGeral(painel.turmas),
      frequenciaGeral: frequenciaGeral(painel.turmas),
      turmasEmRisco: painel.turmas.filter((t) => t.situacao === "Risco").length,
      turmasEmAtencao: painel.turmas.filter((t) => t.situacao === "Atencao").length,
      pendentes: painel.atividadesEmAtencao.filter((a) => a.status === "Pendente").length,
      atrasadas: painel.atividadesEmAtencao.filter((a) => a.status === "Atrasada").length,
    },
    proximosPrazos: proximosPrazos(minhas, hoje),
    hoje,
  };
}

export type DashboardEstudante = Awaited<ReturnType<typeof consultarDashboardEstudante>>;

// RF-24 (professor): turmas que leciona (RB-03), com os mesmos números do relatório (INV-016-02).
export async function consultarDashboardProfessor(sessao: Sessao, hoje = hojeEmBrasilia()) {
  const escopo = filtroTurmasDoEscopo(sessao);
  const [turmas, relatorio, alertas, atividades, planos, emRisco] = await Promise.all([
    listarTurmasDoEscopo(sessao),
    gerarRelatorio(sessao, {}, hoje),
    consultarAlertas(sessao),
    consultarAtividades(sessao, hoje),
    dados.planosAtivos(escopo),
    dados.matriculasEmRisco(escopo),
  ]);
  const resumo = relatorio.ok ? relatorio.relatorio.resumo : [];
  const soma = (f: (r: (typeof resumo)[number]) => number) => resumo.reduce((s, r) => s + f(r), 0);
  const planosComProgresso = planos.map((p) => ({ id: p.id, estudante: p.estudante.nome, turma: p.turma.nome, progresso: progressoDoPlano(p.itens) }));
  return {
    totais: {
      turmas: turmas.length,
      cursos: new Set(turmas.map((t) => t.curso.id)).size,
      estudantes: new Set(turmas.flatMap((t) => (t.estudantes ?? []).map((e) => e.id))).size,
      emRisco: soma((r) => r.contagem.Risco),
      emAtencao: soma((r) => r.contagem.Atencao),
      entregasAtrasadas: soma((r) => r.entregasAtrasadas),
      planosAtivos: planos.length,
      progressoMedio: planosComProgresso.length === 0 ? null : Math.round(planosComProgresso.reduce((s, p) => s + p.progresso.percentual, 0) / planosComProgresso.length),
    },
    turmas,
    resumo,
    alertas,
    planos: planosComProgresso,
    semPlano: riscoSemPlano(emRisco, planos).map((r) => ({ estudante: r.estudante.nome, turma: r.turma.nome })),
    proximosPrazos: atividades
      .filter((a) => dentroDosProximosDias(a.prazo, hoje))
      .sort((a, b) => a.prazo.localeCompare(b.prazo))
      .map((a) => ({
        id: a.id,
        descricao: a.descricao,
        turma: a.turma.nome,
        prazo: a.prazo,
        entregues: a.entregas.filter((e) => e.dataEntrega !== null).length,
        total: a.entregas.length,
      })),
  };
}

export type DashboardProfessor = Awaited<ReturnType<typeof consultarDashboardProfessor>>;

// RF-25 (administrador): só contas e estrutura dos cursos, nenhum dado acadêmico (RB-13, INV-016-05).
export async function consultarDashboardAdministrador() {
  const [contas, recentes, cursos] = await Promise.all([dados.contasParaContagem(), dados.contasRecentes(5), listarCursos()]);
  return {
    contas: contarContas(contas),
    recentes: recentes.map((c) => ({ ...c, criadaEm: c.criadaEm.toISOString() })),
    cursos,
    coordenadores: new Set(cursos.map((c) => c.coordenador.id)).size,
  };
}

export type DashboardAdministrador = Awaited<ReturnType<typeof consultarDashboardAdministrador>>;
