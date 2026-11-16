// SPEC-055: o estudante pede o trancamento de uma disciplina e a secretaria defere (SPEC-036, SPEC-044, RB-34, RB-42).
import { expect, test } from "@playwright/test";
import { contaE2E, entrar, prisma, sair, semViolacoes, turmaE2E } from "./apoio";

test("requerimento de trancamento: o estudante pede, a secretaria defere e a disciplina fica trancada", async ({ page }) => {
  const { turma, estudantes } = await turmaE2E(1);
  const [estudante] = estudantes;
  const secretaria = await contaE2E("Administrador", { nome: "E2E Secretaria" });

  await entrar(page, estudante.email, estudante.senha);
  await page.getByRole("link", { name: "Requerimentos" }).click();
  await page.getByLabel("Tipo").selectOption({ label: "Trancamento de disciplina" });
  await page.getByLabel("Disciplina que quer trancar").selectOption({ index: 0 });
  await page.getByLabel("Motivo").fill("Vou trabalhar no horário desta disciplina.");
  await page.getByRole("button", { name: "Enviar requerimento" }).click();
  await expect(page.getByRole("row").filter({ hasText: "Trancamento de disciplina" })).toBeVisible();
  await semViolacoes(page, "requerimentos do estudante");

  await sair(page);
  await entrar(page, secretaria.email, secretaria.senha);
  await page.goto("/requerimentos");
  const linha = page.getByRole("row").filter({ hasText: estudante.nome });
  await linha.getByRole("button").first().click();
  await page.getByLabel("Resposta").fill("Deferido conforme o regimento.");
  await page.getByRole("button", { name: "Deferir e trancar" }).click();
  await expect(linha).toContainText("Deferido");

  const matricula = await prisma.matricula.findUniqueOrThrow({ where: { estudanteId_turmaId: { estudanteId: estudante.id, turmaId: turma.id } } });
  expect(matricula.situacao).toBe("Trancada");
});
