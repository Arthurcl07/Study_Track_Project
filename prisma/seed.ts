// Carga inicial: contas de TESTE, uma por perfil (OPEN-013 — sem cadastro público na SPEC-001),
// uma turma de exemplo da SPEC-002 ligando as três contas e uma avaliação de exemplo nessa turma
// (SPEC-004, OPEN-017), sem nota, para o professor lançar pela tela, e duas atividades de exemplo
// (SPEC-005), além de dados de demonstração fictícios (ver dadosDeDemonstracao). Apenas para ambiente local.
import { hojeEmBrasilia } from "../src/domain/atividades";
import { recalcularIndicador } from "../src/server/academico/indicador";
import { salvarConta } from "../src/server/auth/contas";
import { paraData } from "../src/server/dados/atividades";
import { prisma } from "../src/server/dados/prisma";
import type { Perfil } from "../src/domain/perfil";

const SENHA_DE_TESTE = "StudyTrack@2026";

const CONTAS_DE_TESTE: { nome: string; email: string; perfil: Perfil }[] = [
  { nome: "Estudante de Teste", email: "estudante@studytrack.test", perfil: "Estudante" },
  { nome: "Professor de Teste", email: "professor@studytrack.test", perfil: "Professor" },
  { nome: "Coordenador de Teste", email: "coordenador@studytrack.test", perfil: "Coordenador" },
  // SPEC-010 (OPEN-025): primeiro administrador; só gerencia contas.
  { nome: "Admin de Teste", email: "admin@studytrack.test", perfil: "Administrador" },
];

const DISCIPLINA_EXEMPLO = { nome: "Modelagem de Software (exemplo)", cargaHoraria: 60 };
const TURMA_EXEMPLO = { nome: "Turma de exemplo", periodo: "2026/2" };
const AVALIACAO_EXEMPLO = { nome: "Prova 1 (exemplo)", peso: 1, data: new Date("2026-09-15T00:00:00Z") };

async function main() {
  const contas: Partial<Record<Perfil, { id: string }>> = {};
  for (const conta of CONTAS_DE_TESTE) {
    contas[conta.perfil] = await salvarConta({ ...conta, senha: SENHA_DE_TESTE });
    console.log(`Conta de teste pronta: ${conta.email} (${conta.perfil})`);
  }
  const { Estudante: estudante, Professor: professor, Coordenador: coordenador } = contas;
  if (!estudante || !professor || !coordenador) throw new Error("Contas de teste incompletas.");

  // Idempotente: reutiliza disciplina e turma de exemplo se já existirem.
  const disciplina =
    (await prisma.disciplina.findFirst({ where: { nome: DISCIPLINA_EXEMPLO.nome } })) ??
    (await prisma.disciplina.create({ data: DISCIPLINA_EXEMPLO }));
  const turma =
    (await prisma.turma.findFirst({ where: { nome: TURMA_EXEMPLO.nome, coordenadorId: coordenador.id } })) ??
    (await prisma.turma.create({
      data: { ...TURMA_EXEMPLO, disciplinaId: disciplina.id, professorId: professor.id, coordenadorId: coordenador.id },
    }));
  await prisma.matricula.upsert({
    where: { estudanteId_turmaId: { estudanteId: estudante.id, turmaId: turma.id } },
    update: {},
    create: { estudanteId: estudante.id, turmaId: turma.id },
  });
  console.log(`Turma de exemplo pronta: ${turma.nome} (${disciplina.nome})`);

  // Idempotente: só cria a avaliação de exemplo se a turma ainda não tiver uma com esse nome.
  const avaliacao =
    (await prisma.avaliacao.findFirst({ where: { nome: AVALIACAO_EXEMPLO.nome, turmaId: turma.id } })) ??
    (await prisma.avaliacao.create({ data: { ...AVALIACAO_EXEMPLO, turmaId: turma.id } }));
  console.log(`Avaliação de exemplo pronta: ${avaliacao.nome} (peso ${avaliacao.peso})`);

  // SPEC-005: uma atividade já vencida e uma com prazo futuro, sem entregas, para mostrar
  // os status Atrasada e Pendente. Idempotente pela descrição dentro da turma.
  const hoje = hojeEmBrasilia();
  const atividadesExemplo = [
    { descricao: "Lista de exercícios 1 (exemplo)", prazo: somarDias(hoje, -3) },
    { descricao: "Trabalho final (exemplo)", prazo: somarDias(hoje, 14) },
  ];
  for (const exemplo of atividadesExemplo) {
    const existente = await prisma.atividade.findFirst({ where: { descricao: exemplo.descricao, turmaId: turma.id } });
    if (!existente) {
      await prisma.atividade.create({ data: { turmaId: turma.id, descricao: exemplo.descricao, prazo: paraData(exemplo.prazo) } });
    }
    console.log(`Atividade de exemplo pronta: ${exemplo.descricao}`);
  }

  await dadosDeDemonstracao({ turma, disciplinaId: disciplina.id, avaliacaoId: avaliacao.id, professorId: professor.id, coordenadorId: coordenador.id, hoje });
}

