// Carga inicial: contas de TESTE, uma por perfil (OPEN-013 — sem cadastro público na SPEC-001),
// uma turma de exemplo da SPEC-002 ligando as três contas e uma avaliação de exemplo nessa turma
// (SPEC-004, OPEN-017), sem nota, para o professor lançar pela tela, e duas atividades de exemplo
// (SPEC-005), além de dados de demonstração fictícios (ver dadosDeDemonstracao). Apenas para ambiente local.
import { hojeEmBrasilia } from "../src/domain/atividades";
import { recalcularIndicador } from "../src/server/academico/indicador";
import { salvarConta } from "../src/server/auth/contas";
import { paraData } from "../src/server/dados/atividades";
import { prisma } from "../src/server/dados/prisma";
import { AULAS_2026_2, alinharMatriculasAoCurso, garantirTurma, prepararCursos, registrarChamadaSimulada, simularInstituicao, simularPeriodoAnterior } from "./simulacao";
import type { Perfil } from "../src/domain/perfil";

const SENHA_DE_TESTE = "StudyTrack@2026";

const CONTAS_DE_TESTE: { nome: string; email: string; perfil: Perfil }[] = [
  { nome: "João Pereira", email: "estudante@studytrack.test", perfil: "Estudante" },
  { nome: "Carlos Lima", email: "professor@studytrack.test", perfil: "Professor" },
  { nome: "Marina Alves", email: "coordenador@studytrack.test", perfil: "Coordenador" },
  // SPEC-010 (OPEN-025): primeiro administrador; só gerencia contas.
  { nome: "Renata Duarte", email: "admin@studytrack.test", perfil: "Administrador" },
];

const DISCIPLINA_EXEMPLO = { nome: "Modelagem de Software", cargaHoraria: 60 };
const TURMA_EXEMPLO = { nome: "Turma MS-A", periodo: "2026/2" };
const AVALIACAO_EXEMPLO = { nome: "Prova 1", peso: 1, data: new Date("2026-09-15T00:00:00Z") };

