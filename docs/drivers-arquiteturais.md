# Drivers Arquiteturais — StudyTrack

Drivers arquiteturais são os requisitos, restrições e cenários que mais impactam as decisões de arquitetura. Não são o inventário completo de RF, RNF e RB: são o subconjunto que obriga a escolher estrutura, controle de acesso, persistência e comportamento sob falha.

Fontes: [visão do produto](visao-produto.md), [RF](StudyTrack_RF.md), [RNF](StudyTrack_RNF.md), [RB](StudyTrack_RB.md), [modelo de domínio](modelo-dominio.md), [casos de uso](casos-de-uso/casos-de-uso.md).

## 1. Critério de seleção

Um item entra neste documento quando atende a pelo menos um destes testes:

1. **Define um invariante de domínio** que a persistência e as transações precisam garantir.
2. **Impõe uma medida de qualidade** que o restante do sistema não pode violar (latência, privacidade).
3. **Obriga uma fronteira de acesso** (quem pode ver ou alterar o quê).
4. **Cria tensão** entre dois objetivos (consistência imediata do indicador versus custo de leitura do dashboard).

Itens como "exibir o nome da turma" permanecem requisitos de produto e não mudam sozinhos o desenho da arquitetura.

## 2. Mapa priorizado

| ID | Tipo | Driver | Impacto na arquitetura | Origem | Decisões | Prioridade |
|---|---|---|---|---|---|---|
| AD-01 | Requisito | Acesso por escopo de responsabilidade (Estudante, Professor, Coordenador) | Autorização no servidor, filtro dentro da query, nega por padrão | RB-02, RB-03, RB-04, RNF-03, RNF-05 | DA-01, ADR-003 | Alta |
| AD-02 | Requisito | Indicador acadêmico consistente após qualquer alteração de nota, frequência ou atividade | Recálculo síncrono na escrita, indicador persistido | RB-09, RB-10, RF-06, RF-07, RF-11 | DA-02, DA-05 | Alta |
| AD-03 | Regra | Classificação Normal/Atenção/Risco única e protegida | Função pura na camada de domínio, sem cópia em controller ou trigger | RB-05, RB-06, RB-07, RB-09 | DA-02, DA-07 | Alta |
| AD-04 | Invariante | Integridade relacional (matrícula N:M, avaliação-nota, atividade-entrega, plano-professor) | Banco relacional com FKs e constraints | modelo-dominio.md, RB-11 | DA-04, ADR-002 | Alta |
| AD-05 | Qualidade | Páginas principais em até 3 s (P95) | Indicador persistido, consulta agregada, índice composto | RNF-01, RF-10, RF-13 | DA-05 | Média |
| AD-06 | Qualidade | Senha nunca em texto puro | Hash (bcrypt/argon2), segredos fora do repositório | RNF-02 | DA-06, ADR-004 | Alta |
| AD-07 | Restrição | Equipe de 3 pessoas, um semestre, domínio fortemente relacional | Monólito modular em camadas, stack única em TypeScript | contexto do projeto | DA-03, ADR-001, ADR-004 | Média |

## 3. O que ficou de fora e por quê

- Escalabilidade horizontal e alta disponibilidade: nenhum RNF pede e o escopo acadêmico não justifica.
- Integrações externas: a baseline não define nenhuma (e-mail de alertas está em aberto, OPEN-004).
