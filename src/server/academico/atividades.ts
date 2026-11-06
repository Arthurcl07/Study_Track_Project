// Casos de uso da SPEC-005: cadastrar atividade, registrar e desfazer entrega,
// e consultar atividades com o status de entrega (a frequência passou para a chamada, SPEC-018). Quem pode escrever: Professor (OPEN-001, OPEN-003),
// conferido na rota; aqui fica o escopo da turma (RB-03), sempre dentro da própria query (ADR-003).
import { hojeEmBrasilia, statusEntrega, validarAtividade, validarDataEntrega, type StatusEntrega } from "@/domain/atividades";
import type { Sessao } from "@/server/auth/token";
import * as dados from "@/server/dados/atividades";
import { turmaLecionada } from "@/server/dados/notas";
import type { Falha, Resultado } from "./cadastros";
import { travaDoPeriodo } from "./periodos";

const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const falha = <T>(f: Falha): Resultado<T> => ({ ok: false, falha: f });

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

// Contrato "Cadastrar atividade" (RF-08): descrição e prazo, só em turma que o professor leciona.
export async function cadastrarAtividade(entrada: Record<string, unknown>, turmaId: string, professorId: string) {
  if (!(await turmaLecionada(professorId, turmaId))) return falha({ tipo: "fora-do-escopo" });
  const trava = await travaDoPeriodo({ id: turmaId });
  if (trava) return falha(trava);

  const validacao = validarAtividade(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });

  const atividade = await dados.criarAtividade(turmaId, validacao.dados);
  return sucesso({ ...atividade, prazo: dados.deData(atividade.prazo) });
}

// Contrato "Registrar entrega" (OPEN-003). INV-005-03: uma entrega por estudante e atividade.
export async function registrarEntrega(entrada: Record<string, unknown>, atividadeId: string, professorId: string) {
  const estudanteId = texto(entrada.estudanteId);
  if (!estudanteId) return falha({ tipo: "invalido", erros: { selecao: "Escolha o estudante." } });

  const atividade = await dados.atividadeParaEntrega(professorId, atividadeId, estudanteId);
  if (!atividade) return falha({ tipo: "fora-do-escopo" });
  const trava = await travaDoPeriodo({ atividades: { some: { id: atividadeId } } });
  if (trava) return falha(trava);

  const hoje = hojeEmBrasilia();
  const data = validarDataEntrega(entrada.dataEntrega, hoje);
  if (!data.ok) return falha({ tipo: "invalido", erros: data.erros });

  try {
    const entrega = await dados.criarEntrega(atividadeId, estudanteId, data.dados);
    const dataEntrega = dados.deData(entrega.dataEntrega);
    return sucesso({ ...entrega, dataEntrega, status: statusEntrega(dados.deData(atividade.prazo), dataEntrega, hoje) });
  } catch (erro) {
    if ((erro as { code?: string }).code === "P2002") {
      return falha({ tipo: "conflito", erro: "A entrega deste estudante já foi registrada. Desfaça o registro para corrigir a data." });
    }
    throw erro;
  }
}

// Contrato "Desfazer entrega" (OPEN-003): remove um registro feito por engano.
export async function desfazerEntrega(entregaId: string, professorId: string) {
  if (!(await dados.entregaDoProfessor(professorId, entregaId))) return falha({ tipo: "fora-do-escopo" });
  const trava = await travaDoPeriodo({ atividades: { some: { entregas: { some: { id: entregaId } } } } });
  if (trava) return falha(trava);
  return sucesso(await dados.removerEntrega(entregaId));
}

export type AtividadeComStatus = {
  id: string;
  descricao: string;
  prazo: string;
  turma: { id: string; nome: string; disciplina: string };
  entregas: { estudanteId: string; dataEntrega: string | null; status: StatusEntrega }[];
};

// Contrato "Consultar entregas" (RF-09): status calculado na leitura (OPEN-010) para quem tem escopo.
// Estudante: só a própria entrega (AC-005-09). Professor: todos os estudantes das turmas que leciona.
export async function consultarAtividades(sessao: Sessao, hoje = hojeEmBrasilia()): Promise<AtividadeComStatus[]> {
  if (sessao.perfil === "Estudante") {
    const atividades = await dados.atividadesDoEstudante(sessao.usuarioId);
    return atividades.map((a) => {
      const prazo = dados.deData(a.prazo);
      const dataEntrega = a.entregas[0] ? dados.deData(a.entregas[0].dataEntrega) : null;
      return {
        id: a.id,
        descricao: a.descricao,
        prazo,
        turma: { id: a.turma.id, nome: a.turma.nome, disciplina: a.turma.disciplina.nome },
        entregas: [{ estudanteId: sessao.usuarioId, dataEntrega, status: statusEntrega(prazo, dataEntrega, hoje) }],
      };
    });
  }
  if (sessao.perfil === "Professor") {
    const turmas = await dados.turmasComAtividades(sessao.usuarioId);
    return turmas.flatMap((t) =>
      t.atividades.map((a) => {
        const prazo = dados.deData(a.prazo);
        return {
          id: a.id,
          descricao: a.descricao,
          prazo,
          turma: { id: t.id, nome: t.nome, disciplina: t.disciplina.nome },
          entregas: t.matriculas.map(({ estudanteId }) => {
            const registro = a.entregas.find((e) => e.estudanteId === estudanteId);
            const dataEntrega = registro ? dados.deData(registro.dataEntrega) : null;
            return { estudanteId, dataEntrega, status: statusEntrega(prazo, dataEntrega, hoje) };
          }),
        };
      }),
    );
  }
  return [];
}
