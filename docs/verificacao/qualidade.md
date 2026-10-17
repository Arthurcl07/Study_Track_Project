# Verificação de qualidade e segurança — SPEC-001 a SPEC-010

**Data:** 2026-10-16 (SPEC-001 a 009); **reverificada em 2026-10-17** com a SPEC-010 (ver seção 0).

## 0. Reverificação de 2026-10-17 (depois da SPEC-010)

| Verificação | Resultado |
|---|---|
| Testes | 13 arquivos, **142 testes aprovados**; CI com tipos, testes e build de produção verde |
| Critérios AC (SPEC-001 a 010) | **69** na documentação, 69 com teste. A contagem de 2026-10-16 dizia 58, mas eram 59: corrigido abaixo |
| Invariantes INV | 51, todos com teste |
| Regras RB-01 a RB-14 | 14, todas com teste (RB-13 e RB-14 em `spec-010/contas`) |
| Guardas | as 5 rotas novas (`/api/contas`, desativar, reativar, `/api/turmas/:id/professor`) usam `autorizarApi`; `/admin/contas` usa `exigirAcessoPagina` |
| Privilégio mínimo (RB-13) | o Administrador só aparece no recurso `gestao-contas`; teste percorre todos os recursos |
| Conta desativada (RB-14) | a guarda confere a conta a cada requisição; teste com sessão já emitida |
| Logs | nenhum em `src/` |
| Acesso negado do Administrador | "Voltar ao meu painel" leva a `/`, que redireciona para `/admin/contas` |

**Base:** `docs/estrategia-testes.md` (seções 1, 4 e 5) e `docs/seguranca-ssdlc.md` (seções 2 e 3)
**Comando:** `npm test` (Vitest 3.2.7, PostgreSQL 17 local) — 12 arquivos, **128 testes aprovados**, 0 falhas; `tsc --noEmit` sem erros no código.

## 1. Cobertura por identificador

Todo critério de aceite (AC), invariante (INV) e regra de negócio (RB) aparece no nome de pelo menos um teste (regra "um teste por RB, nomeado pelo identificador"). Conferido com `grep` dos identificadores de `docs/specs.md` e `docs/StudyTrack_RB.md` contra `tests/`.

| Item | Na documentação | Com teste |
|---|---|---|
| Critérios AC (SPEC-001 a 009) | 59 | 59 |
| Invariantes INV | todos os de `specs.md` | todos |
| Regras RB-01 a RB-12 | 12 | 12 |

Ajustes feitos nesta verificação:
- Testes que já cobriam RB-01 a RB-05, RB-07 a RB-10 e os invariantes INV-005-02, INV-007-03 e INV-008-02 ganharam o identificador no nome (o comportamento testado não mudou).
- Teste novo para o **INV-007-02** (`tests/spec-007/painel.test.ts`): depois de uma frequência nova, o painel mostra a situação do indicador recalculado.

| RB | Teste principal |
|---|---|
| RB-01 | `spec-001/autorizacao` › RB-01 / INV-001-01 |
| RB-02 | `spec-001/autorizacao` › RB-02 / INV-001-04; `spec-002/estrutura` › INV-002-06 |
| RB-03 | `spec-002/estrutura` › INV-002-06; `spec-008/plano` › AC-008-05; `spec-009/relatorio` › AC-009-01 |
| RB-04 | `spec-002/estrutura` › INV-002-06; `spec-009/relatorio` › AC-009-02 |
| RB-05 | `spec-003/indicador` › RB-05 / INV-003-01 |
| RB-06, RB-07 | `spec-003/indicador` › RB-06 / RB-07 / INV-003-02 / INV-003-03 |
| RB-08 | `spec-005/dominio` › RB-08 / AC-005-04 e AC-005-06 |
| RB-09 | `spec-003/indicador` › RB-09 / INV-003-04; `spec-004/notas` › RB-09 / OPEN-002 |
| RB-10 | `spec-003/indicador` › RB-10 / AC-003-07; `spec-007/painel` › INV-007-02 / RB-10 |
| RB-11 | `spec-008/plano` › INV-008-01 / RB-11 |
| RB-12 | `spec-008/plano` › RB-12 / INV-008-03 |
| RB-13 | `spec-010/contas` › RB-13 / INV-010-02 / INV-010-03; AC-010-08 |
| RB-14 | `spec-010/contas` › RB-14 / INV-010-06; AC-010-04 a AC-010-06 |

## 2. Controle de acesso (RNF-03, RNF-05, ADR-003)

| Verificação | Resultado |
|---|---|
| Toda rota em `src/app/api/**/route.ts` chama `autorizarApi` | Sim, exceto `auth/login` e `auth/logout`, que são públicas por definição |
| Toda página em `src/app/**/page.tsx` chama `exigirAcessoPagina` | Sim, exceto `/login`, `/acesso-negado` e `/` (que só redireciona conforme a sessão) |
| Testes de escopo por perfil | Em todas as Specs com dados acadêmicos (professor de outra turma, outro estudante, coordenador de outra turma, sem sessão) |

