// Depois dos testes de tela (SPEC-055, INV-055-01): apaga tudo o que eles criaram (e-mails @e2e.studytrack.test,
// cursos "E2E ..." e tentativas de login), deixando o banco como o seed deixou.
import { DOMINIO_E2E, prisma } from "./apoio";

export default async function limpeza() {
  const deTeste = { email: { endsWith: DOMINIO_E2E } };
  const cursos = { nome: { startsWith: "E2E Curso" } };
  await prisma.turma.deleteMany({ where: { OR: [{ professor: deTeste }, { curso: cursos }] } });
  await prisma.usuario.deleteMany({ where: { ...deTeste, perfil: "Estudante" } });
  await prisma.curso.deleteMany({ where: cursos });
  await prisma.disciplina.deleteMany({ where: { nome: { startsWith: "E2E Disciplina" } } });
  await prisma.usuario.deleteMany({ where: deTeste });
  await prisma.tentativaLogin.deleteMany({ where: { email: { endsWith: DOMINIO_E2E } } });
  await prisma.registroErro.deleteMany({ where: { mensagem: { contains: "Erro de teste disparado" } } });
}
