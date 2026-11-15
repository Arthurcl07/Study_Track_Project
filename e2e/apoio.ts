// Apoio dos testes de tela (SPEC-055): dados próprios de cada teste, criados direto no banco (e-mails
// @e2e.studytrack.test), e login pela tela. INV-055-01: nenhum teste depende de outro nem da ordem.
import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";
import { PrismaClient, type Perfil } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { VERSAO_TERMOS } from "../src/domain/lgpd";

config({ quiet: true });

export const DOMINIO_E2E = "@e2e.studytrack.test";
export const SENHA_E2E = "Senha-e2e-2026";
export const SENHA_DO_SEED = "StudyTrack@2026";
export const prisma = new PrismaClient();

const hash = hashSync(SENHA_E2E, 10);

export const emailE2E = (prefixo: string) => `${prefixo}-${randomUUID().slice(0, 8)}${DOMINIO_E2E}`;

// Conta pronta para usar: senha definida, termos aceitos e tour visto (a não ser que se peça o primeiro acesso).
export async function contaE2E(perfil: Perfil, opcoes: { cursoId?: string; nome?: string; primeiroAcesso?: boolean } = {}) {
  const email = emailE2E(perfil.toLowerCase());
  const usuario = await prisma.usuario.create({
    data: {
      nome: opcoes.nome ?? `E2E ${perfil}`,
      email,
      senhaHash: hash,
      perfil,
      cursoId: perfil === "Estudante" ? opcoes.cursoId : null,
      trocarSenha: false,
      tourVistoEm: opcoes.primeiroAcesso ? null : new Date(),
      ...(opcoes.primeiroAcesso ? {} : { aceites: { create: { versao: VERSAO_TERMOS } } }),
    },
  });
  return { ...usuario, senha: SENHA_E2E };
}

// Curso, disciplina e turma de 2026/2 com professor e estudantes próprios do teste.
export async function turmaE2E(estudantes = 2) {
  const coordenador = await contaE2E("Coordenador");
  const curso = await prisma.curso.create({ data: { nome: `E2E Curso ${randomUUID().slice(0, 6)}`, coordenadorId: coordenador.id } });
  const disciplina = await prisma.disciplina.create({ data: { nome: `E2E Disciplina ${randomUUID().slice(0, 6)}`, cargaHoraria: 60, cursos: { create: { cursoId: curso.id, semestre: 1 } } } });
  const professor = await contaE2E("Professor", { nome: "E2E Professora Teste" });
  const turma = await prisma.turma.create({ data: { nome: `Turma E2E-${randomUUID().slice(0, 4)}`, periodo: "2026/2", disciplinaId: disciplina.id, professorId: professor.id, cursoId: curso.id } });
  const lista = [];
  for (let i = 0; i < estudantes; i++) lista.push(await contaE2E("Estudante", { cursoId: curso.id, nome: `E2E Estudante ${i + 1}` }));
  await prisma.matricula.createMany({ data: lista.map((e) => ({ estudanteId: e.id, turmaId: turma.id })) });
  return { coordenador, curso, disciplina, professor, turma, estudantes: lista };
}

export async function entrar(page: Page, email: string, senha: string) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

export async function sair(page: Page) {
  await page.context().clearCookies();
}

// SPEC-056 / INV-056-01: nenhuma violação WCAG 2.1 A/AA na tela.
export async function semViolacoes(page: Page, tela: string) {
  const resultado = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const violacoes = resultado.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
  expect(violacoes, `Violações de acessibilidade em ${tela}`).toEqual([]);
}
