// SPEC-055: limite de tentativas no login (SPEC-046, RB-44) e acessibilidade do login pelo teclado (SPEC-056).
import { expect, test } from "@playwright/test";
import { emailE2E, semViolacoes } from "./apoio";

test("login: avisa as tentativas que restam e bloqueia na 5ª errada", async ({ page }) => {
  const email = emailE2E("bloqueio");
  await page.goto("/login");
  await semViolacoes(page, "login");

  // AC-056-02: o formulário funciona só pelo teclado.
  // O aviso do formulário (o anunciador de rotas do Next.js também tem role="alert").
  const aviso = page.locator("form").getByRole("alert");
  await page.getByLabel("E-mail").fill(email);
  for (let i = 1; i <= 5; i++) {
    await page.getByLabel("Senha").fill(`errada-${i}`);
    await page.getByLabel("Senha").press("Enter");
    if (i === 3) await expect(aviso).toContainText("Restam 2 tentativas");
    if (i < 5) await expect(aviso).toContainText("E-mail ou senha inválidos");
  }
  await expect(aviso).toContainText(/bloqueado até \d{2}:\d{2}/);
});
