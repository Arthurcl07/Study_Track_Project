# Study Track

Sistema web de acompanhamento acadêmico que centraliza notas, frequência, atividades e
situação acadêmica de estudantes, com apoio a professores e coordenadores.

Grupo: Luiz Eduardo Rodrigues Alves Santos - 10735730; Rafael Ajimura - 10743067; Arthur Cunha Lasthaus - 10735627

Projeto da disciplina Modelagem e Desenvolvimento de Software — Mackenzie, 2026/2.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js (App Router) + Tailwind CSS |
| Backend | Next.js Route Handlers (`app/api/`) |
| Persistência | PostgreSQL + Prisma |
| Autenticação | JWT (cookie httpOnly) |

Decisões completas em `docs/adr/`.

## Como executar

Implementado até agora: SPEC-001 (autenticação, perfis e autorização).

Pré-requisitos: Node.js 24 LTS e PostgreSQL 17 rodando em `localhost:5432`.

1. Crie o `.env` a partir do exemplo e ajuste `DATABASE_URL` e `JWT_SECRET` (32+ caracteres):

   ```bash
   cp .env.example .env
   ```

2. Instale as dependências (também gera o Prisma Client):

   ```bash
   npm install
   ```

3. Crie o banco e aplique as migrações (na primeira vez, também roda o seed):

   ```bash
   npx prisma migrate dev
   ```

4. Carregue as contas de teste (pode rodar de novo a qualquer momento):

   ```bash
   npm run seed
   ```

5. Suba a aplicação em http://localhost:3000:

   ```bash
   npm run dev
   ```

6. Rode os testes (Vitest; usam o banco do `.env` e removem os dados que criam):

   ```bash
   npm test
   ```

### Contas de teste (somente ambiente local)

Não há cadastro público (OPEN-013). O seed (`prisma/seed.ts`) cria uma conta por perfil, todas
com a senha `StudyTrack@2026`:

| Perfil | E-mail |
|---|---|
| Estudante | `estudante@studytrack.test` |
| Professor | `professor@studytrack.test` |
| Coordenador | `coordenador@studytrack.test` |

São credenciais fictícias para desenvolvimento; nunca use em produção.

Para ver a negação de acesso, entre como Estudante e abra `/coordenador/area` (página) ou
`/api/coordenacao` (API) — ambas exclusivas de Coordenador.

## Documentação

Toda a documentação do projeto está em `/docs`:

- Visão do produto — `docs/visao-produto.md`
- Personas — `docs/persona1.md`, `docs/persona2.md`
- Requisitos Funcionais — `docs/StudyTrack_RF.md`
- Requisitos Não Funcionais — `docs/StudyTrack_RNF.md`
- Regras de Negócio — `docs/StudyTrack_RB.md`
- Glossário — `docs/glossario.md`
- Modelo de Domínio — `docs/modelo-dominio.md`
- Casos de Uso — `docs/casos-de-uso/`
- Arquitetura — `docs/arquitetura.md`
- Drivers arquiteturais — `docs/drivers-arquiteturais.md`
- ADRs — `docs/adr/`
- Mapa de Specs — `docs/mapa-specs.md`
- Specs completas — `docs/specs.md`
- Decisões em aberto — `docs/decisoes-em-aberto.md`
- Matriz de rastreabilidade — `docs/rastreabilidade.md`
- Estratégia de testes — `docs/estrategia-testes.md`
- Segurança e SSDLC — `docs/seguranca-ssdlc.md`
- Combinados da equipe — `docs/combinados.md`

## Estrutura do repositório

- `/docs` — documentação do projeto (specs, modelagem, ADRs)
- `/src` — código-fonte (Next.js; camadas em `src/domain`, `src/server`, `src/app`)
- `/tests` — testes automatizados (Vitest)
- `/prisma` — schema, migrações e seed
- `/.claude` — configuração do agente Claude Code usado pelo grupo
- `/.github` — templates de PR e de issue
