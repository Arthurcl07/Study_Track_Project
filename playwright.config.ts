// Testes ponta a ponta (SPEC-055, ADR-006): Chromium abrindo o sistema como uma pessoa.
// - `npm run e2e`: sem janela, contra o servidor que estiver em http://localhost:3000 (ou sobe o de produção).
// - `npm run e2e:ver`: com a janela aberta e devagar, para mostrar ao vivo na apresentação.
// Os testes criam os próprios dados (e-mails @e2e.studytrack.test) e apagam tudo no fim (e2e/limpeza.ts).
import { defineConfig, devices } from "@playwright/test";

const URL_BASE = process.env.E2E_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  globalSetup: "./e2e/preparacao.ts",
  globalTeardown: "./e2e/limpeza.ts",
  use: {
    baseURL: URL_BASE,
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    // AC da SPEC-055 (exceções): falha deixa captura de tela e vídeo em test-results/.
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
    navigationTimeout: 60_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 860 } } },
    {
      name: "apresentacao",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 860 }, headless: false, launchOptions: { slowMo: 450 }, video: "off" },
    },
  ],
  webServer: {
    command: "npm run start",
    url: URL_BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
