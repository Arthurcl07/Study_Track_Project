// Dados de demonstração do Nível 3 (SPEC-036 a SPEC-043), fictícios e idempotentes: calendário de 2026/2 e 2027/1,
// salas e grade horária sem choque, matriz de Engenharia da Computação (semestres e pré-requisitos), o semestre
// 2027/1 com a rematrícula aberta, requerimentos em cada status, um aproveitamento de estudos, um diário fechado
// esperando homologação e o conteúdo das aulas de Modelagem de Software.
import { somarDiasUteis, type Evento, type TipoEvento } from "../src/domain/calendario";
import { sobrepoe, type Horario } from "../src/domain/horarios";
import { notificacaoRequerimento } from "../src/domain/notificacoes";
import { ROTULO_TIPO_REQUERIMENTO, destinoDoTipo, protocolo, type StatusRequerimento, type TipoRequerimento } from "../src/domain/requerimentos";
import { folgasDoCalendario } from "../src/server/academico/calendario";
import { mudarDiario, pendenciasDoDiario } from "../src/server/academico/diario";
import { paraData } from "../src/server/dados/atividades";
import { notificar } from "../src/server/dados/notificacoes";
import { prisma } from "../src/server/dados/prisma";

const EVENTOS: { periodo: string; tipo: TipoEvento; titulo: string; inicio: string; fim?: string }[] = [
  { periodo: "2026/2", tipo: "InicioAulas", titulo: "Início das aulas", inicio: "2026-08-11" },
  { periodo: "2026/2", tipo: "Feriado", titulo: "Independência do Brasil", inicio: "2026-09-07" },
  { periodo: "2026/2", tipo: "Feriado", titulo: "Nossa Senhora Aparecida", inicio: "2026-10-12" },
  { periodo: "2026/2", tipo: "Feriado", titulo: "Finados", inicio: "2026-11-02" },
  { periodo: "2026/2", tipo: "Feriado", titulo: "Proclamação da República", inicio: "2026-11-15" },
  { periodo: "2026/2", tipo: "Feriado", titulo: "Dia da Consciência Negra", inicio: "2026-11-20" },
  { periodo: "2026/2", tipo: "SemanaProvas", titulo: "Semana de provas (P2)", inicio: "2026-11-23", fim: "2026-11-27" },
  { periodo: "2026/2", tipo: "FimAulas", titulo: "Fim das aulas", inicio: "2026-12-12" },
  { periodo: "2026/2", tipo: "Recesso", titulo: "Recesso de fim de ano", inicio: "2026-12-21", fim: "2027-01-05" },
  { periodo: "2027/1", tipo: "Feriado", titulo: "Carnaval", inicio: "2027-02-08", fim: "2027-02-09" },
  { periodo: "2027/1", tipo: "InicioAulas", titulo: "Início das aulas", inicio: "2027-02-22" },
  { periodo: "2027/1", tipo: "Feriado", titulo: "Tiradentes", inicio: "2027-04-21" },
  { periodo: "2027/1", tipo: "FimAulas", titulo: "Fim das aulas", inicio: "2027-07-03" },
];

// Com a faculdade povoada (84 turmas em 2026/2), salas suficientes para a grade sem choque.
const SALAS = [
  { nome: "Sala 101", capacidade: 45 },
  { nome: "Sala 102", capacidade: 45 },
  { nome: "Sala 103", capacidade: 45 },
  { nome: "Sala 104", capacidade: 45 },
  { nome: "Sala 201", capacidade: 40 },
  { nome: "Sala 202", capacidade: 40 },
  { nome: "Sala 203", capacidade: 40 },
  { nome: "Sala 204", capacidade: 40 },
  { nome: "Sala 301", capacidade: 40 },
  { nome: "Sala 302", capacidade: 40 },
  { nome: "Laboratório 1", capacidade: 35 },
  { nome: "Laboratório 2", capacidade: 35 },
  { nome: "Laboratório 3", capacidade: 35 },
  { nome: "Auditório", capacidade: 120 },
];

