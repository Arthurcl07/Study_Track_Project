// Matriz curricular, integralização, aproveitamento e conclusão (SPEC-037, SPEC-042, RF-45, RF-50, RF-51, UC-34,
// UC-39). Matriz: coordenador do curso (escopo na query). Curso do estudante: o próprio, o coordenador do curso e a
// secretaria. Aproveitamento: secretaria. Toda escrita com auditoria na transação (RB-22).
import { ehAprovado } from "@/domain/documentos";
import {
  ROTULO_SITUACAO_MATRIZ,
  criaCiclo,
  integralizacao,
  situacaoNaMatriz,
  validarAproveitamento,
  validarLinhaDaMatriz,
  type DisciplinaDaMatriz,
  type HistoricoDoEstudante,
} from "@/domain/matriz";
import type { Sessao } from "@/server/auth/token";
import { auditar } from "@/server/dados/auditoria";
import type { ClienteBanco } from "@/server/dados/indicadores";
import { executarEmTransacao } from "@/server/dados/notas";
import { prisma } from "@/server/dados/prisma";
import type { Falha, Resultado } from "./cadastros";
import { turmasDoEstudante } from "./documentos";

const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const falha = <T>(f: Falha): Resultado<T> => ({ ok: false, falha: f });

export async function matrizDoCurso(cursoId: string, db: ClienteBanco = prisma): Promise<DisciplinaDaMatriz[]> {
  const grade = await db.cursoDisciplina.findMany({
    where: { cursoId },
    select: { disciplinaId: true, semestre: true, obrigatoria: true, disciplina: { select: { nome: true, cargaHoraria: true } }, requisitos: { select: { requisitoId: true } } },
  });
  return grade
    .map((g) => ({ disciplinaId: g.disciplinaId, nome: g.disciplina.nome, cargaHoraria: g.disciplina.cargaHoraria, semestre: g.semestre, obrigatoria: g.obrigatoria, requisitos: g.requisitos.map((r) => r.requisitoId) }))
    .sort((a, b) => (a.semestre ?? 99) - (b.semestre ?? 99) || a.nome.localeCompare(b.nome));
}

// AC-037-01 / AC-037-02 / AC-037-06: semestre, caráter e pré-requisitos sem ciclo, só em curso do coordenador.
export async function salvarLinhaDaMatriz(cursoId: string, disciplinaId: string, entrada: Record<string, unknown>, coordenadorId: string) {
  const curso = await prisma.curso.findFirst({ where: { id: cursoId, coordenadorId }, select: { id: true, nome: true } });
  if (!curso) return falha({ tipo: "nao-encontrado", erro: "Curso não encontrado." });
  const matriz = await matrizDoCurso(cursoId);
  const linha = matriz.find((d) => d.disciplinaId === disciplinaId);
  if (!linha) return falha({ tipo: "nao-encontrado", erro: "Disciplina fora da grade do curso." });
  const validacao = validarLinhaDaMatriz(entrada, disciplinaId, new Set(matriz.map((d) => d.disciplinaId)));
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  const { semestre, obrigatoria, requisitos } = validacao.dados;
  const arestas = new Map(matriz.map((d) => [d.disciplinaId, d.requisitos]));
  if (criaCiclo(arestas, disciplinaId, requisitos)) {
    return falha({ tipo: "invalido", erros: { requisitos: "Esses pré-requisitos criariam um ciclo (uma disciplina acabaria exigindo a si mesma)." } });
  }
  const nome = (id: string) => matriz.find((d) => d.disciplinaId === id)?.nome ?? id;
  return sucesso(
    await executarEmTransacao(async (tx) => {
      await tx.cursoDisciplina.update({ where: { cursoId_disciplinaId: { cursoId, disciplinaId } }, data: { semestre, obrigatoria } });
      await tx.preRequisito.deleteMany({ where: { cursoId, disciplinaId } });
      if (requisitos.length > 0) await tx.preRequisito.createMany({ data: requisitos.map((requisitoId) => ({ cursoId, disciplinaId, requisitoId })) });
      await auditar(tx, {
        autorId: coordenadorId,
        acao: "matriz.alterada",
        cursoId,
        descricao: `${curso.nome} · ${linha.nome}: ${semestre ? `${semestre}º semestre` : "sem semestre"}, ${obrigatoria ? "obrigatória" : "optativa"}${requisitos.length ? `, exige ${requisitos.map(nome).join(", ")}` : ""}`,
        antes: { semestre: linha.semestre, obrigatoria: linha.obrigatoria, requisitos: linha.requisitos.map(nome) },
        depois: { semestre, obrigatoria, requisitos: requisitos.map(nome) },
      });
      return { disciplinaId };
    }),
  );
}