// Dados de demonstração (fictícios): estudantes em Normal, Atenção, Risco e sem dados, para os
// dashboards, alertas e relatórios terem o que mostrar. A situação NÃO é escrita aqui: notas e
// frequência são gravadas e o indicador sai de recalcularIndicador (regra única, DA-02).
const ESTUDANTES_DEMO = [
  { nome: "Ana Souza", email: "ana.souza@studytrack.test" },
  { nome: "Bruno Costa", email: "bruno.costa@studytrack.test" },
  { nome: "Carla Mendes", email: "carla.mendes@studytrack.test" },
  { nome: "Diego Lima", email: "diego.lima@studytrack.test" },
  { nome: "Elisa Rocha", email: "elisa.rocha@studytrack.test" },
  { nome: "Felipe Alves", email: "felipe.alves@studytrack.test" },
  { nome: "Gabriela Nunes", email: "gabriela.nunes@studytrack.test" },
  { nome: "Henrique Dias", email: "henrique.dias@studytrack.test" },
] as const;

type NomeDemo = (typeof ESTUDANTES_DEMO)[number]["nome"];
// notas: uma por avaliação, na ordem das avaliações da turma; null = sem nota. frequencia null = sem registro.
type Desempenho = { notas: (number | null)[]; frequencia: number | null };

const TURMA_A: Partial<Record<NomeDemo, Desempenho>> = {
  "Ana Souza": { notas: [8, 9], frequencia: 92 },
  "Bruno Costa": { notas: [5, 6], frequencia: 88 },
  "Carla Mendes": { notas: [6, 6.4], frequencia: 70 },
  "Diego Lima": { notas: [7, 7], frequencia: 80 },
  "Elisa Rocha": { notas: [4, 4], frequencia: 85 },
  "Felipe Alves": { notas: [9, 9.2], frequencia: 96 },
  "Gabriela Nunes": { notas: [5.5, 6], frequencia: 90 },
  "Henrique Dias": { notas: [null, null], frequencia: null },
};

const TURMA_B: Partial<Record<NomeDemo, Desempenho>> = {
  "Ana Souza": { notas: [7.5], frequencia: 90 },
  "Bruno Costa": { notas: [8], frequencia: 95 },
  "Elisa Rocha": { notas: [5.2], frequencia: 78 },
  "Henrique Dias": { notas: [3.5], frequencia: 72 },
};