// 2027/1 com a rematrícula aberta: uma turma livre, uma com choque de horário, uma quase cheia e duas com pré-requisito.
const TURMAS_2027_1: { nome: string; disciplina: string; professor: string; vagas: number; horarios: (Horario & { sala: string })[] }[] = [
  { nome: "Turma IA-ECO-271", disciplina: "Inteligência Artificial", professor: "julia.reis@studytrack.test", vagas: 30, horarios: [{ diaSemana: 1, inicio: "19:00", fim: "20:40", sala: "Laboratório 1" }, { diaSemana: 3, inicio: "19:00", fim: "20:40", sala: "Laboratório 1" }] },
  { nome: "Turma EMP-ECO-271", disciplina: "Empreendedorismo", professor: "marcos.andrade@studytrack.test", vagas: 40, horarios: [{ diaSemana: 1, inicio: "20:00", fim: "21:40", sala: "Sala 102" }] },
  { nome: "Turma ETI-ECO-271", disciplina: "Ética e Legislação", professor: "fernanda.lopes@studytrack.test", vagas: 2, horarios: [{ diaSemana: 2, inicio: "19:00", fim: "20:40", sala: "Sala 201" }] },
  { nome: "Turma COMP-ECO-271", disciplina: "Compiladores", professor: "ricardo.nunes@studytrack.test", vagas: 35, horarios: [{ diaSemana: 4, inicio: "19:00", fim: "20:40", sala: "Laboratório 2" }] },
  { nome: "Turma CAL2-ECO-271", disciplina: "Cálculo II", professor: "patricia.gomes@studytrack.test", vagas: 45, horarios: [{ diaSemana: 5, inicio: "19:00", fim: "20:40", sala: "Sala 101" }] },
];

const CONTEUDOS_MS = [
  "Apresentação da disciplina e do plano de ensino", "Processo de software e modelos de ciclo de vida", "Introdução à UML",
  "Diagrama de casos de uso", "Especificação de casos de uso", "Diagrama de classes: classes e atributos", "Diagrama de classes: associações",
  "Herança, agregação e composição", "Exercícios de modelagem de classes", "Revisão para a Prova 1", "Diagrama de sequência",
  "Diagrama de atividades", "Diagrama de estados", "Padrões de projeto: introdução", "Padrões Strategy e Observer", "Arquitetura em camadas",
  "Modelagem do banco a partir do diagrama de classes", "Estudo de caso: sistema acadêmico", "Apresentação dos trabalhos em grupo", "Revisão para a Prova 2",
];

export async function exemplosDoNivel3(base: { administradorId: string; professorId: string; cursoId: string }) {
  // SPEC-040: calendário (idempotente pelo período, tipo e título). 2027/1 nasce aberto, com a rematrícula de novembro.
  await prisma.periodoLetivo.upsert({ where: { nome: "2027/1" }, update: {}, create: { nome: "2027/1", status: "Aberto", rematriculaInicio: paraData("2026-11-03"), rematriculaFim: paraData("2026-11-30") } });
  for (const e of EVENTOS) {
    if (!(await prisma.eventoCalendario.findFirst({ where: { periodo: e.periodo, tipo: e.tipo, titulo: e.titulo } }))) {
      await prisma.eventoCalendario.create({ data: { periodo: e.periodo, tipo: e.tipo, titulo: e.titulo, inicio: paraData(e.inicio), fim: paraData(e.fim ?? e.inicio) } });
    }
  }
  console.log(`Calendário pronto: ${EVENTOS.length} eventos de 2026/2 e 2027/1; rematrícula de 2027/1 aberta de 03/11 a 30/11/2026.`);

  // SPEC-041: salas.
  const salas = new Map<string, { id: string; capacidade: number }>();
  for (const s of SALAS) salas.set(s.nome, await prisma.sala.upsert({ where: { nome: s.nome }, update: {}, create: s, select: { id: true, capacidade: true } }));

  // SPEC-037: a matriz de cada curso (semestres e pré-requisitos) vem do povoamento (prisma/povoamento.ts).
  const idDe = new Map<string, string>();
  for (const nome of [...TURMAS_2027_1.map((d) => d.disciplina), "Introdução à Computação"]) {
    const disciplina = await prisma.disciplina.findFirst({ where: { nome }, select: { id: true } });
    if (!disciplina) throw new Error(`Disciplina ausente da grade: ${nome}`);
    idDe.set(nome, disciplina.id);
  }

  // SPEC-038: turmas de 2027/1 com vagas e horários.
  for (const def of TURMAS_2027_1) {
    const professor = await prisma.usuario.findUniqueOrThrow({ where: { email: def.professor }, select: { id: true } });
    // Pela disciplina do curso no período (bancos antigos têm estas turmas com o nome sem o sufixo "-271").
    const existente = await prisma.turma.findFirst({ where: { cursoId: base.cursoId, disciplinaId: idDe.get(def.disciplina)!, periodo: "2027/1" } });
    const turma = existente
      ? existente.nome === def.nome ? existente : await prisma.turma.update({ where: { id: existente.id }, data: { nome: def.nome } })
      : await prisma.turma.create({ data: { nome: def.nome, periodo: "2027/1", disciplinaId: idDe.get(def.disciplina)!, professorId: professor.id, cursoId: base.cursoId, vagas: def.vagas } });
    if ((await prisma.horarioTurma.count({ where: { turmaId: turma.id } })) === 0) {
      await prisma.horarioTurma.createMany({ data: def.horarios.map((h) => ({ turmaId: turma.id, diaSemana: h.diaSemana, inicio: h.inicio, fim: h.fim, salaId: salas.get(h.sala)!.id })) });
    }
  }
  // Ética e Legislação com 1 das 2 vagas já ocupada por um estudante simulado do curso.
  const etica = await prisma.turma.findFirstOrThrow({ where: { nome: "Turma ETI-ECO-271", periodo: "2027/1" } });
  if ((await prisma.matricula.count({ where: { turmaId: etica.id } })) === 0) {
    const simulado = await prisma.usuario.findFirst({ where: { cursoId: base.cursoId, perfil: "Estudante", email: { endsWith: "@studytrack.test", notIn: ["estudante@studytrack.test"] }, ficha: { situacaoCurso: "Ativo" } }, orderBy: { email: "asc" }, select: { id: true } });
    if (simulado) await prisma.matricula.create({ data: { estudanteId: simulado.id, turmaId: etica.id } });
  }
  console.log(`Semestre 2027/1 pronto: ${TURMAS_2027_1.length} turmas de Engenharia da Computação para a rematrícula.`);

  await gradeDe2026_2(salas);
  await requerimentosDeExemplo(base.administradorId);
  await aproveitamentoDeExemplo(base.administradorId, idDe.get("Introdução à Computação")!);
  await conteudoDasAulas();
  await diarioFechado(base.professorId);
}

