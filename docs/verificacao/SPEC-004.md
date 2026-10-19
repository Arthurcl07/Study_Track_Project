# Verificação — SPEC-004 (Registro de avaliações, notas e médias)

**Data:** 2026-10-13
**Status da Spec:** `implementada`
**Comando:** `npm test` (Vitest 3.2.7, PostgreSQL 17 local)
**Resultado geral:** suíte completa com 5 arquivos e 63 testes aprovados, 0 falhas (15 da SPEC-004). `npx prisma migrate dev`: nenhuma migração pendente (OPEN-016). `npm run seed`: avaliação de exemplo criada. `npx tsc --noEmit`: sem erros.

## Decisões usadas (decisoes-em-aberto.md)

**OPEN-001 (fechada):** o Professor registra avaliações e notas só nas turmas que leciona.
**OPEN-002 (fechada):** nota de 0 a 10; peso maior que zero; média ponderada pelos pesos das avaliações que já têm nota; classificação com o valor exato.
**OPEN-016 (fechada):** sem migração nova; `Avaliacao` e `Nota` (FKs, índice único `(avaliacaoId, estudanteId)`, CHECKs de peso e valor) vêm da migração `spec_003_indicador`.
**OPEN-017 (fechada):** o cadastro de avaliação pelo professor responsável faz parte da SPEC-004 (AC-004-06 e AC-004-07).
**OPEN-018 (fechada):** ao alterar uma nota, `dataRegistro` mantém a data do primeiro lançamento.

## Onde está cada coisa

| Parte | Arquivo |
|---|---|
| Validação do valor da nota e da avaliação (função pura) | `src/domain/registro-notas.ts` |
| Média ponderada e classificação (reaproveitadas da SPEC-003, sem duplicar) | `src/domain/situacao-academica.ts` (`calcularMedia`, `classificarSituacao`) |
| Casos de uso: cadastrar avaliação, registrar nota, alterar nota (escrita + `recalcularIndicador` na mesma transação) | `src/server/academico/notas.ts` |
| Acesso a dados com escopo do professor na própria query | `src/server/dados/notas.ts` |
| Permissão por perfil (só Professor) | `src/domain/autorizacao.ts` (`registro-desempenho`) |
| Rotas HTTP | `POST /api/notas`, `PATCH /api/notas/:id`, `POST /api/turmas/:id/avaliacoes` |
| Tela do professor | `/professor/notas` (`src/app/professor/notas/page.tsx`, `src/components/lancamento-notas.tsx`) |
| Banco | migração `spec_003_indicador` (OPEN-016): `Avaliacao`, `Nota`, FKs, índice único e CHECKs |
| Dados de exemplo | `prisma/seed.ts`: avaliação "Prova 1 (exemplo)" na Turma de exemplo (idempotente) |

## Critérios de aceitação e invariantes

| Critério | Teste (`tests/spec-004/notas.test.ts` ›) | Resultado |
|---|---|---|
| AC-004-01 | AC-004-01: professor responsável lança nota válida; nota associada ao estudante e à avaliação, média e indicador atualizados | Aprovado |
| AC-004-02 | AC-004-02: nota inválida é rejeitada e a correção é solicitada | Aprovado |
| AC-004-03 | AC-004-03: alterar nota já lançada sobrescreve o valor e recalcula a média | Aprovado |
| AC-004-04 | AC-004-04: professor de outra turma tenta lançar ou alterar nota e tem o acesso negado | Aprovado |
| AC-004-05 | AC-004-05: estudante autenticado tenta lançar nota e tem o acesso negado | Aprovado |
| AC-004-06 | AC-004-06: professor responsável cria avaliação (turma, peso, data) com peso maior que zero | Aprovado |
| AC-004-07 | AC-004-07: professor de outra turma e estudante não cadastram avaliação (acesso negado) | Aprovado |
| INV-004-01 | INV-004-01: cada nota pertence a exatamente 1 avaliação e 1 estudante (sem segunda nota no mesmo par) | Aprovado |
| INV-004-02 | INV-004-02: só o professor responsável lança nota da turma; avaliação de outra turma, estudante não matriculado e pedido sem sessão são recusados | Aprovado |
| INV-004-03 | INV-004-03: a escrita da nota e o recálculo do indicador estão na mesma transação (falha no recálculo desfaz a escrita) | Aprovado |
| INV-004-04 | INV-004-04: valor inválido nunca é persistido, no registro nem na alteração (e o banco também recusa) | Aprovado |

