# CLAUDE.md — StudyTrack

StudyTrack: sistema web de acompanhamento acadêmico (notas, frequência, atividades, situação
acadêmica), com perfis Estudante, Professor e Coordenador.

## Como rodar
Em construção — código-fonte ainda não implementado (Fase 4 do projeto). Instruções de
execução serão adicionadas quando a implementação começar.

## Onde está o quê
- `docs/` — toda a documentação do projeto: visão, personas, RF, RNF, RB, glossário, modelo de
  domínio, casos de uso, arquitetura, ADRs (`docs/adr/`), mapa de Specs (`docs/mapa-specs.md`)
  e texto completo das Specs (`docs/specs.md`).
- `src/` — código-fonte (a implementar).
- `tests/` — testes automatizados (a implementar).

## Decisões já tomadas (não reinventar)
- Arquitetura em camadas, monólito modular (ADR-001).
- Banco relacional PostgreSQL, com FKs e constraints (ADR-002).
- Toda consulta de dados acadêmicos filtra pelo usuário autenticado dentro da própria query,
  nega por padrão (ADR-003).
- Classificação acadêmica (Normal/Atenção/Risco) é função pura na camada de domínio, nunca
  duplicada em controller ou trigger de banco (DA-02).

## Como o agente deve se comportar
- Não inventar requisito, entidade, regra ou tecnologia fora de `docs/`.
- Specs em `docs/specs.md`: só implementar Spec com texto completo e status `aprovada`.
  Spec `especificada` sem detalhamento não autoriza código.
- Questão sem decisão na baseline vira `OPEN-XX` registrada na própria Spec — não decidir
  silenciosamente no código.
- Regra de negócio sempre isolada da camada web/ORM, com um teste por RB (DA-07).

## Ponteiros
- Requisitos: `docs/StudyTrack_RF.md`, `docs/StudyTrack_RNF.md`, `docs/StudyTrack_RB.md`.
- Modelo de domínio: `docs/modelo-dominio.md`.
- Casos de uso: `docs/casos-de-uso/`.
- Arquitetura e decisões: `docs/arquitetura.md`, `docs/adr/`.