// SPEC-041: grade de 2026/2 sem choque de sala, de professor nem de estudante (RB-39), com vagas até a menor sala.
// A grade é refeita a cada execução (mesmo resultado, a ordem é fixa): assim continua sem choque quando o povoamento
// muda quem está em cada turma.
async function gradeDe2026_2(salas: Map<string, { id: string; capacidade: number }>) {
  await prisma.horarioTurma.deleteMany({ where: { turma: { periodo: "2026/2" } } });
  const turmas = await prisma.turma.findMany({
    where: { periodo: "2026/2" },
    select: { id: true, nome: true, vagas: true, professorId: true, matriculas: { select: { estudanteId: true } }, horarios: { select: { diaSemana: true, inicio: true, fim: true, salaId: true } } },
    orderBy: { nome: "asc" },
  });
  type Ocupado = Horario & { salaId: string; professorId: string; estudantes: Set<string> };
  const ocupados: Ocupado[] = turmas.flatMap((t) => t.horarios.map((h) => ({ ...h, professorId: t.professorId, estudantes: new Set(t.matriculas.map((m) => m.estudanteId)) })));
  // Um bloco de 2 aulas por semana para cada disciplina: 10 blocos à noite (segunda a sexta) e 2 no sábado de manhã,
  // para uma turma de ingresso com 7 disciplinas caber sem choque.
  const pares: Horario[][] = [];
  for (const [inicio, fim] of [["19:00", "20:40"], ["20:50", "22:30"]]) {
    for (const dia of [1, 2, 3, 4, 5]) pares.push([{ diaSemana: dia, inicio, fim }]);
  }
  pares.push([{ diaSemana: 6, inicio: "08:00", fim: "09:40" }], [{ diaSemana: 6, inicio: "10:00", fim: "11:40" }]);
  const listaSalas = [...salas.entries()].sort((a, b) => a[1].capacidade - b[1].capacidade);
  let novas = 0;
  for (const t of turmas) {
    const estudantes = new Set(t.matriculas.map((m) => m.estudanteId));
    const precisa = Math.max(t.vagas ?? 0, estudantes.size);
    let escolha: { par: Horario[]; salaId: string; capacidade: number } | null = null;
    for (const par of pares) {
      const choqueDePessoa = par.some((h) => ocupados.some((o) => sobrepoe(o, h) && (o.professorId === t.professorId || [...estudantes].some((e) => o.estudantes.has(e)))));
      if (choqueDePessoa) continue;
      const sala = listaSalas.find(([, s]) => s.capacidade >= precisa && !par.some((h) => ocupados.some((o) => o.salaId === s.id && sobrepoe(o, h))));
      if (sala) {
        escolha = { par, salaId: sala[1].id, capacidade: sala[1].capacidade };
        break;
      }
    }
    if (!escolha) {
      console.log(`Sem horário livre para ${t.nome}.`);
      continue;
    }
    await prisma.horarioTurma.createMany({ data: escolha.par.map((h) => ({ turmaId: t.id, ...h, salaId: escolha.salaId })) });
    if (t.vagas === null) await prisma.turma.update({ where: { id: t.id }, data: { vagas: escolha.capacidade } });
    for (const h of escolha.par) ocupados.push({ ...h, salaId: escolha.salaId, professorId: t.professorId, estudantes });
    novas++;
  }
  console.log(`Grade de 2026/2 pronta: ${novas} turma(s) com horário, ${SALAS.length} salas.`);
}

