// SPEC-055: primeiro acesso de uma conta nova — aceite dos termos (SPEC-045, RB-43), tour (SPEC-059) e
// acessibilidade do aceite (SPEC-056).
import { expect, test } from "@playwright/test";
import { contaE2E, entrar, semViolacoes } from "./apoio";

test("primeiro acesso: aceita os termos, faz o tour e cai no dashboard", async ({ page }) => {
  const professor = await contaE2E("Professor", { primeiroAcesso: true, nome: "Professora Primeiro Acesso" });
  await entrar(page, professor.email, professor.senha);

  // RB-43: sem aceite, o sistema leva ao aceite.
  await expect(page).toHaveURL(/\/termos\/aceite/);
  await expect(page.getByRole("heading", { name: "Antes de começar" })).toBeVisible();
  await semViolacoes(page, "aceite dos termos");
  const aceitar = page.getByRole("button", { name: "Aceitar e continuar" });
  await expect(aceitar).toBeDisabled();
  await page.getByLabel("Li e aceito os Termos de uso e a Política de privacidade.").check();
  await aceitar.click();

  // SPEC-059: o tour aparece no primeiro acesso, com o item do menu destacado.
  await expect(page).toHaveURL(/\/professor$/);
  const tour = page.getByRole("dialog");
  await expect(tour).toContainText("Passo 1 de 6");
  await page.getByRole("button", { name: "Próximo" }).click();
  await expect(tour).toContainText("Notas e avaliações");
  await page.keyboard.press("ArrowRight");
  await expect(tour).toContainText("Chamada");
  await page.getByRole("button", { name: "Pular o tour" }).click();
  await expect(tour).toBeHidden();

  // Visto uma vez, não volta (INV-059-01); a Ajuda permite rever.
  await page.reload();
  await expect(page.getByRole("heading", { name: /Olá/ })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("link", { name: "Ajuda" }).click();
  await expect(page.getByRole("heading", { name: "Manual do professor" })).toBeVisible();
  await page.getByRole("button", { name: /Rever o tour/ }).click();
  await expect(page.getByRole("dialog")).toContainText("Passo 1 de 6");
});
