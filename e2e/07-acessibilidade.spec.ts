// SPEC-056 / RNF-07: axe (WCAG 2.1 A/AA) nas telas principais de cada perfil e o "Pular para o conteúdo".
import { expect, test } from "@playwright/test";
import { contaE2E, entrar, sair, semViolacoes, turmaE2E } from "./apoio";

test("telas principais sem violação de acessibilidade, e o Tab leva ao conteúdo", async ({ page }) => {
  const { coordenador, professor, turma, estudantes } = await turmaE2E(2);
  const secretaria = await contaE2E("Administrador");

  await entrar(page, estudantes[0].email, estudantes[0].senha);
  // AC-056-02: o primeiro Tab mostra o link de pular, e ele leva ao conteúdo.
  await page.keyboard.press("Tab");
  const pular = page.getByRole("link", { name: "Pular para o conteúdo" });
  await expect(pular).toBeFocused();
  await pular.press("Enter");
  await expect(page.locator("#conteudo")).toBeFocused();
  for (const caminho of ["/estudante", "/estudante/curso", "/requerimentos", "/estudante/documentos", "/meus-dados", "/ajuda"]) {
    await page.goto(caminho);
    await semViolacoes(page, caminho);
  }

  await sair(page);
  await entrar(page, professor.email, professor.senha);
  for (const caminho of ["/professor", `/professor/turmas/${turma.id}`, "/professor/frequencia"]) {
    await page.goto(caminho);
    await semViolacoes(page, caminho);
  }

  await sair(page);
  await entrar(page, coordenador.email, coordenador.senha);
  for (const caminho of ["/coordenador", "/evasao", "/coordenador/acompanhamento", `/coordenador/turmas/${turma.id}`]) {
    await page.goto(caminho);
    await semViolacoes(page, caminho);
  }

  await sair(page);
  await entrar(page, secretaria.email, secretaria.senha);
  for (const caminho of ["/admin", "/admin/contas", "/admin/configuracoes", "/admin/importar-anterior"]) {
    await page.goto(caminho);
    await semViolacoes(page, caminho);
  }
});
