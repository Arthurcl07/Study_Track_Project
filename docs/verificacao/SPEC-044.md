# Verificação — SPEC-044 (trancamento de disciplina e de curso por requerimento)

**Data:** 2026-11-09
**Status da Spec:** `implementada` (2026-11-09), condicionada à aprovação do PR de `development` para `main`, como nas Specs anteriores
**Comando:** `npm test` (Vitest 3.2.7, PostgreSQL 17 local)
**Resultado geral:** 47 arquivos, **400 testes aprovados**, 0 falhas (5 novos em `tests/spec-044/`; os 395 anteriores continuam passando, sem alteração).
**Outras checagens:** `tsc --noEmit` sem erros; migração `20261109000000_trancamento_disciplina` aplicada; telas conferidas no navegador.

## Decisão usada

- **OPEN-066 (Arthur, 2026-11-09):** trancamento **por requerimento**: "Trancamento de disciplina" (escolhe a turma) e "Trancamento de curso"; os dois vão para a secretaria e **deferir aplica sozinho**. A disciplina só é trancada **enquanto o diário da turma estiver aberto** (e o período aberto).

## Onde está cada coisa

| Parte | Arquivo |
|---|---|
| Regra pura | `src/domain/requerimentos.ts`: tipo `TrancamentoDisciplina`, `vaiAoProfessor`, `exigeTurma`, `destinoDoTipo`, `ehTrancamento`, `motivoParaNaoTrancarDisciplina` (RB-42) |
| Caso de uso | `src/server/academico/requerimentos.ts`: a abertura confere matrícula, diário e período; o deferimento confere de novo e aplica o trancamento na mesma transação (`aplicarTrancamento`); o painel da secretaria recebe o efeito (`efeitoDoTrancamento`) |
| Trancamento de curso | `gravarSituacao` (`src/server/academico/secretaria.ts`), o mesmo efeito da RB-30 usado na ficha, agora chamado também pelo deferimento |
| Banco | migração `20261109000000_trancamento_disciplina` (valor novo do enum `TipoRequerimento`) |
| Auditoria | ação nova `matricula.trancada` (grupo Secretaria); o trancamento de curso continua como `estudante.situacao`, com o protocolo no motivo |
| Telas | `/requerimentos` (estudante: tipo novo, "Disciplina que quer trancar", aviso do efeito; secretaria: aviso "Deferir tranca…" e botão "Deferir e trancar") |

## Critérios

| Critério | Teste | Resultado |
|---|---|---|
| AC-044-01, AC-044-02, AC-044-03, INV-044-01, INV-044-03, INV-044-04 | `tests/spec-044/trancamento.test.ts` — pede, a secretaria defere, só aquela disciplina fica Trancada, notas guardadas, boletim "Trancada", professor não vê | Aprovado |
| AC-044-04, AC-044-05, AC-044-08 | idem — diário fechado ou turma alheia: 400; diário fechado depois do pedido: 409 e indeferir funciona | Aprovado |
| AC-044-06, AC-044-07 | idem — trancamento de curso deferido tranca o estudante e as 2 matrículas; estudante já Trancado: 409 | Aprovado |
| RB-42, INV-044-02 | idem (unitários) — destino, turma obrigatória, `motivoParaNaoTrancarDisciplina` | Aprovado |

Regra nova: RB-42. Regras ajustadas: RB-30 (o deferimento do trancamento de curso tem o mesmo efeito) e RB-34 (trancamento de disciplina exige turma e vai para a secretaria).

## Verificação no navegador (2026-11-09)

- **Estudante (`estudante@`):** em Requerimentos, o tipo "Trancamento de disciplina" troca o rótulo para "Disciplina que quer trancar", esconde a avaliação e mostra o aviso "Se a secretaria deferir, só Algoritmos fica trancada…"; "Trancamento de curso" mostra o aviso de todas as disciplinas. Igual ao protótipo aprovado (`#trancamento-pedido`).
- **Secretaria (`admin@`):** o pedido do Diego Lima (Física I, Turma FI-ECO) mostra "Deferir tranca Física I (Turma FI-ECO): a matrícula fica Trancada na hora. As outras disciplinas continuam." e o botão "Deferir e trancar" (`#trancamento-deferir`). O pedido ficou pendente para a apresentação.
- Console sem erros.
