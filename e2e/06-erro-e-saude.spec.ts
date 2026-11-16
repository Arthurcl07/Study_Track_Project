// SPEC-055: página de erro com código (SPEC-047) e o mesmo código achado na Saúde do sistema (SPEC-057).
import { expect, test } from "@playwright/test";
import { contaE2E, entrar, semViolacoes } from "./apoio";

test("erro inesperado mostra a página com o código, e a secretaria acha o erro pelo código", async ({ page }) => {
  const secretaria = await contaE2E("Administrador", { nome: "E2E Secretaria" });
  await entrar(page, secretaria.email, secretaria.senha);
  await page.getByRole("link", { name: "Saúde do sistema" }).click();
  await expect(page.getByText("● OK")).toBeVisible();
  await semViolacoes(page, "saúde do sistema");

  await page.goto("/admin/saude/teste-erro");
  await expect(page.getByRole("heading", { name: "Algo deu errado" })).toBeVisible();
  const codigo = (await page.getByText(/^ERR-[0-9A-F]{6}$/).textContent())!.trim();
  // INV-047-01: nada técnico na tela.
  await expect(page.getByText("Erro de teste disparado")).toHaveCount(0);

  await page.goto(`/admin/saude?codigo=${codigo}`);
  await expect(page.getByText(codigo).first()).toBeVisible();
  await expect(page.getByText(/teste-erro/).first()).toBeVisible();
});
