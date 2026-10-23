// Simulação de uma instituição (dados FICTÍCIOS, só para ambiente local e apresentação): 6 cursos com a sua
// coordenação (SPEC-015, OPEN-036), disciplinas compartilhadas entre cursos, turmas de cada curso, professores e
// cerca de 70 estudantes, com avaliações, notas, frequência, atividades, entregas, planos de recuperação e histórico.
// - Determinística: um gerador com semente fixa produz sempre os mesmos números.
// - Idempotente: rodar o seed de novo não duplica nada; notas e frequências voltam aos valores simulados.
// - A situação (Normal/Atenção/Risco) nunca é escrita aqui: sai de recalcularIndicador (regra única, DA-02).
// - Cada estudante é de um curso e só é matriculado em turmas desse curso (RB-19).
import { recalcularIndicador } from "../src/server/academico/indicador";
import { salvarConta } from "../src/server/auth/contas";
import { paraData } from "../src/server/dados/atividades";
import { prisma } from "../src/server/dados/prisma";

// Gerador pseudoaleatório com semente fixa (mulberry32): mesmos dados a cada execução.
function gerador(semente: number) {
  let a = semente;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const aleatorio = gerador(20262);
const entre = (min: number, max: number) => min + aleatorio() * (max - min);
const meioPonto = (v: number) => Math.min(10, Math.max(0, Math.round(v * 2) / 2));

function somarDias(base: string, dias: number) {
  const data = paraData(base);
  data.setUTCDate(data.getUTCDate() + dias);
  return data.toISOString().slice(0, 10);
}

const NOMES = ["Lucas", "Mariana", "Pedro", "Beatriz", "Gustavo", "Larissa", "Rafael", "Camila", "Thiago", "Juliana", "Matheus", "Isabela",
  "Vinícius", "Letícia", "Leonardo", "Amanda", "Rodrigo", "Natália", "Eduardo", "Fernanda", "Caio", "Vitória", "André", "Sofia", "Daniel"];
const SOBRENOMES = ["Oliveira", "Santos", "Pereira", "Carvalho", "Ribeiro", "Almeida", "Ferreira", "Barbosa", "Martins", "Araújo",
  "Cardoso", "Teixeira", "Moreira", "Freitas", "Correia", "Pinto", "Monteiro", "Vieira"];

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const PROFESSORES = [
  { nome: "Júlia Reis", email: "julia.reis@studytrack.test" },
  { nome: "Marcos Andrade", email: "marcos.andrade@studytrack.test" },
  { nome: "Fernanda Lopes", email: "fernanda.lopes@studytrack.test" },
  { nome: "Ricardo Nunes", email: "ricardo.nunes@studytrack.test" },
  { nome: "Patrícia Gomes", email: "patricia.gomes@studytrack.test" },
  { nome: "Tiago Mello", email: "tiago.mello@studytrack.test" },
  { nome: "Sílvia Couto", email: "silvia.couto@studytrack.test" },
];

// Coordenação (OPEN-030): "teste" é Marina Alves (coordenador@), que coordena 2 cursos.
const COORDENADORES = {
  paula: { nome: "Paula Martins", email: "paula.martins@studytrack.test" },
  helena: { nome: "Helena Prado", email: "helena.prado@studytrack.test" },
  sergio: { nome: "Sérgio Bastos", email: "sergio.bastos@studytrack.test" },
  beatriz: { nome: "Beatriz Moura", email: "beatriz.moura@studytrack.test" },
} as const;

// OPEN-036: 6 cursos. Cálculo I, Física I e Algoritmos estão em mais de um curso (cada curso com a própria turma).
export const CURSOS = {
  ECO: { nome: "Engenharia da Computação", coordenador: "teste" },
  CC: { nome: "Ciência da Computação", coordenador: "teste" },
  ELE: { nome: "Engenharia Elétrica", coordenador: "paula" },
  SI: { nome: "Sistemas de Informação", coordenador: "helena" },
  PP: { nome: "Publicidade e Propaganda", coordenador: "sergio" },
  ADM: { nome: "Administração", coordenador: "beatriz" },
} as const;
export type Sigla = keyof typeof CURSOS;

const DISCIPLINAS: Record<string, { carga: number; cursos: Sigla[] }> = {
  "Modelagem de Software": { carga: 60, cursos: ["ECO"] },
  "Engenharia de Requisitos": { carga: 40, cursos: ["ECO"] },
  "Banco de Dados": { carga: 80, cursos: ["ECO", "SI"] },
  "Sistemas Operacionais": { carga: 60, cursos: ["ECO"] },
  "Cálculo I": { carga: 80, cursos: ["ECO", "CC", "ELE"] },
  "Física I": { carga: 60, cursos: ["ECO", "ELE"] },
  Algoritmos: { carga: 80, cursos: ["ECO", "CC", "SI"] },
  "Engenharia de Software": { carga: 80, cursos: ["CC"] },
  "Estruturas de Dados": { carga: 60, cursos: ["CC"] },
  "Redes de Computadores": { carga: 60, cursos: ["ELE"] },
  "Circuitos Elétricos": { carga: 80, cursos: ["ELE"] },
  "Sistemas de Informação Gerenciais": { carga: 60, cursos: ["SI"] },
  "Fundamentos de Marketing": { carga: 60, cursos: ["PP", "ADM"] },
  "Criação Publicitária": { carga: 80, cursos: ["PP"] },
  "Gestão de Projetos": { carga: 60, cursos: ["ADM"] },
};

// professor: índice em PROFESSORES ou "teste" (Carlos Lima, professor@, que leciona em 2 cursos).
const TURMAS: { curso: Sigla; disciplina: string; nome: string; professor: number | "teste" }[] = [
  { curso: "ECO", disciplina: "Banco de Dados", nome: "Turma BD-A", professor: 0 },
  { curso: "ECO", disciplina: "Sistemas Operacionais", nome: "Turma SO-B", professor: "teste" },
  { curso: "ECO", disciplina: "Cálculo I", nome: "Turma CAL-ECO", professor: 4 },
  { curso: "CC", disciplina: "Engenharia de Software", nome: "Turma ES-A", professor: 1 },
  { curso: "CC", disciplina: "Estruturas de Dados", nome: "Turma ED-B", professor: 2 },
  { curso: "CC", disciplina: "Algoritmos", nome: "Turma ALG-CC", professor: 1 },
  { curso: "ELE", disciplina: "Redes de Computadores", nome: "Turma RC-A", professor: 3 },
  { curso: "ELE", disciplina: "Cálculo I", nome: "Turma CAL-ELE", professor: 4 },
  { curso: "ELE", disciplina: "Física I", nome: "Turma FIS-ELE", professor: "teste" },
  { curso: "SI", disciplina: "Algoritmos", nome: "Turma ALG-SI", professor: 2 },
  { curso: "SI", disciplina: "Banco de Dados", nome: "Turma BD-SI", professor: 0 },
  { curso: "PP", disciplina: "Fundamentos de Marketing", nome: "Turma MKT-PP", professor: 5 },
  { curso: "PP", disciplina: "Criação Publicitária", nome: "Turma CRI-PP", professor: 5 },
  { curso: "ADM", disciplina: "Fundamentos de Marketing", nome: "Turma MKT-ADM", professor: 6 },
  { curso: "ADM", disciplina: "Gestão de Projetos", nome: "Turma GP-ADM", professor: 6 },
];

// Estudantes simulados por curso, em blocos consecutivos dos ~70 gerados.
const ESTUDANTES_POR_CURSO: [Sigla, number][] = [["ECO", 16], ["CC", 12], ["ELE", 12], ["SI", 10], ["PP", 10], ["ADM", 10]];
const POR_TURMA = 10;

const AVALIACOES = [
  { nome: "Prova 1", peso: 2, data: "2026-09-15" },
  { nome: "Lista de exercícios", peso: 1, data: "2026-09-29" },
  { nome: "Trabalho em grupo", peso: 1, data: "2026-10-08" },
  // Ainda sem nota: a média usa só as avaliações já lançadas (OPEN-002).
  { nome: "Prova 2", peso: 2, data: "2026-11-24" },
];

const ITENS_PLANO = ["Refazer a lista de exercícios", "Plantão de dúvidas com o professor", "Resumo do conteúdo da Prova 1",
  "Simulado antes da Prova 2", "Entregar o trabalho pendente"];

type Desempenho = "bom" | "medio" | "fraco";
type Estudante = { id: string; nome: string; perfil: Desempenho; faltoso: boolean };

// Coordenadores e os 6 cursos, com nome definitivo (OPEN-036). Cursos provisórios criados pela migração da
// SPEC-015 são renomeados aqui, para nada ser duplicado. Devolve o id de cada curso pela sigla.
export async function prepararCursos(base: { senha: string; coordenadorTesteId: string }): Promise<Record<Sigla, string>> {
  const coordenadores: Record<string, string> = { teste: base.coordenadorTesteId };
  for (const [chave, c] of Object.entries(COORDENADORES)) {
    coordenadores[chave] = (await salvarConta({ ...c, senha: base.senha, perfil: "Coordenador" })).id;
  }
  const ids = {} as Record<Sigla, string>;
  for (const [sigla, def] of Object.entries(CURSOS) as [Sigla, (typeof CURSOS)[Sigla]][]) {
    const coordenadorId = coordenadores[def.coordenador];
    const existente =
      (await prisma.curso.findUnique({ where: { nome: def.nome } })) ??
      (await prisma.curso.findFirst({ where: { nome: { startsWith: "Curso provisório" }, coordenadorId } }));
    const curso = existente
      ? await prisma.curso.update({ where: { id: existente.id }, data: { nome: def.nome, coordenadorId } })
      : await prisma.curso.create({ data: { nome: def.nome, coordenadorId } });
    ids[sigla] = curso.id;
  }
  // Grade (OPEN-031): a disciplina é criada uma vez e entra em todos os cursos listados.
  for (const [nome, def] of Object.entries(DISCIPLINAS)) {
    const disciplina = await garantirDisciplina(nome, def.carga);
    for (const sigla of def.cursos) {
      await prisma.cursoDisciplina.upsert({
        where: { cursoId_disciplinaId: { cursoId: ids[sigla], disciplinaId: disciplina.id } },
        update: {},
        create: { cursoId: ids[sigla], disciplinaId: disciplina.id },
      });
    }
  }
  // Tira da grade dos cursos simulados o que não está em DISCIPLINAS nem é usado por turma do curso (sobras da
  // migração da SPEC-015, que levou para o curso provisório todas as disciplinas das turmas da coordenadora).
  for (const [sigla, cursoId] of Object.entries(ids) as [Sigla, string][]) {
    const esperadas = Object.entries(DISCIPLINAS).filter(([, d]) => d.cursos.includes(sigla)).map(([nome]) => nome);
    await prisma.cursoDisciplina.deleteMany({
      where: { cursoId, disciplina: { nome: { notIn: esperadas }, turmas: { none: { cursoId } } } },
    });
  }
  console.log(`Cursos prontos: ${Object.values(CURSOS).map((c) => c.nome).join(", ")}`);
  return ids;
}

async function garantirDisciplina(nome: string, carga: number) {
  return (await prisma.disciplina.findFirst({ where: { nome } })) ?? (await prisma.disciplina.create({ data: { nome, cargaHoraria: carga } }));
}

// Turma idempotente pelo nome. Uma turma que já existia é posta no curso indicado (bancos anteriores à SPEC-015).
export async function garantirTurma(def: { nome: string; disciplina: string; cursoId: string; professorId: string }) {
  const disciplina = await garantirDisciplina(def.disciplina, DISCIPLINAS[def.disciplina]?.carga ?? 60);
  await prisma.cursoDisciplina.upsert({
    where: { cursoId_disciplinaId: { cursoId: def.cursoId, disciplinaId: disciplina.id } },
    update: {},
    create: { cursoId: def.cursoId, disciplinaId: disciplina.id },
  });
  const existente = await prisma.turma.findFirst({ where: { nome: def.nome } });
  if (existente) return prisma.turma.update({ where: { id: existente.id }, data: { cursoId: def.cursoId, disciplinaId: disciplina.id } });
  return prisma.turma.create({ data: { nome: def.nome, periodo: "2026/2", disciplinaId: disciplina.id, professorId: def.professorId, cursoId: def.cursoId } });
}

export async function simularInstituicao(base: {
  senha: string;
  cursos: Record<Sigla, string>;
  professorTesteId: string;
  estudanteTesteId: string;
  hoje: string;
}) {
  // Contas: senha das contas de teste e sem troca obrigatória (seed, OPEN-026).
  const professores = [];
  for (const p of PROFESSORES) professores.push(await salvarConta({ ...p, senha: base.senha, perfil: "Professor" }));

  // ~70 estudantes com combinações distintas de nome e sobrenome, cada um num curso (RB-19).
  const porCurso = {} as Record<Sigla, Estudante[]>;
  let i = 0;
  for (const [sigla, quantidade] of ESTUDANTES_POR_CURSO) {
    porCurso[sigla] = [];
    for (let k = 0; k < quantidade; k++, i++) {
      const nome = `${NOMES[i % NOMES.length]} ${SOBRENOMES[(i * 7 + Math.floor(i / NOMES.length)) % SOBRENOMES.length]}`;
      const [primeiro, ultimo] = [nome.split(" ")[0], nome.split(" ")[1]];
      const conta = await salvarConta({
        nome,
        email: `${semAcento(primeiro)}.${semAcento(ultimo)}@studytrack.test`,
        senha: base.senha,
        perfil: "Estudante",
        cursoId: base.cursos[sigla],
      });
      const sorteio = aleatorio();
      porCurso[sigla].push({ id: conta.id, nome, perfil: sorteio < 0.6 ? "bom" : sorteio < 0.85 ? "medio" : "fraco", faltoso: aleatorio() < 0.12 });
    }
  }
  const estudanteTeste: Estudante = { id: base.estudanteTesteId, nome: "João Pereira", perfil: "medio", faltoso: false };

  const resumo = { turmas: 0, matriculas: 0, notas: 0, planos: 0 };
  const posicaoNoCurso: Partial<Record<Sigla, number>> = {};
  for (const [indice, def] of TURMAS.entries()) {
    const professorId = def.professor === "teste" ? base.professorTesteId : professores[def.professor].id;
    const turma = await garantirTurma({ nome: def.nome, disciplina: def.disciplina, cursoId: base.cursos[def.curso], professorId });
    resumo.turmas++;

    // Até 10 estudantes do curso por turma, começando em pontos diferentes para variar as combinações.
    const pool = porCurso[def.curso];
    const inicio = (posicaoNoCurso[def.curso] ?? 0) * 3;
    posicaoNoCurso[def.curso] = (posicaoNoCurso[def.curso] ?? 0) + 1;
    const daTurma = Array.from({ length: Math.min(POR_TURMA, pool.length) }, (_, k) => pool[(inicio + k) % pool.length]);
    if (def.nome === "Turma BD-A" || def.nome === "Turma SO-B") daTurma.push(estudanteTeste);

    const avaliacoes = [];
    for (const a of AVALIACOES) {
      avaliacoes.push(
        (await prisma.avaliacao.findFirst({ where: { turmaId: turma.id, nome: a.nome } })) ??
          (await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: a.nome, peso: a.peso, data: new Date(`${a.data}T00:00:00Z`) } })),
      );
    }

    for (const e of daTurma) {
      await prisma.matricula.upsert({ where: { estudanteId_turmaId: { estudanteId: e.id, turmaId: turma.id } }, update: {}, create: { estudanteId: e.id, turmaId: turma.id } });
      resumo.matriculas++;
      const centro = e.perfil === "bom" ? entre(7, 9.5) : e.perfil === "medio" ? entre(5, 6.5) : entre(2.5, 4.8);

      // Só as três primeiras avaliações têm nota (a Prova 2 ainda não aconteceu).
      for (const [k, avaliacao] of avaliacoes.slice(0, 3).entries()) {
        const valor = meioPonto(centro + entre(-1, 1));
        // O sorteio acontece sempre, para a sequência de números ser a mesma em toda execução.
        const corrigida = aleatorio() < 0.1;
        const existente = await prisma.nota.findUnique({ where: { avaliacaoId_estudanteId: { avaliacaoId: avaliacao.id, estudanteId: e.id } }, select: { id: true } });
        if (!existente) {
          // Histórico (SPEC-013): lançamento e, em ~10% das notas, uma correção posterior.
          const lancadaEm = new Date(`${somarDias(AVALIACOES[k].data, 3)}T13:00:00Z`);
          const primeiroValor = corrigida ? meioPonto(valor - 1) : valor;
          await prisma.historicoNota.create({ data: { avaliacaoId: avaliacao.id, estudanteId: e.id, autorId: professorId, valorAnterior: null, valorNovo: primeiroValor, registradoEm: lancadaEm } });
          if (corrigida && primeiroValor !== valor) {
            await prisma.historicoNota.create({ data: { avaliacaoId: avaliacao.id, estudanteId: e.id, autorId: professorId, valorAnterior: primeiroValor, valorNovo: valor, registradoEm: new Date(lancadaEm.getTime() + 4 * 86400000) } });
          }
        }
        await prisma.nota.upsert({
          where: { avaliacaoId_estudanteId: { avaliacaoId: avaliacao.id, estudanteId: e.id } },
          update: { valor },
          create: { avaliacaoId: avaliacao.id, estudanteId: e.id, valor },
        });
        resumo.notas++;
      }

      const percentual = Math.round(e.faltoso ? entre(58, 74) : entre(78, 100));
      await prisma.frequencia.upsert({ where: { estudanteId_turmaId: { estudanteId: e.id, turmaId: turma.id } }, update: { percentual }, create: { estudanteId: e.id, turmaId: turma.id, percentual } });
      await recalcularIndicador(e.id, turma.id);
    }

    // Atividades: duas vencidas, uma nos próximos dias (SPEC-016, próximos prazos) e uma futura; entregas no
    // prazo, atrasadas ou faltando conforme o perfil.
    const atividades = [
      { descricao: "Lista de exercícios 1", prazo: somarDias(base.hoje, -20) },
      { descricao: "Relatório parcial do projeto", prazo: somarDias(base.hoje, -5) },
      { descricao: "Lista de revisão", prazo: somarDias(base.hoje, 2 + (indice % 5)) },
      { descricao: "Projeto final", prazo: somarDias(base.hoje, 25) },
    ];
    for (const a of atividades) {
      const atividade =
        (await prisma.atividade.findFirst({ where: { turmaId: turma.id, descricao: a.descricao } })) ??
        (await prisma.atividade.create({ data: { turmaId: turma.id, descricao: a.descricao, prazo: paraData(a.prazo) } }));
      if (a.prazo >= base.hoje) continue;
      for (const e of daTurma) {
        const sorteio = aleatorio();
        const [noPrazo, atrasada] = e.perfil === "bom" ? [0.92, 0.05] : e.perfil === "medio" ? [0.7, 0.15] : [0.4, 0.3];
        if (sorteio >= noPrazo + atrasada) continue; // sem entrega: aparece como Atrasada (OPEN-010)
        const data = sorteio < noPrazo ? somarDias(a.prazo, -Math.floor(entre(0, 3))) : somarDias(a.prazo, Math.min(3, Math.ceil(entre(1, 4))));
        await prisma.entrega.upsert({
          where: { atividadeId_estudanteId: { atividadeId: atividade.id, estudanteId: e.id } },
          update: {},
          create: { atividadeId: atividade.id, estudanteId: e.id, dataEntrega: paraData(data <= base.hoje ? data : base.hoje) },
        });
      }
    }

    // Planos de recuperação (SPEC-008) para até 2 estudantes em Risco por turma; um deles já encerrado na primeira turma.
    const emRisco = await prisma.indicadorAcademico.findMany({ where: { turmaId: turma.id, situacao: "Risco" }, select: { estudanteId: true }, orderBy: { estudanteId: "asc" }, take: 2 });
    for (const [k, { estudanteId }] of emRisco.entries()) {
      if (estudanteId === base.estudanteTesteId) continue;
      if (await prisma.planoRecuperacao.findFirst({ where: { estudanteId, turmaId: turma.id } })) continue;
      const encerrado = indice === 0 && k === 1;
      const itens = ITENS_PLANO.slice(k, k + 4);
      const concluidos = encerrado ? itens.length : 1 + (indice % 2);
      await prisma.planoRecuperacao.create({
        data: {
          estudanteId, turmaId: turma.id, professorId,
          status: encerrado ? "Encerrado" : "Ativo",
          criadoEm: new Date(`${somarDias(base.hoje, -12)}T12:00:00Z`),
          encerradoEm: encerrado ? new Date(`${somarDias(base.hoje, -2)}T12:00:00Z`) : null,
          itens: { create: itens.map((descricao, ordem) => ({ descricao, ordem, concluido: ordem < concluidos, concluidoEm: ordem < concluidos ? new Date(`${somarDias(base.hoje, -10 + ordem * 2)}T12:00:00Z`) : null })) },
        },
      });
      resumo.planos++;
    }
  }
  const total = Object.values(porCurso).reduce((s, l) => s + l.length, 0);
  console.log(`Simulação pronta: ${resumo.turmas} turmas, ${total} estudantes, ${resumo.matriculas} matrículas, ${resumo.notas} notas, ${resumo.planos} planos novos.`);
}

