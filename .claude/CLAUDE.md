# CLAUDE.md — StudyTrack

StudyTrack: sistema web de acompanhamento acadêmico (notas, frequência, atividades, situação
acadêmica), com perfis Estudante, Professor e Coordenador.

## Stack
Next.js (App Router, TypeScript) com Route Handlers em `app/api/`, Prisma + PostgreSQL, JWT em
cookie httpOnly, Tailwind CSS (ADR-004).

## Como rodar
Pré-requisitos: Node.js 24 LTS, PostgreSQL 17 em `localhost:5432`, `.env` criado a partir de
`.env.example` (`DATABASE_URL`, `JWT_SECRET`). O agente não lê nem altera o `.env`.

- `npm install` — dependências + `prisma generate`.
- `npx prisma migrate dev` — cria o banco e aplica as migrações (`prisma/migrations/`).
- `npm run seed` — contas de teste, uma por perfil (credenciais no README).
- `npm run dev` — aplicação em http://localhost:3000.
- `npm test` — Vitest (`tests/`), usa o banco local e limpa os dados que cria.

Camadas: `src/domain` (regras puras, sem Next.js/Prisma), `src/server/dados` (Prisma),
`src/server/auth` (serviços e guardas), `src/server/academico` (casos de uso de cadastro),
`src/app` (páginas e Route Handlers finos).

## Onde está o quê
- `docs/` — documentação: visão, personas, RF, RNF, RB, glossário, modelo de domínio, casos de
  uso, arquitetura, drivers, ADRs (`docs/adr/`), mapa de Specs, Specs completas (`docs/specs.md`),
  decisões em aberto, rastreabilidade, estratégia de testes e segurança.
- `src/` — código-fonte (SPEC-001 implementada; SPEC-002 e SPEC-003 em implementação).
  A regra Normal/Atenção/Risco fica só em `src/domain/situacao-academica.ts`; o recálculo do
  indicador é `recalcularIndicador` (`src/server/academico/indicador.ts`), chamado na mesma
  transação de qualquer escrita de nota ou frequência (SPEC-004/005).
- `tests/` — testes automatizados (Vitest).

## Decisões já tomadas (não reinventar)
- Arquitetura em camadas, monólito modular (ADR-001).
- Banco relacional PostgreSQL, com FKs e constraints (ADR-002).
- Toda consulta de dados acadêmicos filtra pelo usuário autenticado dentro da própria query,
  nega por padrão (ADR-003).
- Stack e autenticação (ADR-004).
- Classificação acadêmica (Normal/Atenção/Risco) é função pura na camada de domínio, nunca
  duplicada em controller ou trigger de banco (DA-02).

## Como o agente deve se comportar
- Não inventar requisito, entidade, regra ou tecnologia fora de `docs/`.
- Só implementar Spec com texto completo e status `aprovada` em `docs/specs.md`.
- Questão sem decisão vira `OPEN-XX` em `docs/decisoes-em-aberto.md` — não decidir
  silenciosamente no código.
- Regra de negócio isolada da camada web/ORM, com um teste por RB (DA-07).
- Nunca ler, imprimir ou commitar `.env` ou qualquer segredo.
- Conflito entre código, Spec e baseline é registrado, não resolvido em silêncio.

## Ponteiros
- Requisitos: `docs/StudyTrack_RF.md`, `docs/StudyTrack_RNF.md`, `docs/StudyTrack_RB.md`.
- Modelo de domínio: `docs/modelo-dominio.md`.
- Casos de uso: `docs/casos-de-uso/`.
- Arquitetura: `docs/arquitetura.md`, `docs/drivers-arquiteturais.md`, `docs/adr/`.
- Testes e segurança: `docs/estrategia-testes.md`, `docs/seguranca-ssdlc.md`.
- Rastreabilidade: `docs/rastreabilidade.md`.
