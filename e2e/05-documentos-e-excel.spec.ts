// SPEC-055: documentos oficiais (SPEC-048) e relatório em Excel (SPEC-049) pela coordenação.
import { expect, test } from "@playwright/test";
import { entrar, prisma, semViolacoes, turmaE2E } from "./apoio";

test("coordenação baixa o Excel e abre o diário, a lista de presença e a ata da turma", async ({ page }) => {
  const { coordenador, turma, estudantes } = await turmaE2E(3);
  for (const [i, e] of estudantes.entries()) {
    await prisma.indicadorAcademico.create({ data: { estudanteId: e.id, turmaId: turma.id, media: [8, 5.5, 3][i], frequenciaAtual: 90, situacao: (["Normal", "Atencao", "Risco"] as const)[i], atualizadoEm: new Date() } });
  }
  await entrar(page, coordenador.email, coordenador.senha);
  await page.getByRole("link", { name: "Relatórios" }).click();
  await semViolacoes(page, "relatório");
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: "Excel" }).click()]);
  expect(download.suggestedFilename()).toMatch(/^relatorio-studytrack-.*\.xlsx$/);

  await page.goto(`/coordenador/turmas/${turma.id}`);
  await page.getByRole("link", { name: "Diário de classe" }).click();
  await expect(page.getByRole("heading", { name: "Diário de classe" })).toBeVisible();
  await page.goto(`/documentos/lista-presenca?turma=${turma.id}`);
  await expect(page.getByText("E2E Estudante 1")).toBeVisible();
  // INV-048-01: com o diário aberto a ata não sai; homologado, sai.
  await page.goto(`/documentos/ata?turma=${turma.id}`);
  await expect(page.getByText(/só sai com o diário homologado/)).toBeVisible();
  await prisma.turma.update({ where: { id: turma.id }, data: { diario: "Homologado", diarioHomologadoEm: new Date() } });
  await page.reload();
  await expect(page.getByText(/Totais:/)).toBeVisible();
});
