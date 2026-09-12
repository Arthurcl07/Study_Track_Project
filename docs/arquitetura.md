# StudyTrack — Arquitetura, Drivers e Decisões Técnicas

## Drivers arquiteturais

O que mais pesa nas decisões de estrutura do sistema, sintetizado a partir de RF, RNF e RB:

1. **Controle de acesso por escopo de responsabilidade** — Estudante só vê os próprios dados;
   Professor só vê as turmas que leciona; Coordenador só vê as turmas sob sua responsabilidade.
   (RB-02, RB-03, RB-04, RNF-03, RNF-05)
2. **Consistência do indicador acadêmico** — toda alteração de nota, frequência ou atividade
   precisa recalcular a classificação (Normal/Atenção/Risco) de forma confiável e imediata.
   (RB-09, RB-10, RF-06, RF-07, RF-11)
3. **Regra de classificação protegida e única** — a lógica de Normal/Atenção/Risco não pode
   ser burlada por chamada direta a dados; precisa valer independente de quem chama.
   (RB-05, RB-06, RB-07, RB-09)
4. **Integridade relacional do domínio** — muitas relações N:M e 1:N fortes
   (Turma-Estudante, Avaliação-Nota, Atividade-Entrega, Turma-Avaliação).
   (modelo-dominio.md)
5. **Desempenho de leitura no dashboard** — carregar notas, médias, frequência, atividades
   e indicador consolidado em até 3s (P95). (RNF-01, RF-10, RF-13)
6. **Segurança de credenciais** — senha nunca em texto puro. (RNF-02)

## Tabela de decisões técnicas

| DA | Driver | Origem | Decisão técnica |
|----|--------|--------|------------------|
| DA-01 | Controle de acesso por escopo | RB-02, RB-03, RB-04, RNF-03, RNF-05 | Autenticação por sessão/JWT com claim de perfil. Toda consulta de dados acadêmicos filtra pelo usuário autenticado **dentro da própria query** (nunca em verificação posterior). Negar por padrão. |
| DA-02 | Consistência do indicador acadêmico | RB-09, RB-10 | Classificação (Normal/Atenção/Risco) implementada como função pura na camada de domínio, chamada de forma síncrona sempre que nota (RF-06), frequência (RF-07) ou atividade é alterada. Nenhuma cópia da regra em controller ou trigger de banco. |
| DA-03 | Escala do projeto e domínio fortemente relacional | Modelo de domínio, equipe de 3, escopo de disciplina | Arquitetura em camadas (apresentação / lógica de negócio / persistência), monolítica. Microsserviços descartados: complexidade de deploy desproporcional ao prazo e ao tamanho da equipe. |
| DA-04 | Domínio essencialmente relacional | modelo-dominio.md (Turma-Estudante N:M, Avaliação-Nota 1:N, Atividade-Entrega 1:N) | Banco relacional (PostgreSQL), com chaves estrangeiras e constraints de integridade. NoSQL descartado — não há necessidade de schema flexível. |
| DA-05 | Desempenho do dashboard | RNF-01, RF-10, RF-13 | Indicador acadêmico fica **persistido** (não recalculado a cada leitura), atualizado apenas no evento de escrita (RB-10). Query de dashboard agregada com índice composto em (estudante_id, turma_id). |
| DA-06 | Segurança de senha | RNF-02 | Hash com bcrypt/argon2. Item não negociável, sem alternativas avaliadas. |
| DA-07 | Rastreabilidade spec → código | Método de trabalho da disciplina | Um teste automatizado por RB, nomeado pelo identificador (ex.: `RB-09_classifica_risco_por_frequencia`). Regra de negócio isolada em camada de domínio, sem acoplamento a framework web ou ORM. |

## Estilo arquitetural escolhido

**Arquitetura em camadas (monólito modular)**:

- Apresentação (API REST)
- Lógica de Negócio (domínio: Usuario, Turma, IndicadorAcademico, PlanoRecuperacao...)
- Persistência (repositórios + PostgreSQL)

A apresentação chama a lógica de negócio, que por sua vez chama a persistência — nunca o
inverso, e a apresentação nunca acessa a persistência diretamente.

Justificativa: o domínio tem poucas responsabilidades transversais e a equipe é pequena (3
pessoas). Um monólito em camadas atende RNF-01 (desempenho) sem o custo operacional de
microsserviços, e mantém a regra de negócio (DA-02) isolada e testável (DA-07).