## Regras de negócio (testes unitários de domínio, sem banco)

| RB / decisão | Teste (`tests/spec-004/notas.test.ts` ›) | Resultado |
|---|---|---|
| RB-09 / OPEN-002 | RB-09 / OPEN-002: validarValorNota aceita de 0 a 10, limites incluídos, e vírgula decimal | Aprovado |
| RB-09 / OPEN-002 | RB-09 / OPEN-002: valor fora de 0 a 10, vazio ou não numérico é recusado com mensagem de correção | Aprovado |
| RB-06 / RB-07 / RB-09 | RB-06 / RB-07 / RB-09: a média é ponderada pelos pesos das avaliações com nota e classifica sem arredondar | Aprovado |
| OPEN-002 / OPEN-017 | OPEN-002 / OPEN-017: avaliação exige nome, peso maior que zero e data válida | Aprovado |

## Casos de teste derivados (seção 12)

| Caso | Teste | Resultado |
|---|---|---|
| 12.1 Lançamento feliz e recálculo | AC-004-01 | Aprovado |
| 12.2 Valor fora da faixa (OPEN-002) | AC-004-02, INV-004-04 e os unitários de validação | Aprovado |
| 12.3 Alteração de nota recalcula indicador | AC-004-03 | Aprovado |
| 12.4 Escopo do professor e negação ao estudante | AC-004-04, AC-004-05, INV-004-02 | Aprovado |
| 12.5 Cadastro de avaliação e negações (OPEN-017) | AC-004-06, AC-004-07 | Aprovado |

## RNFs (seção 10)

| RNF | Verificação | Resultado |
|---|---|---|
| RNF-03 | AC-004-04, AC-004-07 e INV-004-02: professor de outra turma recusado no servidor (403); sem sessão, 401 | Aprovado |
| RNF-05 | INV-004-02 e a tela `/professor/notas`, que só carrega turmas que o professor leciona | Aprovado |
| RNF-04 | Manual: `/professor/notas` em viewport de celular (375×812) e desktop; lançar, alterar, valor inválido com mensagem de correção e cadastro de avaliação | Aprovado (manual) |

## Verificação manual

**Data:** 2026-10-13 — **verificado por Arthur** (no navegador, com as contas do seed, em desktop e em viewport de celular)

| Item | Resultado |
|---|---|
| Professor do seed lança nota na "Prova 1 (exemplo)" e o indicador do estudante aparece atualizado em `/api/indicadores` | Aprovado (nota 8, média 8) |
| Valor inválido (ex.: 11) mostra a mensagem de correção e não grava nada | Aprovado |
| Alterar a nota sobrescreve o valor | Aprovado (8 → 4, média 4) |
| Cadastro de avaliação com peso 0 é recusado; com peso > 0 aparece na lista | Aprovado |
| Tela `/professor/notas` utilizável em viewport de celular (RNF-04) | Aprovado |

## Limites conhecidos

- A implementação foi escrita num ambiente na nuvem sem acesso ao registro do npm; a migração, o seed, o `tsc` e a suíte completa foram rodados depois no ambiente local (Node.js 24, PostgreSQL 17), com os resultados acima.
- Registrar nota num par (avaliação, estudante) que já tem nota devolve 409 e indica a alteração (`PATCH /api/notas/:id`); a tela escolhe sozinha entre lançar e alterar.
- Na alteração, `dataRegistro` mantém a data do primeiro lançamento (OPEN-018); o instante da última atualização fica no `IndicadorAcademico.atualizadoEm`.

## Pendências para fechar a Spec como `implementada`

- Revisão do PR por um colega (estrategia-testes.md, seção 5).