async function main() {
  await renomearNomesAntigos();
  // SPEC-017: toda turma é de um período letivo; 2026/2 é o semestre aberto da demonstração.
  await prisma.periodoLetivo.upsert({ where: { nome: "2026/2" }, update: {}, create: { nome: "2026/2" } });
  const contas: Partial<Record<Perfil, { id: string }>> = {};
  // O estudante de teste vem depois dos cursos (SPEC-015: todo estudante tem curso, RB-19).
  for (const conta of CONTAS_DE_TESTE.filter((c) => c.perfil !== "Estudante")) {
    contas[conta.perfil] = await salvarConta({ ...conta, senha: SENHA_DE_TESTE });
    console.log(`Conta de teste pronta: ${conta.email} (${conta.perfil})`);
  }
  const { Professor: professor, Coordenador: coordenador } = contas;
  if (!professor || !coordenador) throw new Error("Contas de teste incompletas.");

  // SPEC-015 / OPEN-036: os 6 cursos; Marina Alves (coordenador@) coordena Eng. da Computação e Ciência da Computação.
  const cursos = await prepararCursos({ senha: SENHA_DE_TESTE, coordenadorTesteId: coordenador.id });
  const contaEstudante = CONTAS_DE_TESTE.find((c) => c.perfil === "Estudante")!;
  const estudante = await salvarConta({ ...contaEstudante, senha: SENHA_DE_TESTE, cursoId: cursos.ECO });
  console.log(`Conta de teste pronta: ${contaEstudante.email} (Estudante, Engenharia da Computação)`);

  // Idempotente: reutiliza disciplina e turma de exemplo se já existirem.
  const turma = await garantirTurma({ ...TURMA_EXEMPLO, disciplina: DISCIPLINA_EXEMPLO.nome, cursoId: cursos.ECO, professorId: professor.id });
  await prisma.matricula.upsert({
    where: { estudanteId_turmaId: { estudanteId: estudante.id, turmaId: turma.id } },
    update: {},
    create: { estudanteId: estudante.id, turmaId: turma.id },
  });
  console.log(`Turma pronta: ${turma.nome} (${DISCIPLINA_EXEMPLO.nome})`);

  // Idempotente: só cria a avaliação de exemplo se a turma ainda não tiver uma com esse nome.
  const avaliacao =
    (await prisma.avaliacao.findFirst({ where: { nome: AVALIACAO_EXEMPLO.nome, turmaId: turma.id } })) ??
    (await prisma.avaliacao.create({ data: { ...AVALIACAO_EXEMPLO, turmaId: turma.id } }));
  console.log(`Avaliação de exemplo pronta: ${avaliacao.nome} (peso ${avaliacao.peso})`);

  // SPEC-005: uma atividade já vencida e uma com prazo futuro, sem entregas, para mostrar
  // os status Atrasada e Pendente. Idempotente pela descrição dentro da turma.
  const hoje = hojeEmBrasilia();
  const atividadesExemplo = [
    { descricao: "Lista de exercícios 1", prazo: somarDias(hoje, -3) },
    { descricao: "Trabalho final", prazo: somarDias(hoje, 14) },
  ];
  for (const exemplo of atividadesExemplo) {
    const existente = await prisma.atividade.findFirst({ where: { descricao: exemplo.descricao, turmaId: turma.id } });
    if (!existente) {
      await prisma.atividade.create({ data: { turmaId: turma.id, descricao: exemplo.descricao, prazo: paraData(exemplo.prazo) } });
    }
    console.log(`Atividade de exemplo pronta: ${exemplo.descricao}`);
  }

  await dadosDeDemonstracao({ turma, avaliacaoId: avaliacao.id, professorId: professor.id, cursoId: cursos.ECO, hoje });

  // Instituição simulada (6 cursos, 15 turmas, ~70 estudantes) para a apresentação: prisma/simulacao.ts.
  await simularInstituicao({ senha: SENHA_DE_TESTE, cursos, professorTesteId: professor.id, estudanteTesteId: estudante.id, hoje });
  await alinharMatriculasAoCurso();
  // SPEC-017 / OPEN-044: semestre anterior encerrado, para o histórico escolar ter Aprovado e Reprovado.
  await simularPeriodoAnterior({ cursoId: cursos.ECO, professorTesteId: professor.id });
  await exemplosDeNotificacoesEAuditoria({ professorId: professor.id, coordenadorId: coordenador.id, cursoId: cursos.ECO, hoje });
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
  avaliacaoId: string;
  professorId: string;
  cursoId: string;
  hoje: string;
}) {
  // Segundo professor, para demonstrar a troca do professor da turma (SPEC-010, RF-17).
  await salvarConta({ nome: "Júlia Reis", email: "julia.reis@studytrack.test", senha: SENHA_DE_TESTE, perfil: "Professor" });

  const ids = {} as Record<NomeDemo, string>;
  for (const estudante of ESTUDANTES_DEMO) {
    ids[estudante.nome] = (await salvarConta({ ...estudante, senha: SENHA_DE_TESTE, perfil: "Estudante", cursoId: base.cursoId })).id;
  }

  // Turma MS-A: a Prova 1 do seed e mais um trabalho.
  const trabalho =
    (await prisma.avaliacao.findFirst({ where: { nome: "Trabalho 1", turmaId: base.turma.id } })) ??
    (await prisma.avaliacao.create({ data: { turmaId: base.turma.id, nome: "Trabalho 1", peso: 1, data: new Date("2026-10-05T00:00:00Z") } }));
  await registrarDesempenho(base.turma.id, [base.avaliacaoId, trabalho.id], TURMA_A, ids, base.professorId);

  // Segunda turma, para o relatório do coordenador ter mais de uma turma (Eng. da Computação).
  const turmaB = await garantirTurma({ nome: "Turma ER-B", disciplina: "Engenharia de Requisitos", cursoId: base.cursoId, professorId: base.professorId });
  const provaB =
    (await prisma.avaliacao.findFirst({ where: { nome: "Prova 1", turmaId: turmaB.id } })) ??
    (await prisma.avaliacao.create({ data: { turmaId: turmaB.id, nome: "Prova 1", peso: 1, data: new Date("2026-09-20T00:00:00Z") } }));
  await registrarDesempenho(turmaB.id, [provaB.id], TURMA_B, ids, base.professorId);
  console.log("Turma ER-B pronta: Engenharia de Requisitos");

  // Entregas da lista vencida: três no prazo e uma depois do prazo; os demais ficam Atrasada (OPEN-010).
  const lista = await prisma.atividade.findFirst({ where: { descricao: "Lista de exercícios 1", turmaId: base.turma.id } });
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
    // SPEC-018: a frequência sai da chamada das aulas (RB-21).
    if (desempenho.frequencia !== null) await registrarChamadaSimulada(turmaId, estudanteId, desempenho.frequencia, AULAS_2026_2);
    // Sem nota e sem frequência o estudante fica sem indicador ("Sem dados" nos dashboards e relatórios).
    if (desempenho.frequencia === null && desempenho.notas.every((n) => n === null)) {
      await prisma.indicadorAcademico.deleteMany({ where: { estudanteId, turmaId } });
      continue;
    }
    await recalcularIndicador(estudanteId, turmaId);
  }
}

