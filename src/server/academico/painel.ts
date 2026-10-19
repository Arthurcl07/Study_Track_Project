// Casos de uso das SPEC-006 (alertas) e SPEC-007 (painel do estudante). Só leitura: nada é gravado
// (OPEN-004, OPEN-011); o indicador persistido é lido sem recálculo (DA-05).
import { nivelDoAlerta, ordenarEvolucao, prioridadeDoAlerta, type NivelAlerta, type PontoEvolucao } from "@/domain/alertas";
import type { StatusEntrega } from "@/domain/atividades";
import type { Situacao } from "@/domain/situacao-academica";
import type { Sessao } from "@/server/auth/token";
import { indicadoresEmAlertaDoEscopo } from "@/server/dados/indicadores";
import { turmasDoPainel } from "@/server/dados/painel";
import { planosDoEstudante } from "@/server/dados/planos";
import { progressoDoPlano, type Progresso } from "@/domain/plano";
import { consultarAtividades } from "./atividades";

export type Alerta = {
  nivel: NivelAlerta;
  estudante: { id: string; nome: string };
  turma: { id: string; nome: string; disciplina: string; professor: string };
  media: number | null;
  frequencia: number | null;
  atualizadoEm: string;
};

// Contrato "Consultar alertas" (RF-12): estudante vê os próprios; professor, os das turmas que leciona.
export async function consultarAlertas(sessao: Sessao): Promise<Alerta[]> {
  if (sessao.perfil !== "Estudante" && sessao.perfil !== "Professor") return [];
  const indicadores = await indicadoresEmAlertaDoEscopo(sessao);
  return indicadores
    .flatMap((i) => {
      const nivel = nivelDoAlerta(i.situacao);
      if (!nivel) return [];
      return [{
        nivel,
        estudante: i.estudante,
        turma: { id: i.turma.id, nome: i.turma.nome, disciplina: i.turma.disciplina.nome, professor: i.turma.professor.nome },
        media: i.media,
        frequencia: i.frequenciaAtual,
        atualizadoEm: i.atualizadoEm.toISOString(),
      }];
    })
    .sort((a, b) => prioridadeDoAlerta(a.nivel) - prioridadeDoAlerta(b.nivel));
}

export type TurmaDoPainel = {
  id: string;
  nome: string;
  periodo: string;
  disciplina: string;
  professor: string;
  media: number | null;
  frequencia: number | null;
  situacao: Situacao | null;
  alerta: NivelAlerta | null;
  avaliacoesComNota: number;
  evolucao: PontoEvolucao[];
};

export type PlanoDoEstudante = {
  id: string;
  status: "Ativo" | "Encerrado";
  disciplina: string;
  turma: string;
  professor: string;
  criadoEm: string;
  encerradoEm: string | null;
  itens: { id: string; descricao: string; concluido: boolean }[];
  progresso: Progresso;
};

export type Painel = {
  turmas: TurmaDoPainel[];
  alertas: Alerta[];
  // SPEC-012 / RF-19: só leitura; o progresso usa a mesma regra do professor (RB-12).
  planos: PlanoDoEstudante[];
  atividadesEmAtencao: { id: string; descricao: string; disciplina: string; prazo: string; status: StatusEntrega }[];
};

// Contrato "Consultar painel" (RF-10): só para o próprio estudante (INV-007-01).
export async function consultarPainel(sessao: Sessao): Promise<Painel> {
  if (sessao.perfil !== "Estudante") return { turmas: [], alertas: [], planos: [], atividadesEmAtencao: [] };

  const [turmas, alertas, atividades, planos] = await Promise.all([
    turmasDoPainel(sessao.usuarioId),
    consultarAlertas(sessao),
    consultarAtividades(sessao),
    planosDoEstudante(sessao.usuarioId),
  ]);

  return {
    turmas: turmas.map((t) => {
      const indicador = t.indicadores[0] ?? null;
      const evolucao = ordenarEvolucao(
        t.avaliacoes.flatMap((a) =>
          a.notas[0] ? [{ avaliacao: a.nome, data: a.data.toISOString().slice(0, 10), nota: a.notas[0].valor }] : [],
        ),
      );
      return {
        id: t.id,
        nome: t.nome,
        periodo: t.periodo,
        disciplina: t.disciplina.nome,
        professor: t.professor.nome,
        media: indicador?.media ?? null,
        frequencia: indicador?.frequenciaAtual ?? null,
        situacao: indicador?.situacao ?? null,
        alerta: nivelDoAlerta(indicador?.situacao),
        avaliacoesComNota: evolucao.length,
        evolucao,
      };
    }),
    alertas,
    planos: planos.map((p) => ({
      id: p.id,
      status: p.status,
      disciplina: p.turma.disciplina.nome,
      turma: p.turma.nome,
      professor: p.professor.nome,
      criadoEm: p.criadoEm.toISOString(),
      encerradoEm: p.encerradoEm ? p.encerradoEm.toISOString() : null,
      itens: p.itens,
      progresso: progressoDoPlano(p.itens),
    })),
    atividadesEmAtencao: atividades
      .map((a) => ({ id: a.id, descricao: a.descricao, disciplina: a.turma.disciplina, prazo: a.prazo, status: a.entregas[0]!.status }))
      .filter((a) => a.status !== "NoPrazo")
      .sort((a, b) => (a.status === b.status ? a.prazo.localeCompare(b.prazo) : a.status === "Atrasada" ? -1 : 1)),
  };
}
