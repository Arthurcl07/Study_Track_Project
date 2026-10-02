# ADR-002 — Banco de dados relacional (PostgreSQL)

## Contexto
O modelo de domínio tem relações fortes e obrigatórias: Turma-Estudante (N:M), Avaliação-Nota
(1:N), Atividade-Entrega (1:N), além de regras de integridade como "todo Plano de Recuperação
pertence a exatamente 1 professor" (RB-11).

## Decisão
Usar banco relacional (PostgreSQL) com chaves estrangeiras e constraints de integridade
refletindo as multiplicidades do modelo de domínio.

## Alternativas consideradas
- **NoSQL (documento)**: rejeitado. Não há necessidade de schema flexível; as entidades e
  relações são estáveis e bem definidas desde a Semana 3.

## Consequências
- Integridade referencial garantida pelo próprio banco (reduz bugs de dados órfãos).
- Consultas agregadas (dashboard) podem usar joins e índices compostos diretamente.
