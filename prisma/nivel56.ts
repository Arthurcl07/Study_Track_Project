// Dados de demonstração dos Níveis 5 e 6 (SPEC-045 a SPEC-059). Idempotente: a cada execução, o estado da
// apresentação volta ao mesmo ponto.
// - SPEC-052: regra de avaliação padrão (6,0 · 5,0 · 75% · 5,0) e indicadores dos períodos abertos recalculados com
//   ela; períodos encerrados sem regra guardada recebem a padrão.
// - SPEC-045: encarregado de dados da instituição. As contas da apresentação já aceitaram os termos e viram o tour,
//   menos a da coordenadora (Marina), que mostra o primeiro acesso: aceite, depois o tour.
// - Aluno da apresentação (Lucas Ferreira): uma disciplina em Risco com plano de recuperação do professor Carlos, uma
//   em Atenção e duas em Normal, e ainda sem o aceite dos termos (mostra o primeiro acesso do lado do estudante).
// - SPEC-046: nenhum e-mail bloqueado. SPEC-058: os alunos importados numa demonstração anterior são removidos,
//   para a importação de exemplo (docs/exemplos) poder ser repetida.
import { VERSAO_TERMOS } from "../src/domain/lgpd";
import { REGRA_PADRAO } from "../src/domain/situacao-academica";
import { hojeEmBrasilia } from "../src/domain/atividades";
import { recalcularIndicador } from "../src/server/academico/indicador";
import { aplicarRegra } from "../src/server/academico/regras";
import { salvarConta } from "../src/server/auth/contas";
import { recalcularFrequencia } from "../src/server/dados/chamada";
import { prisma } from "../src/server/dados/prisma";
import { regraParaGuardar } from "../src/server/dados/regras";

const CONTAS_COM_ACEITE = [
  "admin@studytrack.test", "professor@studytrack.test", "estudante@studytrack.test", "carla.mendes@studytrack.test",
  "ana.souza@studytrack.test", "henrique.dias@studytrack.test",
];
const CONTA_DO_PRIMEIRO_ACESSO = "coordenador@studytrack.test";
export const DOMINIO_DO_SISTEMA_ANTERIOR = "@anterior.faculdade-exemplo.test";

export async function exemplosDosNiveis5e6() {
  await prisma.instituicao.updateMany({
    where: { id: 1 },
    data: { ...REGRA_PADRAO, encarregadoNome: "Renata Duarte", encarregadoEmail: "privacidade@faculdade-exemplo.test" },
  });
  const mudancas = await prisma.$transaction((tx) => aplicarRegra({ periodoLetivo: { status: "Aberto" } }, REGRA_PADRAO, tx), { timeout: 120_000, maxWait: 10_000 });
  await prisma.periodoLetivo.updateMany({ where: { status: "Encerrado", regraMediaMinima: null }, data: regraParaGuardar(REGRA_PADRAO) });

  const contas = await prisma.usuario.findMany({ where: { email: { in: [...CONTAS_COM_ACEITE, CONTA_DO_PRIMEIRO_ACESSO] } }, select: { id: true, email: true } });
  const comAceite = contas.filter((c) => c.email !== CONTA_DO_PRIMEIRO_ACESSO).map((c) => c.id);
  await prisma.aceiteTermos.createMany({ data: comAceite.map((usuarioId) => ({ usuarioId, versao: VERSAO_TERMOS })), skipDuplicates: true });
  await prisma.usuario.updateMany({ where: { id: { in: comAceite }, tourVistoEm: null }, data: { tourVistoEm: new Date() } });
  const primeiro = contas.find((c) => c.email === CONTA_DO_PRIMEIRO_ACESSO);
  if (primeiro) {
    await prisma.aceiteTermos.deleteMany({ where: { usuarioId: primeiro.id } });
    await prisma.usuario.update({ where: { id: primeiro.id }, data: { tourVistoEm: null } });
  }

  await alunoDaApresentacao();
  await prisma.tentativaLogin.deleteMany({});
  const importados = await prisma.usuario.deleteMany({ where: { email: { endsWith: DOMINIO_DO_SISTEMA_ANTERIOR } } });

  const mudaram = mudancas.total - mudancas.semMudanca;
  console.log(
    `Níveis 5 e 6 prontos: regra padrão (${mudaram} indicador(es) corrigido(s)), encarregado de dados, aceite das contas da apresentação (Marina mostra o primeiro acesso)` +
      (importados.count ? `, ${importados.count} aluno(s) importado(s) removido(s)` : "") + ".",
  );
}

