# Verificação — SPEC-005 (Frequência, atividades e entregas atrasadas)

**Data:** 2026-10-16
**Status da Spec:** `implementada`
**Comando:** `npm test` (Vitest 3.2.7, PostgreSQL 17 local)
**Resultado geral:** 8 arquivos, **88 testes aprovados**, 0 pendentes, 0 falhas (24 deles em `tests/spec-005/`).
**Outras checagens:** `tsc --noEmit` sem erros no código (o cache `.next/dev/types` foi corrompido por um desligamento brusco do PC e é regenerado pelo Next.js); telas renderizadas no servidor de desenvolvimento.

## Decisões usadas (decisoes-em-aberto.md)

- **OPEN-003 (fechada):** o professor registra a entrega, com data (padrão: hoje), e pode desfazer; o estudante só visualiza.
- **OPEN-010 (fechada):** status derivado na leitura, sem rotina agendada; prazo vale até o fim do dia em Brasília.

## Onde está cada coisa

| Parte | Arquivo |
|---|---|
| Status de entrega, dia de Brasília e validações (funções puras, único lugar da regra) | `src/domain/atividades.ts`, `src/domain/frequencia.ts` |
| Casos de uso (frequência na mesma transação do indicador, atividade, entrega, consulta) | `src/server/academico/atividades.ts` |
| Acesso a dados com escopo na query (ADR-003) | `src/server/dados/atividades.ts` |
| API | `POST /api/frequencias`, `POST /api/turmas/:id/atividades`, `POST /api/atividades/:id/entregas`, `DELETE /api/entregas/:id`, `GET /api/atividades` |
| Banco | migração `spec_005_atividades_entregas`: `Atividade` e `Entrega` (única por estudante e atividade) |
| Telas | `/professor/frequencia`, `/professor/atividades`, `/professor/atividades/:id`, `/estudante/atividades` |

## Critérios de aceitação e invariantes

| Critério | Teste (`tests/spec-005/` ›) | Resultado |
|---|---|---|
| AC-005-01 | integracao › professor registra frequência e o indicador é recalculado (74,9% Risco, 75% Normal) | Aprovado |
| AC-005-02 | integracao › professor responsável cadastra atividade completa | Aprovado |
| AC-005-03 | integracao › atividade sem prazo é impedida; dominio › atividade sem prazo ou descrição é recusada | Aprovado |
| AC-005-04 | dominio › prazo encerrado e sem entrega; integracao › status calculados na consulta (estudante sem entrega vê Atrasada) | Aprovado |
| AC-005-05 | dominio › entregue antes do prazo e no último dia; integracao › No prazo | Aprovado |
| AC-005-06 | dominio › entregue depois do prazo; integracao › entrega registrada hoje em atividade vencida = Atrasada | Aprovado |
| AC-005-07 | dominio › prazo não encerrado e sem entrega; integracao › Pendente | Aprovado |
| AC-005-08 | integracao › professor de outra turma não registra frequência, atividade nem entrega (403, nada gravado) | Aprovado |
| AC-005-09 | integracao › o estudante só vê o próprio status de entrega | Aprovado |
| INV-005-01 | dominio › 74,9% leva a Risco e 75% não | Aprovado |
| INV-005-02 | ver AC-005-04 | Aprovado |
| INV-005-03 | integracao › segunda entrega do mesmo estudante recusada (409); desfazer remove o registro | Aprovado |
| INV-005-04 | integracao › se o recálculo falhar, a frequência também não é gravada (mesma transação) | Aprovado |
| INV-005-05 | ver AC-005-08 | Aprovado |
| INV-005-06 | dominio › varredura de `src/` confirma que o status só é decidido em `domain/atividades.ts` | Aprovado |
| RNF-03 | integracao › estudante e coordenador não registram; coordenador não consulta entregas; sem sessão 401 | Aprovado |

## Casos de teste derivados (seção 12)

| Caso | Teste | Resultado |
|---|---|---|
| 12.1 Frequência 74,9% Risco, 75% não | INV-005-01, AC-005-01 | Aprovado |
| 12.2 Atividade incompleta recusada | AC-005-03 | Aprovado |
| 12.3 Status nos dois lados do prazo, inclusive no último dia | dominio › status de entrega (6 casos) | Aprovado |
| 12.4 Escopo do professor e do estudante | AC-005-08, AC-005-09 | Aprovado |
| 12.5 Segunda entrega recusada | INV-005-03 | Aprovado |

## Verificação manual (agente, navegador)

| Item | Computador | Celular |
|---|---|---|
| Professor — atividades da turma com entregues e atrasadas (seed: uma vencida, uma futura) | Aprovado | — |
| Professor — registrar entrega hoje em atividade vencida mostra ■ Atrasada; desfazer volta ao estado anterior | Aprovado | — |
| Estudante — minhas atividades: contadores (1 pendente, 1 atrasada) e selos corretos | Aprovado | Aprovado |
| Professor — frequência: tabela com frequência e selo de situação | Aprovado | Aprovado |

**Revisão:** PR aprovado por Luiz Eduardo (#43) e integrado em `development` em 2026-10-17. Spec marcada como `implementada`.
