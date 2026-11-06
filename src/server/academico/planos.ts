// Casos de uso da SPEC-008: dashboard da turma (RF-13) e plano de recuperação (RF-14, UC-04).
// Quem pode: Professor responsável pela turma (conferido na rota pelo perfil e aqui pela query, ADR-003).
import { MENSAGEM_FORA_DE_RISCO, podeReceberPlano, progressoDoPlano, validarItensPlano, type Progresso } from "@/domain/plano";
import type { Situacao } from "@/domain/situacao-academica";
import { METAS, notaNecessaria, type NotaNecessaria } from "@/domain/simulador";
import { auditar, nomeDoUsuario, turmaParaAuditoria } from "@/server/dados/auditoria";
import { executarEmTransacao } from "@/server/dados/notas";
import { notificarPlano } from "@/server/dados/notificacoes";
import * as dados from "@/server/dados/planos";
import type { Falha, Resultado } from "./cadastros";
import { travaDoPeriodo } from "./periodos";

const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const falha = <T>(f: Falha): Resultado<T> => ({ ok: false, falha: f });
const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export type EstudanteDaTurma = {
  id: string;
  nome: string;
  media: number | null;
  frequencia: number | null;
  situacao: Situacao | null;
  plano: { id: string; status: "Ativo" | "Encerrado"; progresso: Progresso } | null;
  // SPEC-023 (AC-023-07): nota necessária nas avaliações sem nota para a média chegar a 6,0.
  precisa: NotaNecessaria;
};

export type DashboardTurma = {
  id: string;
  nome: string;
  periodo: string;
  disciplina: string;
  contagem: { Normal: number; Atencao: number; Risco: number; SemDados: number };
  estudantes: EstudanteDaTurma[];
};

// Contrato "Consultar turma" (RF-13, AC-008-01): só os estudantes dessa turma, com indicador vigente.
export async function consultarTurmaDoProfessor(professorId: string, turmaId: string): Promise<DashboardTurma | null> {
  const turma = await dados.turmaDoProfessorParaDashboard(professorId, turmaId);
  if (!turma) return null;
  const contagem = { Normal: 0, Atencao: 0, Risco: 0, SemDados: 0 };
  const estudantes = turma.matriculas.map(({ estudante }) => {
    const indicador = turma.indicadores.find((i) => i.estudanteId === estudante.id);
    // Plano mais recente do estudante nesta turma (ativo tem prioridade sobre encerrado).
    const planos = turma.planos.filter((p) => p.estudanteId === estudante.id);
    const plano = planos.find((p) => p.status === "Ativo") ?? planos[0] ?? null;
    contagem[indicador?.situacao ?? "SemDados"] += 1;
    return {
      id: estudante.id,
      nome: estudante.nome,
      media: indicador?.media ?? null,
      frequencia: indicador?.frequenciaAtual ?? null,
      situacao: indicador?.situacao ?? null,
      plano: plano ? { id: plano.id, status: plano.status, progresso: progressoDoPlano(plano.itens) } : null,
      precisa: notaNecessaria(turma.avaliacoes.map((a) => ({ nome: a.nome, peso: a.peso, nota: a.notas.find((n) => n.estudanteId === estudante.id)?.valor ?? null })), METAS.normal),
    };
  });
  return { id: turma.id, nome: turma.nome, periodo: turma.periodo, disciplina: turma.disciplina.nome, contagem, estudantes };
}