// SPEC-019 e SPEC-022: alguns registros de auditoria e notificações de exemplo, para as telas não começarem vazias.
// Idempotente: só cria quando ainda não há nenhum registro do mesmo tipo para a pessoa ou o curso.
async function exemplosDeNotificacoesEAuditoria(base: { professorId: string; coordenadorId: string; cursoId: string; hoje: string }) {
  const [carla, joao, admin] = await Promise.all(
    ["carla.mendes@studytrack.test", "estudante@studytrack.test", "admin@studytrack.test"].map((email) => prisma.usuario.findUniqueOrThrow({ where: { email }, select: { id: true } })),
  );
  const turma = await prisma.turma.findFirstOrThrow({ where: { nome: "Turma MS-A" }, select: { id: true } });
  const ontem = new Date(`${somarDias(base.hoje, -1)}T13:00:00Z`);
  const antes = new Date(`${somarDias(base.hoje, -3)}T16:20:00Z`);

  if ((await prisma.notificacao.count({ where: { usuarioId: carla.id } })) === 0) {
    await prisma.notificacao.createMany({
      data: [
        { usuarioId: carla.id, tipo: "Risco", titulo: "Você entrou em situação de Risco em Modelagem de Software", texto: "Motivo: frequência em 70%, abaixo de 75%. Converse com Carlos Lima.", link: "/estudante", criadaEm: ontem },
        { usuarioId: carla.id, tipo: "Nota", titulo: "Nota lançada em Trabalho 1 — Modelagem de Software", texto: "Sua nota: 6,4. Média atual: 6,2.", link: "/estudante", criadaEm: ontem },
        { usuarioId: carla.id, tipo: "Plano", titulo: "Plano de recuperação criado em Modelagem de Software", texto: "4 item(ns) previsto(s) por Carlos Lima.", link: "/estudante", criadaEm: antes, lidaEm: antes },
      ],
    });
  }
  if ((await prisma.notificacao.count({ where: { usuarioId: joao.id } })) === 0) {
    await prisma.notificacao.create({ data: { usuarioId: joao.id, tipo: "Nota", titulo: "Nota lançada em Prova 1 — Modelagem de Software", texto: "Sua nota foi registrada. Confira a média no dashboard.", link: "/estudante", criadaEm: ontem } });
  }
  if ((await prisma.notificacao.count({ where: { usuarioId: base.professorId } })) === 0) {
    await prisma.notificacao.create({ data: { usuarioId: base.professorId, tipo: "Risco", titulo: "Carla Mendes entrou em Risco em Turma MS-A · Modelagem de Software", texto: "Motivo: frequência em 70%, abaixo de 75%. Avalie criar um plano de recuperação.", link: `/professor/turmas/${turma.id}`, criadaEm: ontem } });
  }

  if ((await prisma.registroAuditoria.count({ where: { categoria: "Administrativa" } })) === 0) {
    await prisma.registroAuditoria.createMany({
      data: [
        { categoria: "Administrativa", acao: "periodo.encerrado", descricao: "2026/1 (3 turma(s) ficam somente leitura)", autorId: admin.id, antes: { status: "Aberto" }, depois: { status: "Encerrado" }, registradoEm: new Date("2026-07-10T15:00:00Z") },
        { categoria: "Administrativa", acao: "periodo.criado", descricao: "2026/2", autorId: admin.id, depois: { status: "Aberto" }, registradoEm: new Date("2026-07-20T12:00:00Z") },
        { categoria: "Administrativa", acao: "curso.coordenacao", descricao: "Ciência da Computação: Marina Alves → Otávio Campos", autorId: admin.id, antes: { coordenador: "Marina Alves" }, depois: { coordenador: "Otávio Campos" }, registradoEm: antes },
      ],
    });
  }
  if ((await prisma.registroAuditoria.count({ where: { cursoId: base.cursoId } })) === 0) {
    await prisma.registroAuditoria.createMany({
      data: [
        { categoria: "Academica", acao: "plano.criado", descricao: "Carla Mendes em Turma MS-A · Modelagem de Software, 4 item(ns)", autorId: base.professorId, cursoId: base.cursoId, turmaId: turma.id, registradoEm: antes },
        { categoria: "Academica", acao: "nota.alterada", descricao: "Carla Mendes em Trabalho 1 (Turma MS-A · Modelagem de Software): 5,8 → 6,4", autorId: base.professorId, cursoId: base.cursoId, turmaId: turma.id, antes: { valor: 5.8 }, depois: { valor: 6.4 }, registradoEm: ontem },
        { categoria: "Academica", acao: "chamada.registrada", descricao: "Turma MS-A · Modelagem de Software: chamadas do semestre registradas pela coordenação da demonstração", autorId: base.coordenadorId, cursoId: base.cursoId, turmaId: turma.id, registradoEm: ontem },
      ],
    });
  }
  // SPEC-025: dois comunicados de exemplo (um do professor para a turma, um da coordenação para o curso).
  if ((await prisma.comunicado.count({ where: { OR: [{ turmaId: turma.id }, { cursoId: base.cursoId }] } })) === 0) {
    await prisma.comunicado.create({ data: { autorId: base.professorId, turmaId: turma.id, titulo: "Prova 2 adiada para 26/11", texto: "Por causa da semana de provas do curso, a Prova 2 passa para quinta-feira, 26/11, no mesmo horário. O conteúdo continua o mesmo: capítulos 4 a 6.", criadoEm: new Date(`${base.hoje}T12:10:00Z`) } });
    await prisma.comunicado.create({ data: { autorId: base.coordenadorId, cursoId: base.cursoId, titulo: "Semana de recuperação", texto: "De 30/11 a 04/12 haverá plantões de dúvidas em todas as disciplinas. Quem está em Atenção ou Risco deve procurar o professor da turma.", criadoEm: ontem } });
    await prisma.notificacao.create({ data: { usuarioId: carla.id, tipo: "Comunicado", titulo: "Comunicado: Prova 2 adiada para 26/11", texto: "Prof. Carlos Lima · Turma MS-A · Modelagem de Software", link: "/comunicados", criadoEm: new Date(`${base.hoje}T12:10:00Z`) } });
  }
  console.log("Notificações, comunicados e registros de auditoria de exemplo prontos.");
}

