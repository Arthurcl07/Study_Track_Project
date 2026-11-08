// Exportação de apoio ao Censo (SPEC-043, RF-52, UC-40). Só a secretaria (recurso secretaria, RB-13). A exportação
// vai para a auditoria com o período e o número de linhas, sem dados pessoais (INV-043-02).
import { resultadoDaTurma } from "@/domain/documentos";
import { gerarCsvCenso, type LinhaCenso } from "@/domain/censo";
import { ROTULO_SITUACAO_CURSO, type SituacaoCurso } from "@/domain/secretaria";
import { deData } from "@/server/dados/atividades";
import { auditar } from "@/server/dados/auditoria";
import { executarEmTransacao } from "@/server/dados/notas";
import { prisma } from "@/server/dados/prisma";
import type { Falha, Resultado } from "./cadastros";

const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const falha = <T>(f: Falha): Resultado<T> => ({ ok: false, falha: f });

export async function linhasDoCenso(periodo: string): Promise<LinhaCenso[] | null> {
  const p = await prisma.periodoLetivo.findUnique({ where: { nome: periodo }, select: { status: true } });
  if (!p) return null;
  const matriculas = await prisma.matricula.findMany({
    where: { turma: { periodo } },
    select: {
      situacao: true,
      estudanteId: true,
      estudante: { select: { nome: true, curso: { select: { nome: true } }, ficha: { select: { numeroMatricula: true, cpf: true, dataNascimento: true, situacaoCurso: true } } } },
      turma: { select: { id: true, nome: true, disciplina: { select: { nome: true, cargaHoraria: true } }, curso: { select: { nome: true } } } },
      indicador: { select: { media: true, frequenciaAtual: true } },
    },
    orderBy: [{ estudante: { nome: "asc" } }, { turma: { nome: "asc" } }],
  });
  const exames = await prisma.nota.findMany({ where: { avaliacao: { tipo: "Exame", turma: { periodo } } }, select: { estudanteId: true, valor: true, avaliacao: { select: { turmaId: true } } } });
  const exameDe = new Map(exames.map((e) => [`${e.estudanteId}:${e.avaliacao.turmaId}`, e.valor]));
  const encerrado = p.status === "Encerrado";
  return matriculas.map((m) => ({
    matricula: m.estudante.ficha?.numeroMatricula ?? "",
    nome: m.estudante.nome,
    cpf: m.estudante.ficha?.cpf ?? null,
    nascimento: m.estudante.ficha?.dataNascimento ? deData(m.estudante.ficha.dataNascimento) : null,
    curso: m.estudante.curso?.nome ?? m.turma.curso.nome,
    situacaoCurso: ROTULO_SITUACAO_CURSO[(m.estudante.ficha?.situacaoCurso ?? "Ativo") as SituacaoCurso],
    periodo,
    disciplina: m.turma.disciplina.nome,
    turma: m.turma.nome,
    cargaHoraria: m.turma.disciplina.cargaHoraria,
    frequencia: m.indicador?.frequenciaAtual ?? null,
    resultado: resultadoDaTurma({ encerrado, media: m.indicador?.media ?? null, frequencia: m.indicador?.frequenciaAtual ?? null, exame: exameDe.get(`${m.estudanteId}:${m.turma.id}`) ?? null, matricula: m.situacao }),
  }));
}

// AC-043-01 / AC-043-04: gera o CSV e registra a exportação.
export async function exportarCenso(periodo: unknown, administradorId: string) {
  const nome = typeof periodo === "string" ? periodo : "";
  const linhas = await linhasDoCenso(nome);
  if (!linhas) return falha<{ csv: string; linhas: number }>({ tipo: "invalido", erros: { periodo: "Escolha um período existente." } });
  await executarEmTransacao((tx) =>
    auditar(tx, { autorId: administradorId, acao: "censo.exportado", descricao: `Exportação de apoio ao Censo: ${nome}, ${linhas.length} linha(s) de ${new Set(linhas.map((l) => l.matricula)).size} estudante(s)`, depois: { periodo: nome, linhas: linhas.length } }),
  );
  return sucesso({ csv: gerarCsvCenso(linhas), linhas: linhas.length });
}
