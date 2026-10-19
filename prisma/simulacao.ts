// Simulação de uma instituição (dados FICTÍCIOS, só para ambiente local e apresentação): 6 disciplinas,
// 6 turmas, 5 professores, 2 coordenadores e cerca de 50 estudantes, com avaliações, notas, frequência,
// atividades, entregas, planos de recuperação e histórico de notas.
// - Determinística: um gerador com semente fixa produz sempre os mesmos números.
// - Idempotente: rodar o seed de novo não duplica nada; notas e frequências voltam aos valores simulados.
// - A situação (Normal/Atenção/Risco) nunca é escrita aqui: sai de recalcularIndicador (regra única, DA-02).
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
];

const SEGUNDA_COORDENADORA = { nome: "Paula Martins", email: "paula.martins@studytrack.test" };

// professor: índice em PROFESSORES ou "teste" (Professor de Teste); coordenador: "teste" ou "paula".
const TURMAS = [
  { disciplina: "Banco de Dados", carga: 80, nome: "Turma BD-A", professor: 0, coordenador: "teste" },
  { disciplina: "Engenharia de Software", carga: 80, nome: "Turma ES-A", professor: 1, coordenador: "teste" },
  { disciplina: "Estruturas de Dados", carga: 60, nome: "Turma ED-B", professor: 2, coordenador: "teste" },
  { disciplina: "Sistemas Operacionais", carga: 60, nome: "Turma SO-B", professor: "teste", coordenador: "teste" },
  { disciplina: "Redes de Computadores", carga: 60, nome: "Turma RC-A", professor: 3, coordenador: "paula" },
  { disciplina: "Cálculo I", carga: 80, nome: "Turma CAL-C", professor: 4, coordenador: "paula" },
] as const;

const AVALIACOES = [
  { nome: "Prova 1", peso: 2, data: "2026-09-15" },
  { nome: "Lista de exercícios", peso: 1, data: "2026-09-29" },
  { nome: "Trabalho em grupo", peso: 1, data: "2026-10-08" },
  // Ainda sem nota: a média usa só as avaliações já lançadas (OPEN-002).
  { nome: "Prova 2", peso: 2, data: "2026-11-24" },
];

const ITENS_PLANO = ["Refazer a lista de exercícios", "Plantão de dúvidas com o professor", "Resumo do conteúdo da Prova 1",
  "Simulado antes da Prova 2", "Entregar o trabalho pendente"];

type Perfil = "bom" | "medio" | "fraco";
type Estudante = { id: string; nome: string; perfil: Perfil; faltoso: boolean };

export async function simularInstituicao(base: { senha: string; coordenadorTesteId: string; professorTesteId: string; estudanteTesteId: string; hoje: string }) {
  // Contas: senha das contas de teste e sem troca obrigatória (seed, OPEN-026).
  const professores = [];
  for (const p of PROFESSORES) professores.push(await salvarConta({ ...p, senha: base.senha, perfil: "Professor" }));
  const paula = await salvarConta({ ...SEGUNDA_COORDENADORA, senha: base.senha, perfil: "Coordenador" });

  // ~50 estudantes com combinações distintas de nome e sobrenome.
  const estudantes: Estudante[] = [];
  for (let i = 0; i < 50; i++) {
    const nome = `${NOMES[i % NOMES.length]} ${SOBRENOMES[(i * 7 + Math.floor(i / NOMES.length)) % SOBRENOMES.length]}`;
    const [primeiro, ultimo] = [nome.split(" ")[0], nome.split(" ")[1]];
    const conta = await salvarConta({ nome, email: `${semAcento(primeiro)}.${semAcento(ultimo)}@studytrack.test`, senha: base.senha, perfil: "Estudante" });
    const sorteio = aleatorio();
    estudantes.push({ id: conta.id, nome, perfil: sorteio < 0.6 ? "bom" : sorteio < 0.85 ? "medio" : "fraco", faltoso: aleatorio() < 0.12 });
  }
  const estudanteTeste: Estudante = { id: base.estudanteTesteId, nome: "Estudante de Teste", perfil: "medio", faltoso: false };

  let resumo = { turmas: 0, matriculas: 0, notas: 0, planos: 0 };
  for (const [indice, def] of TURMAS.entries()) {
    const disciplina =
      (await prisma.disciplina.findFirst({ where: { nome: def.disciplina } })) ??
      (await prisma.disciplina.create({ data: { nome: def.disciplina, cargaHoraria: def.carga } }));
    const professorId = def.professor === "teste" ? base.professorTesteId : professores[def.professor].id;
    const coordenadorId = def.coordenador === "teste" ? base.coordenadorTesteId : paula.id;
    const turma =
      (await prisma.turma.findFirst({ where: { nome: def.nome, coordenadorId } })) ??
      (await prisma.turma.create({ data: { nome: def.nome, periodo: "2026/2", disciplinaId: disciplina.id, professorId, coordenadorId } }));
    resumo.turmas++;

    // 14 estudantes por turma, com sobreposição entre turmas (cada estudante faz 1 a 3 disciplinas).
    const daTurma = Array.from({ length: 14 }, (_, k) => estudantes[(indice * 8 + k) % estudantes.length]);
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

    // Atividades: duas vencidas e uma futura; entregas no prazo, atrasadas ou faltando conforme o perfil.
    const atividades = [
      { descricao: "Lista de exercícios 1", prazo: somarDias(base.hoje, -20) },
      { descricao: "Relatório parcial do projeto", prazo: somarDias(base.hoje, -5) },
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
  console.log(`Simulação pronta: ${resumo.turmas} turmas, ${estudantes.length} estudantes, ${resumo.matriculas} matrículas, ${resumo.notas} notas, ${resumo.planos} planos novos.`);
}