function somarDias(base: string, dias: number) {
  const data = paraData(base);
  data.setUTCDate(data.getUTCDate() + dias);
  return data.toISOString().slice(0, 10);
}

// Bancos criados antes de 2026-10-19 tinham nomes provisórios ("de Teste", "(exemplo)"). Renomeia no lugar,
// antes do resto do seed, para nada ser duplicado. Contas são atualizadas pelo e-mail em salvarConta.
async function renomearNomesAntigos() {
  const disciplinas: [string, string][] = [["Modelagem de Software (exemplo)", "Modelagem de Software"], ["Engenharia de Requisitos (exemplo)", "Engenharia de Requisitos"]];
  for (const [antigo, novo] of disciplinas) {
    if (!(await prisma.disciplina.findFirst({ where: { nome: novo } }))) await prisma.disciplina.updateMany({ where: { nome: antigo }, data: { nome: novo } });
  }
  await prisma.turma.updateMany({ where: { nome: "Turma de exemplo" }, data: { nome: "Turma MS-A" } });
  await prisma.turma.updateMany({ where: { nome: "Turma B (exemplo)" }, data: { nome: "Turma ER-B" } });
  // SPEC-015 / OPEN-036: a turma de Cálculo I de Paula Martins passou a ser de Engenharia Elétrica.
  await prisma.turma.updateMany({ where: { nome: "Turma CAL-C" }, data: { nome: "Turma CAL-ELE" } });
  for (const [antigo, novo] of [["Prova 1 (exemplo)", "Prova 1"], ["Trabalho 1 (exemplo)", "Trabalho 1"]]) {
    await prisma.avaliacao.updateMany({ where: { nome: antigo }, data: { nome: novo } });
  }
  for (const [antigo, novo] of [["Lista de exercícios 1 (exemplo)", "Lista de exercícios 1"], ["Trabalho final (exemplo)", "Trabalho final"]]) {
    await prisma.atividade.updateMany({ where: { descricao: antigo }, data: { descricao: novo } });
  }
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
