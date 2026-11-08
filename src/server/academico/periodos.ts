// Casos de uso dos períodos letivos (SPEC-017, RF-26, UC-17). Quem pode: Administrador, verificado nas rotas
// pela matriz de autorização (INV-017-06). A trava (RB-20) é usada por todas as escritas acadêmicas.
import type { Prisma } from "@prisma/client";
import { MENSAGEM_PERIODO_EM_USO, mensagemPeriodoEncerrado, validarPeriodo } from "@/domain/periodos";
import { auditar } from "@/server/dados/auditoria";
import { executarEmTransacao } from "@/server/dados/notas";
import * as dados from "@/server/dados/periodos";
import type { Falha, Resultado } from "./cadastros";

const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const falha = <T>(f: Falha): Resultado<T> => ({ ok: false, falha: f });
const emUso = { tipo: "invalido", erros: { nome: MENSAGEM_PERIODO_EM_USO } } as const;

export const listarPeriodos = dados.listarPeriodos;

// AC-017-01 / AC-017-02: formato AAAA/1 ou AAAA/2 e nome único; nasce Aberto.
export async function criarPeriodo(entrada: Record<string, unknown>, autorId: string) {
  const validacao = validarPeriodo(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  if (await dados.periodoPorNome(validacao.dados.nome)) return falha(emUso);
  try {
    return sucesso(
      await executarEmTransacao(async (tx) => {
        const periodo = await dados.criarPeriodo(validacao.dados.nome, tx);
        await auditar(tx, { autorId, acao: "periodo.criado", descricao: periodo.nome, depois: { status: periodo.status } });
        return periodo;
      }),
    );
  } catch (erro) {
    if ((erro as { code?: string }).code === "P2002") return falha(emUso);
    throw erro;
  }
}

export async function mudarStatusDoPeriodo(id: string, status: "Aberto" | "Encerrado", autorId: string) {
  const periodo = await dados.buscarPeriodo(id);
  if (!periodo) return falha({ tipo: "nao-encontrado", erro: "Período não encontrado." });
  return sucesso(
    await executarEmTransacao(async (tx) => {
      const novo = await dados.mudarStatus(id, status, tx);
      const turmas = novo._count.turmas;
      await auditar(tx, {
        autorId,
        acao: status === "Encerrado" ? "periodo.encerrado" : "periodo.reaberto",
        descricao: status === "Encerrado" ? `${novo.nome} (${turmas} turma(s) ficam somente leitura)` : `${novo.nome} (${turmas} turma(s) voltam a aceitar lançamentos)`,
        antes: { status: periodo.status },
        depois: { status: novo.status },
      });
      return novo;
    }),
  );
}

// RB-20: falha "conflito" quando a turma (identificada pelo filtro) é de período encerrado; null se pode escrever.
// SPEC-039 / RB-37: também quando o diário da turma está fechado ou homologado (salvo nas ações do próprio diário).
export async function travaDoPeriodo(turma: Prisma.TurmaWhereInput, opcoes: { ignorarDiario?: boolean } = {}): Promise<Falha | null> {
  const encerrado = await dados.periodoEncerradoDaTurma(turma);
  if (encerrado) return { tipo: "conflito", erro: mensagemPeriodoEncerrado(encerrado) };
  if (opcoes.ignorarDiario) return null;
  const diario = await dados.diarioTravadoDaTurma(turma);
  return diario
    ? { tipo: "conflito", erro: `O diário da ${diario.nome} está ${diario.diario === "Fechado" ? "fechado, aguardando homologação" : "homologado"}: a turma está somente leitura. Só a coordenação devolve ou reabre.` }
    : null;
}