// Bancos anteriores à SPEC-015 tinham estudantes matriculados em turmas de cursos diferentes. Para os dados de
// demonstração respeitarem RB-19, tira das contas do seed (@studytrack.test) as matrículas fora do próprio curso,
// com o que dependia delas (notas, histórico, frequência, indicador, entregas e planos daquela turma).
export async function alinharMatriculasAoCurso() {
  const foraDoCurso = await prisma.matricula.findMany({
    where: { estudante: { email: { endsWith: "@studytrack.test" } } },
    select: { estudanteId: true, turmaId: true, estudante: { select: { cursoId: true } }, turma: { select: { cursoId: true } } },
  });
  let removidas = 0;
  for (const m of foraDoCurso.filter((x) => x.estudante.cursoId !== x.turma.cursoId)) {
    const par = { estudanteId: m.estudanteId };
    await prisma.$transaction([
      prisma.historicoNota.deleteMany({ where: { ...par, avaliacao: { turmaId: m.turmaId } } }),
      prisma.nota.deleteMany({ where: { ...par, avaliacao: { turmaId: m.turmaId } } }),
      prisma.entrega.deleteMany({ where: { ...par, atividade: { turmaId: m.turmaId } } }),
      prisma.frequencia.deleteMany({ where: { ...par, turmaId: m.turmaId } }),
      prisma.indicadorAcademico.deleteMany({ where: { ...par, turmaId: m.turmaId } }),
      prisma.planoRecuperacao.deleteMany({ where: { ...par, turmaId: m.turmaId } }),
      prisma.matricula.delete({ where: { estudanteId_turmaId: { estudanteId: m.estudanteId, turmaId: m.turmaId } } }),
    ]);
    removidas++;
  }
  // Cursos provisórios da migração que ficaram vazios.
  await prisma.curso.deleteMany({ where: { nome: { startsWith: "Curso provisório" }, turmas: { none: {} }, estudantes: { none: {} } } });
  if (removidas > 0) console.log(`Matrículas fora do curso removidas dos dados de demonstração: ${removidas}`);
}