// Aluno da apresentação: as três situações no mesmo dashboard e um plano de recuperação. Notas e presenças dele voltam
// a estes valores a cada execução (as turmas são as da simulação, que o povoamento não recalcula para ele).
export const ALUNO_DA_APRESENTACAO = "lucas.ferreira@studytrack.test";
const DESEMPENHO: { turma: string; nota: number; frequencia: number }[] = [
  { turma: "Turma MS-A", nota: 3.5, frequencia: 85 }, // Risco (média abaixo de 5,0), com plano do Carlos
  { turma: "Turma BD-A", nota: 5.5, frequencia: 90 }, // Atenção
  { turma: "Turma SO-B", nota: 7.5, frequencia: 95 }, // Normal
  { turma: "Turma CAL-ECO", nota: 8, frequencia: 100 }, // Normal
];
const ITENS_DO_PLANO = ["Refazer a lista de exercícios", "Plantão de dúvidas com o professor", "Resumo do conteúdo da Prova 1", "Simulado antes da Prova 2"];

async function alunoDaApresentacao() {
  const curso = await prisma.curso.findFirst({ where: { nome: "Engenharia da Computação" }, select: { id: true } });
  if (!curso) return;
  const aluno = await salvarConta({ nome: "Lucas Ferreira", email: ALUNO_DA_APRESENTACAO, senha: "StudyTrack@2026", perfil: "Estudante", cursoId: curso.id });
  const hoje = hojeEmBrasilia();
  for (const d of DESEMPENHO) {
    const turma = await prisma.turma.findFirst({ where: { nome: d.turma, periodo: "2026/2", cursoId: curso.id }, select: { id: true, professorId: true } });
    if (!turma) continue;
    await prisma.matricula.upsert({ where: { estudanteId_turmaId: { estudanteId: aluno.id, turmaId: turma.id } }, update: { situacao: "Cursando" }, create: { estudanteId: aluno.id, turmaId: turma.id } });
    const avaliacoes = await prisma.avaliacao.findMany({ where: { turmaId: turma.id, tipo: { in: ["Prova", "Trabalho"] }, data: { lt: new Date(`${hoje}T00:00:00Z`) } }, select: { id: true } });
    for (const a of avaliacoes) {
      await prisma.nota.upsert({ where: { avaliacaoId_estudanteId: { avaliacaoId: a.id, estudanteId: aluno.id } }, update: { valor: d.nota }, create: { avaliacaoId: a.id, estudanteId: aluno.id, valor: d.nota } });
    }
    const aulas = await prisma.aula.findMany({ where: { turmaId: turma.id }, select: { id: true }, orderBy: [{ data: "asc" }, { numero: "asc" }] });
    const faltas = aulas.length - Math.round((d.frequencia / 100) * aulas.length);
    await prisma.presenca.deleteMany({ where: { estudanteId: aluno.id, aula: { turmaId: turma.id } } });
    // Faltas espalhadas pelo semestre (nenhuma nas últimas aulas, para não entrar na evasão).
    await prisma.presenca.createMany({ data: aulas.map((a, k) => ({ aulaId: a.id, estudanteId: aluno.id, presente: !(faltas > 0 && k < aulas.length - 4 && k % Math.max(1, Math.floor((aulas.length - 4) / faltas)) === 0 && k / Math.max(1, Math.floor((aulas.length - 4) / faltas)) < faltas) })) });
    // Entregas no prazo, menos as 2 últimas da disciplina em Risco (ficam atrasadas).
    const vencidas = await prisma.atividade.findMany({ where: { turmaId: turma.id, prazo: { lt: new Date(`${hoje}T00:00:00Z`) } }, select: { id: true, prazo: true }, orderBy: { prazo: "asc" } });
    const atrasadas = d.nota < 5 ? new Set(vencidas.slice(-2).map((v) => v.id)) : new Set<string>();
    await prisma.entrega.deleteMany({ where: { estudanteId: aluno.id, atividade: { turmaId: turma.id } } });
    await prisma.entrega.createMany({ data: vencidas.filter((v) => !atrasadas.has(v.id)).map((v) => ({ atividadeId: v.id, estudanteId: aluno.id, dataEntrega: v.prazo })) });
    await recalcularFrequencia(aluno.id, turma.id, prisma);
    await recalcularIndicador(aluno.id, turma.id);
    if (d.nota < 5 && !(await prisma.planoRecuperacao.findFirst({ where: { estudanteId: aluno.id, turmaId: turma.id, status: "Ativo" } }))) {
      await prisma.planoRecuperacao.create({
        data: {
          estudanteId: aluno.id,
          turmaId: turma.id,
          professorId: turma.professorId,
          itens: { create: ITENS_DO_PLANO.map((descricao, ordem) => ({ descricao, ordem, concluido: ordem === 0, concluidoEm: ordem === 0 ? new Date() : null })) },
        },
      });
    }
  }
  // Primeiro acesso do lado do estudante: sem aceite; o tour já foi visto (a Marina mostra o tour).
  await prisma.aceiteTermos.deleteMany({ where: { usuarioId: aluno.id } });
  await prisma.usuario.update({ where: { id: aluno.id }, data: { tourVistoEm: new Date(), trocarSenha: false } });
}
