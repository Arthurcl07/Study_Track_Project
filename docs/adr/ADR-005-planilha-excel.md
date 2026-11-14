# ADR-005 — Planilha Excel com exceljs

## Contexto
O OPEN-070 (Arthur, 2026-11-14) pede a exportação do relatório acadêmico em planilha Excel de verdade (.xlsx), com abas e
formatação, além do CSV que já existe. O formato .xlsx é um ZIP de XML: escrever à mão é frágil.

## Decisão
Usar a biblioteca **exceljs** (MIT, só no servidor) para gerar o .xlsx na rota de exportação. Ela não entra no código
que roda no navegador nem nas regras de domínio: o domínio continua entregando as linhas consolidadas (`src/domain/relatorio.ts`).

## Alternativas consideradas
- **CSV com ajustes para o Excel:** rejeitado pelo pedido; não tem abas nem formatação.
- **SheetJS (xlsx):** a versão do npm está desatualizada e a atual é distribuída fora do registro npm.

## Consequências
- Uma dependência de produção nova, pequena e só no servidor; entra no `npm audit` da verificação de qualidade.
- O PDF não precisa de biblioteca: usa a versão para impressão, como boletim e histórico (SPEC-020).