// Contrato "Criar plano" (RF-14, UC-04): estudante em Risco (RB-11), 1+ itens, sem plano ativo (INV-008-05).
export async function criarPlano(entrada: Record<string, unknown>, professorId: string) {
  const turmaId = texto(entrada.turmaId);
  const estudanteId = texto(entrada.estudanteId);
  if (!turmaId || !estudanteId) return falha({ tipo: "invalido", erros: { selecao: "Escolha a turma e o estudante." } });

  const alvo = await dados.estudanteParaPlano(professorId, turmaId, estudanteId);
  if (!alvo) return falha({ tipo: "fora-do-escopo" });
  const trava = await travaDoPeriodo({ id: turmaId });
  if (trava) return falha(trava);
  if (!podeReceberPlano(alvo.indicadores[0]?.situacao)) {
    return falha({ tipo: "invalido", erros: { selecao: MENSAGEM_FORA_DE_RISCO } });
  }

  const itens = validarItensPlano(entrada.itens);
  if (!itens.ok) return falha({ tipo: "invalido", erros: itens.erros });

  try {
    // INV-008-02: o professor do plano é sempre o professor responsável pela turma (o próprio solicitante).
    const plano = await executarEmTransacao(async (tx) => {
      const criado = await dados.criarPlano({ estudanteId, turmaId, professorId, itens: itens.dados }, tx);
      const contexto = await turmaParaAuditoria(turmaId, tx);
      const estudante = await nomeDoUsuario(estudanteId, tx);
      // SPEC-022 (AC-022-04): o estudante é avisado do plano criado.
      await notificarPlano(tx, estudanteId, turmaId, itens.dados.length);
      await auditar(tx, { autorId: professorId, acao: "plano.criado", ...contexto, descricao: `${estudante} em ${contexto.rotulo}, ${itens.dados.length} item(ns)`, depois: { itens: itens.dados } });
      return criado;
    });
    const { itens: criados, ...resto } = plano;
    return sucesso({ ...resto, progresso: progressoDoPlano(criados) });
  } catch (erro) {
    if ((erro as { code?: string }).code === "P2002") {
      return falha({ tipo: "conflito", erro: "Este estudante já tem um plano ativo nesta turma. Encerre-o antes de criar outro." });
    }
    throw erro;
  }
}

// Contrato "Marcar item" (RB-12, OPEN-003): só em plano Ativo (INV-008-06); devolve o progresso recalculado.
export async function marcarItemDoPlano(itemId: string, entrada: Record<string, unknown>, professorId: string) {
  const item = await dados.itemDoProfessor(professorId, itemId);
  if (!item) return falha({ tipo: "fora-do-escopo" });
  const trava = await travaDoPeriodo({ planos: { some: { itens: { some: { id: itemId } } } } });
  if (trava) return falha(trava);
  if (item.plano.status !== "Ativo") return falha({ tipo: "conflito", erro: "Plano encerrado: os itens não podem mais ser alterados." });
  if (typeof entrada.concluido !== "boolean") return falha({ tipo: "invalido", erros: { concluido: "Informe se o item está concluído." } });
  const concluido = entrada.concluido;

  const atualizado = await executarEmTransacao(async (tx) => {
    const marcado = await dados.marcarItem(itemId, concluido, tx);
    const contexto = await turmaParaAuditoria(item.plano.turmaId, tx);
    await auditar(tx, {
      autorId: professorId,
      acao: "plano.item",
      ...contexto,
      descricao: `${item.plano.estudante.nome} (${contexto.rotulo}): "${item.descricao}" ${concluido ? "concluído" : "desmarcado"}`,
      antes: { concluido: item.concluido },
      depois: { concluido },
    });
    return marcado;
  });
  return sucesso({ item: atualizado, progresso: progressoDoPlano(await dados.itensDoPlano(item.planoId)) });
}

// Contrato "Encerrar plano" (OPEN-012): decisão do professor; encerrado fica somente leitura.
export async function encerrarPlanoDoProfessor(planoId: string, professorId: string) {
  const plano = await dados.planoDoProfessor(professorId, planoId);
  if (!plano) return falha({ tipo: "fora-do-escopo" });
  const trava = await travaDoPeriodo({ planos: { some: { id: planoId } } });
  if (trava) return falha(trava);
  if (plano.status === "Encerrado") return falha({ tipo: "conflito", erro: "Este plano já está encerrado." });
  return sucesso(
    await executarEmTransacao(async (tx) => {
      const encerrado = await dados.encerrarPlano(planoId, tx);
      const contexto = await turmaParaAuditoria(plano.turma.id, tx);
      await auditar(tx, { autorId: professorId, acao: "plano.encerrado", ...contexto, descricao: `${plano.estudante.nome} em ${contexto.rotulo}` });
      return encerrado;
    }),
  );
}

// Detalhe do plano para a tela, com a situação atual do estudante (aviso de saída do Risco, OPEN-012).
export async function consultarPlano(planoId: string, professorId: string) {
  const plano = await dados.planoDoProfessor(professorId, planoId);
  if (!plano) return null;
  const indicador = await dados.indicadorDoEstudanteNaTurma(plano.estudanteId, plano.turmaId);
  return { ...plano, progresso: progressoDoPlano(plano.itens), indicador };
}