// SPEC-036: requerimentos em cada status (um atrasado), com protocolo do ano e prazo de 5 dias úteis.
async function requerimentosDeExemplo(administradorId: string) {
  const folgas: Evento[] = await folgasDoCalendario();
  const msa = await prisma.turma.findFirst({ where: { nome: "Turma MS-A", periodo: "2026/2" }, select: { id: true, avaliacoes: { where: { nome: "Prova 1" }, select: { id: true } } } });
  const exemplos: { email: string; tipo: TipoRequerimento; descricao: string; abertoEm: string; status: StatusRequerimento; resposta?: string; turma?: boolean; turmaNome?: string }[] = [
    { email: "estudante@studytrack.test", tipo: "RevisaoProva", turma: true, abertoEm: "2026-11-05", status: "Aberto", descricao: "Peço a revisão da questão 4 da Prova 1: usei composição e foi considerado errado." },
    { email: "estudante@studytrack.test", tipo: "DeclaracaoMatricula", abertoEm: "2026-11-03", status: "Deferido", descricao: "Declaração de matrícula para o estágio.", resposta: "Declaração disponível no StudyTrack." },
    { email: "ana.souza@studytrack.test", tipo: "SegundaChamada", turma: true, abertoEm: "2026-11-06", status: "EmAnalise", descricao: "Estive doente no dia do trabalho em grupo; anexo o atestado na secretaria." },
    { email: "bruno.costa@studytrack.test", tipo: "Outro", abertoEm: "2026-10-26", status: "Aberto", descricao: "Solicito a ementa de Banco de Dados para apresentar no estágio." },
    { email: "elisa.rocha@studytrack.test", tipo: "Trancamento", abertoEm: "2026-10-20", status: "Indeferido", descricao: "Quero trancar o semestre por motivo de trabalho.", resposta: "Trancamento só até 30/08. Procure a coordenação para outras opções." },
    // SPEC-044: trancamento de uma disciplina esperando a secretaria (deferir tranca a matrícula na hora).
    { email: "diego.lima@studytrack.test", tipo: "TrancamentoDisciplina", turmaNome: "Turma FI-ECO", abertoEm: "2026-11-09", status: "Aberto", descricao: "Comecei a trabalhar no horário de Física I e não consigo mais assistir às aulas." },
  ];
  let criados = 0;
  for (const ex of exemplos) {
    const estudante = await prisma.usuario.findUnique({ where: { email: ex.email }, select: { id: true } });
    if (!estudante || (await prisma.requerimento.findFirst({ where: { estudanteId: estudante.id, tipo: ex.tipo, descricao: ex.descricao } }))) continue;
    const ano = ex.abertoEm.slice(0, 4);
    const ultimo = await prisma.requerimento.findFirst({ where: { protocolo: { startsWith: `${ano}-` } }, select: { protocolo: true }, orderBy: { protocolo: "desc" } });
    const numero = protocolo(ano, (ultimo ? Number(ultimo.protocolo.slice(5)) : 0) + 1);
    const decidido = ex.status === "Deferido" || ex.status === "Indeferido";
    const destino = destinoDoTipo(ex.tipo);
    const responsavel = decidido ? (destino === "Secretaria" ? administradorId : null) : null;
    await prisma.$transaction(async (tx) => {
      await tx.requerimento.create({
        data: {
          protocolo: numero,
          estudanteId: estudante.id,
          tipo: ex.tipo,
          destino,
          turmaId: ex.turmaNome ? ((await prisma.turma.findFirst({ where: { nome: ex.turmaNome, periodo: "2026/2" }, select: { id: true } }))?.id ?? null) : ex.turma ? (msa?.id ?? null) : null,
          avaliacaoId: ex.tipo === "RevisaoProva" ? (msa?.avaliacoes[0]?.id ?? null) : null,
          descricao: ex.descricao,
          status: ex.status,
          resposta: ex.resposta ?? null,
          prazo: paraData(somarDiasUteis(ex.abertoEm, 5, folgas)),
          criadoEm: new Date(`${ex.abertoEm}T13:00:00Z`),
          respondidoEm: decidido ? new Date(`${somarDiasUteis(ex.abertoEm, 1, folgas)}T17:00:00Z`) : null,
          responsavelId: responsavel,
        },
      });
      if (ex.status !== "Aberto") await notificar(tx, estudante.id, notificacaoRequerimento(numero, ROTULO_TIPO_REQUERIMENTO[ex.tipo], ex.status, ex.resposta ?? null));
    });
    criados++;
  }
  console.log(`Requerimentos de exemplo prontos (${criados} novo(s)): aberto, em análise, deferido, indeferido e um atrasado.`);
}