async function dadosDeDemonstracao(base: {
  turma: { id: string };
  disciplinaId: string;
  avaliacaoId: string;
  professorId: string;
  coordenadorId: string;
  hoje: string;
}) {
  // Segundo professor, para demonstrar a troca do professor da turma (SPEC-010, RF-17).
  await salvarConta({ nome: "Júlia Reis", email: "julia.reis@studytrack.test", senha: SENHA_DE_TESTE, perfil: "Professor" });

  const ids = {} as Record<NomeDemo, string>;
  for (const estudante of ESTUDANTES_DEMO) {
    ids[estudante.nome] = (await salvarConta({ ...estudante, senha: SENHA_DE_TESTE, perfil: "Estudante" })).id;
  }

  // Turma de exemplo: a Prova 1 do seed e mais um trabalho.
  const trabalho =
    (await prisma.avaliacao.findFirst({ where: { nome: "Trabalho 1 (exemplo)", turmaId: base.turma.id } })) ??
    (await prisma.avaliacao.create({ data: { turmaId: base.turma.id, nome: "Trabalho 1 (exemplo)", peso: 1, data: new Date("2026-10-05T00:00:00Z") } }));
  await registrarDesempenho(base.turma.id, [base.avaliacaoId, trabalho.id], TURMA_A, ids, base.professorId);

  // Segunda turma, para o relatório do coordenador ter mais de uma turma.
  const disciplinaB =
    (await prisma.disciplina.findFirst({ where: { nome: "Engenharia de Requisitos (exemplo)" } })) ??
    (await prisma.disciplina.create({ data: { nome: "Engenharia de Requisitos (exemplo)", cargaHoraria: 40 } }));
  const turmaB =
    (await prisma.turma.findFirst({ where: { nome: "Turma B (exemplo)", coordenadorId: base.coordenadorId } })) ??
    (await prisma.turma.create({
      data: { nome: "Turma B (exemplo)", periodo: "2026/2", disciplinaId: disciplinaB.id, professorId: base.professorId, coordenadorId: base.coordenadorId },
    }));
  const provaB =
    (await prisma.avaliacao.findFirst({ where: { nome: "Prova 1 (exemplo)", turmaId: turmaB.id } })) ??
    (await prisma.avaliacao.create({ data: { turmaId: turmaB.id, nome: "Prova 1 (exemplo)", peso: 1, data: new Date("2026-09-20T00:00:00Z") } }));
  await registrarDesempenho(turmaB.id, [provaB.id], TURMA_B, ids, base.professorId);
  console.log("Turma B de exemplo pronta: Engenharia de Requisitos (exemplo)");

  // Entregas da lista vencida: três no prazo e uma depois do prazo; os demais ficam Atrasada (OPEN-010).
  const lista = await prisma.atividade.findFirst({ where: { descricao: "Lista de exercícios 1 (exemplo)", turmaId: base.turma.id } });
  if (lista) {
    const noPrazo = somarDias(base.hoje, -4);
    const entregas: [NomeDemo, string][] = [["Ana Souza", noPrazo], ["Diego Lima", noPrazo], ["Felipe Alves", noPrazo], ["Carla Mendes", somarDias(base.hoje, -1)]];
    for (const [nome, data] of entregas) {
      await prisma.entrega.upsert({
        where: { atividadeId_estudanteId: { atividadeId: lista.id, estudanteId: ids[nome] } },
        update: {},
        create: { atividadeId: lista.id, estudanteId: ids[nome], dataEntrega: paraData(data) },
      });
    }
  }

  // Plano de recuperação de exemplo para Carla Mendes (em Risco pela frequência), com 2 de 4 itens feitos.
  // Elisa Rocha (também em Risco) fica sem plano, para demonstrar a criação pela tela.
  const temPlano = await prisma.planoRecuperacao.findFirst({ where: { estudanteId: ids["Carla Mendes"], turmaId: base.turma.id, status: "Ativo" } });
  if (!temPlano) {
    const itens = ["Refazer a lista de exercícios 1", "Plantão de dúvidas com o professor", "Resumo do capítulo 3", "Simulado da prova substitutiva"];
    await prisma.planoRecuperacao.create({
      data: {
        estudanteId: ids["Carla Mendes"],
        turmaId: base.turma.id,
        professorId: base.professorId,
        itens: { create: itens.map((descricao, ordem) => ({ descricao, ordem, concluido: ordem < 2, concluidoEm: ordem < 2 ? new Date() : null })) },
      },
    });
  }
  console.log(`Dados de demonstração prontos: ${ESTUDANTES_DEMO.length} estudantes fictícios (senha ${SENHA_DE_TESTE})`);
}

async function registrarDesempenho(turmaId: string, avaliacoes: string[], tabela: Partial<Record<NomeDemo, Desempenho>>, ids: Record<NomeDemo, string>, professorId: string) {
  for (const [nome, desempenho] of Object.entries(tabela) as [NomeDemo, Desempenho][]) {
    const estudanteId = ids[nome];
    await prisma.matricula.upsert({ where: { estudanteId_turmaId: { estudanteId, turmaId } }, update: {}, create: { estudanteId, turmaId } });
    for (const [i, valor] of desempenho.notas.entries()) {
      if (valor === null) continue;
      // SPEC-013: nota nova do seed ganha o registro de lançamento no histórico (só na primeira vez).
      const existia = await prisma.nota.findUnique({ where: { avaliacaoId_estudanteId: { avaliacaoId: avaliacoes[i], estudanteId } }, select: { id: true } });
      if (!existia) {
        await prisma.historicoNota.create({ data: { avaliacaoId: avaliacoes[i], estudanteId, autorId: professorId, valorAnterior: null, valorNovo: valor } });
      }
      await prisma.nota.upsert({
        where: { avaliacaoId_estudanteId: { avaliacaoId: avaliacoes[i], estudanteId } },
        update: { valor },
        create: { avaliacaoId: avaliacoes[i], estudanteId, valor },
      });
    }
    if (desempenho.frequencia !== null) {
      await prisma.frequencia.upsert({
        where: { estudanteId_turmaId: { estudanteId, turmaId } },
        update: { percentual: desempenho.frequencia },
        create: { estudanteId, turmaId, percentual: desempenho.frequencia },
      });
    }
    // Sem nota e sem frequência o estudante fica sem indicador ("Sem dados" nos dashboards e relatórios).
    if (desempenho.frequencia === null && desempenho.notas.every((n) => n === null)) {
      await prisma.indicadorAcademico.deleteMany({ where: { estudanteId, turmaId } });
      continue;
    }
    await recalcularIndicador(estudanteId, turmaId);
  }
}

function somarDias(base: string, dias: number) {
  const data = paraData(base);
  data.setUTCDate(data.getUTCDate() + dias);
  return data.toISOString().slice(0, 10);
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
