// SPEC-055: o professor lança uma nota e a situação do estudante muda na hora (SPEC-004, RB-05 a RB-07, RB-03).
import { expect, test } from "@playwright/test";
import { entrar, prisma, sair, semViolacoes, turmaE2E } from "./apoio";

test("professor lança 3,0 e o estudante entra em Risco no painel", async ({ page }) => {
  const { professor, turma, estudantes } = await turmaE2E(1);
  const [estudante] = estudantes;
  await prisma.avaliacao.create({ data: { turmaId: turma.id, nome: "Prova 1", peso: 1, data: new Date(), tipo: "Prova" } });

  await entrar(page, professor.email, professor.senha);
  await page.getByRole("link", { name: "Notas e avaliações" }).click();
  await page.getByLabel("Turma", { exact: true }).selectOption({ label: `${turma.nome} · ${(await prisma.disciplina.findUniqueOrThrow({ where: { id: turma.disciplinaId } })).nome} · 2026/2` });
  await page.getByLabel("Avaliação").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Lançar" }).click();
  await page.getByLabel("Nota (0 a 10)").fill("3");
  await page.getByRole("button", { name: "Lançar nota" }).click();
  await expect(page.getByRole("button", { name: "Alterar", exact: true })).toBeVisible();
  await semViolacoes(page, "lançamento de notas");

  await sair(page);
  await entrar(page, estudante.email, estudante.senha);
  await expect(page).toHaveURL(/\/estudante$/);
  await expect(page.getByText("■ Risco").first()).toBeVisible();
  await semViolacoes(page, "dashboard do estudante");
});
