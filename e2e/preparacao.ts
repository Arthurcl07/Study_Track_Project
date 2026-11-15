// Antes dos testes de tela (SPEC-055): o sistema precisa ter o seed (as contas de teste) e nenhum resto de uma
// execução anterior interrompida.
import { prisma } from "./apoio";
import limpeza from "./limpeza";

export default async function preparacao() {
  await limpeza();
  const admin = await prisma.usuario.findUnique({ where: { email: "admin@studytrack.test" } });
  if (!admin) throw new Error("Rode o seed antes dos testes de tela: npm run seed");
  await prisma.periodoLetivo.upsert({ where: { nome: "2026/2" }, update: {}, create: { nome: "2026/2" } });
}