## 3. Regra única (DA-02, DA-07)

- Nenhum limite de classificação (5,0, 6,0, 75%) escrito fora de `src/domain`; a interface importa as constantes de `situacao-academica.ts` (o destaque de média e frequência agora fica em `corDaMedia` e `corDaFrequencia`, em `src/components/ui.tsx`).
- Os testes INV-003-06 e INV-005-06 verificam que a classificação e o status de entrega só existem no domínio.

## 4. Logs e segredos

- Nenhum `console.log`, `console.error` ou `console.warn` em `src/` (nada de senha, hash ou token em log).
- `.env` fora do repositório; o agente não o leu nesta verificação.

## 5. Desempenho (RNF-01: até 3 s no P95)

Medição de amostra no servidor de **desenvolvimento** (`npm run dev`, que é mais lento que o de produção), com os dados do seed, 8 a 10 requisições por página depois de uma de aquecimento:

| Página | Perfil | P50 | P95 |
|---|---|---|---|
| `/estudante` | Estudante | 134 ms | 254 ms |
| `/estudante/atividades` | Estudante | 209 ms | 386 ms |
| `/professor` | Professor | 127 ms | 142 ms |
| `/professor/turmas/[id]` | Professor | 128 ms | 160 ms |
| `/professor/notas` | Professor | 96 ms | 113 ms |
| `/professor/atividades` | Professor | 92 ms | 114 ms |
| `/relatorios` | Professor | 137 ms | 145 ms |
| `/coordenador` | Coordenador | 107 ms | 135 ms |
| `/coordenador/turmas` | Coordenador | 115 ms | 132 ms |
| `/relatorios` | Coordenador | 134 ms | 155 ms |

Todas bem abaixo de 3 s. Picos isolados de 1,8 a 2,2 s apareceram só quando outro processo pesado rodava na mesma máquina (a primeira rodada de `/coordenador` deu P50 de 1,1 s pelo mesmo motivo e, repetida, caiu para 107 ms). O teste AC-007-06 mede o painel do estudante automaticamente.

## 6. Usabilidade (RNF-04, RNF-06)

Telas conferidas no navegador no desktop e no celular (375 px), registradas em `layout.md`, `SPEC-001.md`, `SPEC-002.md`, `SPEC-004.md`, `SPEC-005.md` e `SPEC-008-009.md`; as telas das SPEC-008 e 009 também em largura intermediária (≈700 px). Sem rolagem horizontal nas páginas verificadas.

**Tablet (768 × 1024, verificado em 2026-10-17):** as tabelas estouravam a largura em `/relatorios` (890 px) e `/professor` (786 px), porque o menu lateral deixa só 512 px para o conteúdo e as tabelas só viravam cartões abaixo de 640 px. Corrigido: tabelas viram lista de cartões até 1023 px e a coluna de conteúdo não cresce além da tela (`minmax(0,1fr)` na casca). Conferidas sem rolagem horizontal em 768 px e em 1024 px: todas as páginas do Professor, do Coordenador e do Estudante, inclusive a do plano.

## 7. Dependências (`npm audit`, 2026-10-16)

| Pacote | Severidade | Vem de | Correção disponível |
|---|---|---|---|
| `deepmerge-ts` < 8 | alta | `prisma` 6.19.3 (CLI, via `@prisma/config`) | só com `prisma` 7 (versão major) |
| `tinypool` ≤ 2.1.1 | crítica | `vitest` 3.2.7 | só com `vitest` 5 (versão major) |
| `@vitest/mocker` | moderada | `vitest` 3.2.7 | só com `vitest` 5 (versão major) |

Os três estão em ferramentas de desenvolvimento (CLI de migração e framework de testes), que não recebem dados de usuários em execução. Nenhum aparece no código que roda a aplicação (`next`, `react`, `@prisma/client`, `bcryptjs`, `jose`). Atualizar versão major é decisão humana: **OPEN-022**, fechado como risco aceito por ora. O agente não rodou `npm audit fix --force`.

## 8. Decisões tomadas a partir desta verificação (Arthur, 2026-10-16)

| Item | Decisão |
|---|---|
| Atualizar Prisma e Vitest para corrigir os alertas do `npm audit` | OPEN-022: risco aceito por ora |
| Testes ponta a ponta previstos na estratégia, sem ferramenta definida | OPEN-023: a verificação manual registrada basta |
| CI no GitHub e hook local de commit (camadas 3 e 4 de `seguranca-ssdlc.md`) | OPEN-024: CI criada em `.github/workflows/ci.yml`; hook local dispensado |

## 9. O que ainda depende de humano

| Item | Registro |
|---|---|
| Teste isolado da camada 2 (`settings.json` negando `.env`) sem a instrução da camada 1 | Continua pendente; precisa ser feito por um humano, porque o agente não deve tentar ler `.env` |
| Revisão dos PRs #39 a #41 (SPEC-002 a SPEC-004), que entraram sem revisão | No PR de `development` para `main` |