// O que o estudante tem em cada disciplina: aprovação (regra única do histórico, RB-24), cursando, reprovação e aproveitamento.
export async function historicoParaMatriz(estudanteId: string): Promise<HistoricoDoEstudante> {
  const [linhas, aproveitamentos] = await Promise.all([turmasDoEstudante(estudanteId), prisma.aproveitamento.findMany({ where: { estudanteId }, select: { disciplinaId: true } })]);
  const aprovadas = new Set<string>();
  const cursando = new Set<string>();
  const reprovadas = new Set<string>();
  for (const l of linhas) {
    if (ehAprovado(l.resultado)) aprovadas.add(l.disciplinaId);
    else if (l.resultado === "EmCurso") cursando.add(l.disciplinaId);
    else if (l.resultado.startsWith("Reprovado")) reprovadas.add(l.disciplinaId);
  }
  return { aprovadas, cursando, reprovadas, aproveitadas: new Set(aproveitamentos.map((a) => a.disciplinaId)) };
}

export async function integralizacaoDoEstudante(estudanteId: string, cursoId: string) {
  const [matriz, historico] = await Promise.all([matrizDoCurso(cursoId), historicoParaMatriz(estudanteId)]);
  return { matriz, historico, integralizacao: integralizacao(matriz, historico) };
}

// AC-037-03 / AC-037-04: "Meu curso" — matriz por semestre com a situação de cada disciplina e a integralização.
// Quem vê: o próprio estudante, o coordenador do curso dele e a secretaria (escopo na query).
export async function consultarCursoDoEstudante(sessao: Sessao, estudanteId: string) {
  const escopo =
    sessao.perfil === "Estudante"
      ? { id: sessao.usuarioId }
      : sessao.perfil === "Coordenador"
        ? { curso: { coordenadorId: sessao.usuarioId } }
        : sessao.perfil === "Administrador"
          ? {}
          : null;
  if (!escopo) return null;
  const estudante = await prisma.usuario.findFirst({ where: { AND: [escopo, { id: estudanteId, perfil: "Estudante" }] }, select: { id: true, nome: true, cursoId: true, curso: { select: { nome: true } }, ficha: { select: { numeroMatricula: true } } } });
  if (!estudante?.cursoId) return null;
  const { matriz, historico, integralizacao: resumo } = await integralizacaoDoEstudante(estudante.id, estudante.cursoId);
  const nome = (id: string) => matriz.find((d) => d.disciplinaId === id)?.nome ?? "";
  const disciplinas = matriz.map((d) => {
    const s = situacaoNaMatriz(d, historico);
    return { ...d, situacao: s.situacao, rotulo: ROTULO_SITUACAO_MATRIZ[s.situacao], faltam: s.faltam.map(nome), requisitosNomes: d.requisitos.map(nome) };
  });
  const semestres = [...new Set(disciplinas.map((d) => d.semestre))].sort((a, b) => (a ?? 99) - (b ?? 99));
  return {
    estudante: { id: estudante.id, nome: estudante.nome, curso: estudante.curso?.nome ?? "", numeroMatricula: estudante.ficha?.numeroMatricula ?? null },
    integralizacao: resumo,
    aproveitamentos: historico.aproveitadas.size,
    semestres: semestres.map((s) => ({ semestre: s, disciplinas: disciplinas.filter((d) => d.semestre === s) })),
  };
}

