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

Em construção — o código-fonte ainda não foi implementado (fase de requisitos e modelagem
concluída). Instruções de execução serão adicionadas quando a implementação (Fase 4) começar.

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
- `/src` — código-fonte (a implementar)
- `/tests` — testes automatizados (a implementar)
- `/.claude` — configuração do agente Claude Code usado pelo grupo
- `/.github` — templates de PR e de issue
