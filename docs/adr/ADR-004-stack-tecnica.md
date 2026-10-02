# ADR-004 — Stack técnica (Next.js + Prisma + JWT)

## Contexto
A SPEC-001 e a implementação (Fase 4) não podem começar sem uma linguagem e um framework
decididos. O ADR-001 já define arquitetura em camadas e monólito modular; o ADR-002 já
define PostgreSQL. Faltava decidir a tecnologia de apresentação/API e o ORM.

## Decisão
- **Framework único (frontend + backend):** Next.js (App Router), em TypeScript. As rotas de
  API ficam em Route Handlers (`app/api/...`), dentro do mesmo projeto que renderiza as telas.
- **ORM:** Prisma, para PostgreSQL. O schema do Prisma deriva do modelo de domínio já aprovado
  (`docs/modelo-dominio.md`), sem inventar tabelas fora dele.
- **Autenticação:** JWT, assinado no servidor e guardado em cookie `httpOnly` (resolve o
  `OPEN-006`). Sem sessão em banco de dados separada.
- **Estilo:** Tailwind CSS, sem biblioteca de componentes adicional por enquanto.

## Alternativas consideradas
- **Next.js (frontend) + NestJS (backend) separados**, como no projeto de referência do
  professor: rejeitado por simplicidade. Dois serviços exigem dois deploys e mais configuração
  de comunicação entre eles; o grupo é pequeno e o ADR-001 já pede monólito.
- **Sessão de servidor (cookie + store) em vez de JWT**: rejeitado. JWT sem estado é mais simples
  de implementar com Next.js Route Handlers e não exige um store de sessão adicional.

## Consequências
- Todo o código roda em TypeScript, um único `package.json`, um único deploy.
- O Prisma gera as migrations a partir do schema — qualquer mudança no modelo de domínio
  precisa refletir primeiro em `docs/modelo-dominio.md`, depois no `schema.prisma`.
- Fecha o `OPEN-006` da `SPEC-001`: o mecanismo de autenticação passa a ser JWT em cookie
  httpOnly, não mais uma questão em aberto.