export type CursoDoEstudante = NonNullable<Awaited<ReturnType<typeof consultarCursoDoEstudante>>>;

// ---------------------------------------------------------------- Aproveitamento (secretaria)

// AC-042-01 / AC-042-02 / INV-042-01: disciplina da matriz do curso do estudante, ainda não aprovada nem aproveitada.
export async function registrarAproveitamento(estudanteId: string, entrada: Record<string, unknown>, administradorId: string) {
  const estudante = await prisma.usuario.findFirst({ where: { id: estudanteId, perfil: "Estudante" }, select: { id: true, nome: true, cursoId: true } });
  if (!estudante?.cursoId) return falha({ tipo: "nao-encontrado", erro: "Estudante não encontrado." });
  const validacao = validarAproveitamento(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  const d = validacao.dados;
  const { matriz, historico } = await integralizacaoDoEstudante(estudanteId, estudante.cursoId);
  const disciplina = matriz.find((m) => m.disciplinaId === d.disciplinaId);
  if (!disciplina) return falha({ tipo: "invalido", erros: { disciplinaId: "A disciplina não está na matriz do curso do estudante." } });
  if (historico.aprovadas.has(d.disciplinaId)) return falha({ tipo: "conflito", erro: `O estudante já foi aprovado em ${disciplina.nome}.` });
  if (historico.aproveitadas.has(d.disciplinaId)) return falha({ tipo: "conflito", erro: `${disciplina.nome} já tem aproveitamento registrado.` });
  return sucesso(
    await executarEmTransacao(async (tx) => {
      const novo = await tx.aproveitamento.create({ data: { estudanteId, ...d, autorId: administradorId } });
      await auditar(tx, {
        autorId: administradorId,
        acao: "aproveitamento.registrado",
        cursoId: estudante.cursoId,
        descricao: `${estudante.nome}: ${disciplina.nome} aproveitada de ${d.instituicaoOrigem} (${d.disciplinaOrigem}, ${d.cargaHoraria} h)`,
        depois: d,
      });
      return { id: novo.id };
    }),
  );
}

export async function excluirAproveitamento(id: string, administradorId: string) {
  const a = await prisma.aproveitamento.findUnique({ where: { id }, select: { id: true, instituicaoOrigem: true, disciplinaOrigem: true, cargaHoraria: true, nota: true, disciplina: { select: { nome: true } }, estudante: { select: { nome: true, cursoId: true } } } });
  if (!a) return falha({ tipo: "nao-encontrado", erro: "Aproveitamento não encontrado." });
  return sucesso(
    await executarEmTransacao(async (tx) => {
      await tx.aproveitamento.delete({ where: { id } });
      await auditar(tx, { autorId: administradorId, acao: "aproveitamento.excluido", cursoId: a.estudante.cursoId, descricao: `${a.estudante.nome}: ${a.disciplina.nome} (${a.instituicaoOrigem})`, antes: { instituicaoOrigem: a.instituicaoOrigem, disciplinaOrigem: a.disciplinaOrigem, cargaHoraria: a.cargaHoraria, nota: a.nota } });
      return { id };
    }),
  );
}

export async function listarAproveitamentos(estudanteId: string) {
  const lista = await prisma.aproveitamento.findMany({ where: { estudanteId }, select: { id: true, instituicaoOrigem: true, disciplinaOrigem: true, nota: true, cargaHoraria: true, disciplina: { select: { id: true, nome: true } } }, orderBy: { registradoEm: "asc" } });
  return lista.map((a) => ({ id: a.id, disciplinaId: a.disciplina.id, disciplina: a.disciplina.nome, instituicaoOrigem: a.instituicaoOrigem, disciplinaOrigem: a.disciplinaOrigem, nota: a.nota, cargaHoraria: a.cargaHoraria }));
}
