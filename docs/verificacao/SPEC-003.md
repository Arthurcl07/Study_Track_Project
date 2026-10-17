# Verificação — SPEC-003 (Cálculo da situação acadêmica e indicador persistido)

**Data:** 2026-10-09
**Status da Spec:** `em implementação`
**Comando:** `npm test` (Vitest 3.2.7, PostgreSQL 17 local)
**Resultado geral:** 4 arquivos, 48 testes aprovados, 0 pendentes, 0 falhas (21 deles em `tests/spec-003/indicador.test.ts`).
**Outras checagens:** `tsc --noEmit` sem erros; `next build` concluído.

## Decisão usada (decisoes-em-aberto.md)

**OPEN-002 (fechada):** nota de 0 a 10; peso maior que zero; média ponderada pelos pesos das avaliações que já têm nota; classificação com o valor exato, sem arredondar; sem nota só a frequência classifica; sem frequência só a média classifica; sem nenhum dos dois, Normal.

## Onde está cada coisa

| Parte | Arquivo |
|---|---|
| Regra de classificação e média (função pura, única no código) | `src/domain/situacao-academica.ts` |
| Recálculo do indicador (aceita transação, para SPEC-004/005) | `src/server/academico/indicador.ts` |
| Acesso a dados e consulta por escopo | `src/server/dados/indicadores.ts` |
| Consulta HTTP | `GET /api/indicadores` |
| Banco | migração `spec_003_indicador`: `Avaliacao`, `Nota`, `Frequencia`, `IndicadorAcademico` (único por estudante e turma) e CHECKs de faixa |

## Critérios de aceitação e invariantes

| Critério | Teste (`tests/spec-003/indicador.test.ts` ›) | Resultado |
|---|---|---|
| AC-003-01 | AC-003-01: média 6 e frequência 75% → Normal | Aprovado |
| AC-003-02 | AC-003-02: média 5 e frequência 80% → Atenção | Aprovado |
| AC-003-03 | AC-003-03: média 5,95 e frequência 80% → Atenção | Aprovado |
| AC-003-04 | AC-003-04: média 4,9 e frequência 90% → Risco | Aprovado |
| AC-003-05 | AC-003-05: média 8 e frequência 74,9% → Risco | Aprovado |
| AC-003-06 | AC-003-06: média 5 e frequência 75% → Atenção | Aprovado |
| AC-003-07 | AC-003-07: alterar nota recalcula o indicador e renova o instante de atualização | Aprovado |
| INV-003-01 | INV-003-01: frequência abaixo de 75% é Risco independentemente da média | Aprovado |
| INV-003-02 / 03 | INV-003-02 / INV-003-03: limites de 5 e 6 | Aprovado |
| INV-003-04 | INV-003-04: sempre exatamente uma das três situações (varredura de médias e frequências) | Aprovado |
| INV-003-05 | INV-003-05: exatamente 1 indicador por estudante e turma (upsert + índice único no banco) | Aprovado |
| INV-003-06 | INV-003-06: varredura de `src/` confirma que a regra só existe em `domain/situacao-academica.ts` | Aprovado |
| Contratos | Classificar recusa dados fora da faixa; Recalcular recusa estudante não matriculado sem gravar nada | Aprovado |
| OPEN-002 | dados ausentes; média ponderada; avaliação sem nota fora da média; CHECKs de faixa no banco | Aprovado |

## Casos de teste derivados (seção 12)

| Caso | Teste | Resultado |
|---|---|---|
| 12.1 Tabela de limites 4,99 / 5,0 / 5,95 / 6,0 / 74,9% / 75% | Caso de teste 12.1 | Aprovado |
| 12.2 Recálculo ao alterar nota e frequência | AC-003-07 e "alterar frequência recalcula o indicador" | Aprovado |
| 12.3 Um único indicador vigente | INV-003-05 | Aprovado |
| 12.4 A classificação roda sem banco | bloco "classificação (função pura, sem banco)" | Aprovado |

## RNFs (seção 10)

| RNF | Verificação | Resultado |
|---|---|---|
| RNF-03, RNF-05 | Estudante, Professor e Coordenador só leem indicadores do próprio escopo; sem sessão → 401 | Aprovado |
| RNF-01 | Indicador persistido e lido por índice (DA-05); medição de tempo fica para as telas das SPEC-006/007 | Não medido nesta Spec |

## Limites conhecidos

- Ainda não existe tela nem rota para lançar nota ou frequência: isso é da SPEC-004 e da SPEC-005, que devem chamar `recalcularIndicador` dentro da mesma transação da escrita (RB-10, AD-02). Os testes desta Spec gravam notas e frequências direto no banco para exercitar o recálculo.
- "Atividade relevante" (RB-10) não entra no cálculo da classificação (RB-09 usa só média e frequência); o gatilho de recálculo por atividade fica para a SPEC-005.

## Pendências para fechar a Spec como `implementada`

- Conferência humana do OPEN-002 (a decisão foi delegada ao agente) e revisão do PR por um colega.
