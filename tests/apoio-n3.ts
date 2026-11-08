// Apoio dos testes do Nível 3 (SPEC-036 a SPEC-043): sessão, sala, disciplina na matriz e aprovação em período encerrado.
import { randomUUID } from "node:crypto";
import type { Perfil } from "@/domain/perfil";
import { recalcularIndicador } from "@/server/academico/indicador";
import type { Sessao } from "@/server/auth/token";
import { paraData } from "@/server/dados/atividades";
import { prisma } from "@/server/dados/prisma";
import { PREFIXO_DISCIPLINA_TESTE, criarPeriodoDeTeste, criarUsuarioDeTeste } from "./apoio";

export const sessao = (usuarioId: string, perfil: Perfil) => ({ usuarioId, nome: "Teste", perfil }) as Sessao;

// Salas de teste com o prefixo (apagadas em removerUsuariosDeTeste, depois das turmas).
export function salaDeTeste(capacidade = 40) {
  return prisma.sala.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}sala-${randomUUID().slice(0, 8)}`, capacidade } });
}

export function disciplinaNoCurso(cursoId: string, cargaHoraria = 60, linha: { semestre?: number; obrigatoria?: boolean } = {}) {
  return prisma.disciplina.create({
    data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria, cursos: { create: { cursoId, semestre: linha.semestre ?? null, obrigatoria: linha.obrigatoria ?? true } } },
  });
}

export function turmaNoPeriodo(dados: { periodo: string; disciplinaId: string; professorId: string; cursoId: string; vagas?: number }) {
  return prisma.turma.create({ data: { nome: `T-${randomUUID().slice(0, 6)}`, ...dados } });
}

// Aprovação pela regra única do histórico (RB-24): turma de período encerrado com média 8 e 90% de frequência.
export async function aprovarEm(estudanteId: string, disciplinaId: string, cursoId: string) {
  const encerrado = await criarPeriodoDeTeste("Encerrado");
  const professor = await criarUsuarioDeTeste("Professor");
  const turma = await turmaNoPeriodo({ periodo: encerrado.nome, disciplinaId, professorId: professor.id, cursoId });
  await prisma.matricula.create({ data: { estudanteId, turmaId: turma.id } });
  const prova = await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "P1", peso: 1, data: new Date(), tipo: "Prova" } });
  await prisma.nota.create({ data: { avaliacaoId: prova.id, estudanteId, valor: 8 } });
  await prisma.frequencia.create({ data: { estudanteId, turmaId: turma.id, percentual: 90 } });
  await recalcularIndicador(estudanteId, turma.id);
  return turma;
}

export async function janelaDeRematricula(periodoId: string, inicio: string, fim: string) {
  await prisma.periodoLetivo.update({ where: { id: periodoId }, data: { rematriculaInicio: paraData(inicio), rematriculaFim: paraData(fim) } });
}
