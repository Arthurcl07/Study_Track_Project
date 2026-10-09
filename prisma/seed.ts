// Carga inicial: contas de TESTE, uma por perfil (OPEN-013 — sem cadastro público na SPEC-001).
// Valores apenas para ambiente local; nunca usar em produção.
import { salvarConta } from "../src/server/auth/contas";
import { prisma } from "../src/server/dados/prisma";
import type { Perfil } from "../src/domain/perfil";

const SENHA_DE_TESTE = "StudyTrack@2026";

const CONTAS_DE_TESTE: { nome: string; email: string; perfil: Perfil }[] = [
  { nome: "Estudante de Teste", email: "estudante@studytrack.test", perfil: "Estudante" },
  { nome: "Professor de Teste", email: "professor@studytrack.test", perfil: "Professor" },
  { nome: "Coordenador de Teste", email: "coordenador@studytrack.test", perfil: "Coordenador" },
];

async function main() {
  for (const conta of CONTAS_DE_TESTE) {
    await salvarConta({ ...conta, senha: SENHA_DE_TESTE });
    console.log(`Conta de teste pronta: ${conta.email} (${conta.perfil})`);
  }
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
