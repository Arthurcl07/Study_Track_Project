# ADR-006 — Testes ponta a ponta com Playwright e axe

## Contexto
A estratégia de testes previa testes ponta a ponta sem ferramenta definida (OPEN-023). O item 46 da lista (Arthur,
2026-11-14) pede testes automáticos de tela no computador e na CI; o item 47 pede verificação de acessibilidade (RNF-07).

## Decisão
- **Playwright** (`@playwright/test`, Chromium) para os testes de tela em `e2e/`, contra o sistema rodando com o seed.
- **axe-core** (`@axe-core/playwright`) para conferir as regras WCAG 2.1 A e AA nas telas principais, dentro dos mesmos testes.
- Na CI, um job separado sobe o PostgreSQL, roda migração, seed e build, e executa os testes de tela.

## Alternativas consideradas
- **Cypress:** mais pesado e com o paralelismo pago; o Playwright já é o padrão do mercado para Next.js.
- **Só verificação manual (OPEN-023):** continua valendo como evidência, mas não protege contra regressões.

## Consequências
- Duas dependências de desenvolvimento novas e o download do Chromium (`npx playwright install chromium`).
- A CI fica alguns minutos mais lenta; o job de testes de tela é obrigatório como o de testes de unidade.
