// Carga inicial: contas de TESTE, uma por perfil (OPEN-013 — sem cadastro público na SPEC-001),
// e uma turma de exemplo da SPEC-002 ligando as três contas. Apenas para ambiente local.
import { salvarConta } from "../src/server/auth/contas";
import { prisma } from "../src/server/dados/prisma";
import type { Perfil } from "../src/domain/perfil";

const SENHA_DE_TESTE = "StudyTrack@2026";

const CONTAS_DE_TESTE: { nome: string; email: string; perfil: Perfil }[] = [
  { nome: "Estudante de Teste", email: "estudante@studytrack.test", perfil: "Estudante" },
  { nome: "Professor de Teste", email: "professor@studytrack.test", perfil: "Professor" },
  { nome: "Coordenador de Teste", email: "coordenador@studytrack.test", perfil: "Coordenador" },
];

const DISCIPLINA_EXEMPLO = { nome: "Modelagem de Software (exemplo)", cargaHoraria: 60 };
const TURMA_EXEMPLO = { nome: "Turma de exemplo", periodo: "2026/2" };

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
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