// SPEC-042: aproveitamento de Introdução à Computação para Henrique Dias (não cursou 2026/1 aqui).
async function aproveitamentoDeExemplo(administradorId: string, disciplinaId: string) {
  const henrique = await prisma.usuario.findUnique({ where: { email: "henrique.dias@studytrack.test" }, select: { id: true } });
  if (!henrique) return;
  await prisma.aproveitamento.upsert({
    where: { estudanteId_disciplinaId: { estudanteId: henrique.id, disciplinaId } },
    update: {},
    create: { estudanteId: henrique.id, disciplinaId, instituicaoOrigem: "Universidade Estadual Exemplo", disciplinaOrigem: "Introdução à Programação", nota: 8.5, cargaHoraria: 80, autorId: administradorId },
  });
  console.log("Aproveitamento de exemplo pronto: Henrique Dias, Introdução à Computação.");
}

// SPEC-039: conteúdo das aulas já dadas de Modelagem de Software, em ordem.
async function conteudoDasAulas() {
  const msa = await prisma.turma.findFirst({ where: { nome: "Turma MS-A", periodo: "2026/2" }, select: { id: true } });
  if (!msa) return;
  const aulas = await prisma.aula.findMany({ where: { turmaId: msa.id }, select: { id: true, conteudo: true }, orderBy: [{ data: "asc" }, { numero: "asc" }] });
  for (const [k, aula] of aulas.entries()) {
    if (!aula.conteudo && CONTEUDOS_MS[k]) await prisma.aula.update({ where: { id: aula.id }, data: { conteudo: CONTEUDOS_MS[k] } });
  }
}

// SPEC-039: o diário de Engenharia de Requisitos (Turma ER-B) fechado pelo professor, esperando a homologação.
// Só uma vez: se a coordenação já mexeu nele, o seed não fecha de novo.
async function diarioFechado(professorId: string) {
  const erb = await prisma.turma.findFirst({ where: { nome: "Turma ER-B", periodo: "2026/2" }, select: { id: true, diario: true } });
  if (!erb || erb.diario !== "Aberto" || (await prisma.registroAuditoria.count({ where: { turmaId: erb.id, acao: { startsWith: "diario." } } })) > 0) return;
  const estado = await pendenciasDoDiario(erb.id);
  if (!estado || estado.pendencias.length > 0 || estado.semAvaliacao) {
    console.log(`Diário da Turma ER-B não fechado: ${estado?.pendencias.join("; ") || "sem avaliação"}.`);
    return;
  }
  const r = await mudarDiario(erb.id, { acao: "fechar" }, { usuarioId: professorId, perfil: "Professor" });
  console.log(r.ok ? "Diário da Turma ER-B fechado, esperando homologação da coordenação." : "Diário da Turma ER-B não fechado.");
}
