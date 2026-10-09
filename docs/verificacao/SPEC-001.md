# Verificação — SPEC-001 (Autenticação, perfis e autorização por escopo)

**Data:** 2026-10-09
**Status da Spec:** `implementada`
**Comando:** `npm test` (Vitest 3.2.7, PostgreSQL 17 local)
**Resultado geral:** 2 arquivos, 11 testes aprovados, 1 pendente (`todo`), 0 falhas.
**Atualização 2026-10-09 (SPEC-002):** o INV-001-04 deixou de ser `todo`; a suíte da SPEC-001 tem 12 testes aprovados e 0 pendentes.

## Critérios de aceitação e invariantes

| Critério | Teste (arquivo › nome) | Resultado |
|---|---|---|
| AC-001-01 | `tests/spec-001/autenticacao.test.ts` › AC-001-01: Estudante com credenciais corretas recebe sessão e é redirecionado ao painel do Estudante | Aprovado |
| AC-001-02 | `tests/spec-001/autenticacao.test.ts` › AC-001-02: senha incorreta é recusada, sem sessão e com mensagem genérica | Aprovado |
| AC-001-03 | `tests/spec-001/autorizacao.test.ts` › AC-001-03: Estudante autenticado que chama a função exclusiva de Coordenador tem o acesso negado | Aprovado |
| AC-001-04 | `tests/spec-001/autenticacao.test.ts` › AC-001-04: o valor armazenado no banco é um hash, nunca a senha original | Aprovado |
| INV-001-01 | `tests/spec-001/autorizacao.test.ts` › INV-001-01: todo usuário tem exatamente um perfil dentre Estudante, Professor ou Coordenador | Aprovado |
| INV-001-02 | `tests/spec-001/autenticacao.test.ts` › INV-001-02: nenhum usuário do banco tem senha em texto puro e a resposta de login não expõe o hash | Aprovado |
| INV-001-03 | `tests/spec-001/autorizacao.test.ts` › INV-001-03: o servidor recusa pedido sem sessão ou com JWT forjado, sem depender da interface | Aprovado |
| INV-001-03 | `tests/spec-001/autorizacao.test.ts` › INV-001-03: a regra de domínio nega por padrão (perfil inválido ou recurso desconhecido) | Aprovado |
| INV-001-04 | `tests/spec-001/autorizacao.test.ts` › INV-001-04: Estudante nunca recebe dados de outro estudante ao consultar turmas | Aprovado (2026-10-09, escrito com a SPEC-002). Notas e frequência reforçam o invariante a partir da SPEC-003. |

## Casos de teste derivados (seção 12)

| Caso | Teste | Resultado |
|---|---|---|
| 12.1 Login bem-sucedido por perfil | `autenticacao.test.ts` › Caso de teste 12.1 (Estudante, Professor, Coordenador) | Aprovado (3) |
| 12.2 Senha incorreta não cria sessão | AC-001-02 | Aprovado |
| 12.3 Acesso fora do perfil negado no servidor | AC-001-03, INV-001-03 | Aprovado |
| 12.4 Senha persistida nunca igual ao original | AC-001-04, INV-001-02 | Aprovado |

## RNFs (seção 10)

| RNF | Verificação | Resultado |
|---|---|---|
| RNF-02 | AC-001-04 e INV-001-02 (hash bcrypt) | Aprovado |
| RNF-03 | AC-001-03 e INV-001-03 (401 sem sessão / JWT forjado, 403 perfil errado) | Aprovado |
| RNF-05 | INV-001-04 | Aprovado (escrito com a SPEC-002) |
| RNF-04 | Manual: tela de login em viewport de celular (375×812) e desktop no navegador; login, mensagem de erro genérica e negação de `/coordenador/area` e `/api/coordenacao` conferidos | Aprovado (manual) |

## Verificação manual

**Data:** 2026-10-09 — **verificado por Arthur** (no navegador, com as contas do seed)

| Item | Resultado |
|---|---|
| Login dos perfis Estudante, Professor e Coordenador leva ao painel do perfil | Aprovado |
| Senha errada exibe mensagem genérica e não cria sessão | Aprovado |
| Estudante tem acesso negado à área de Coordenador | Aprovado |

## Pendências para fechar a Spec como `implementada`

- ~~INV-001-04 / RNF-05: teste depende da SPEC-002.~~ Resolvido em 2026-10-09 com a SPEC-002.
- OPEN-014 (cadastro ativo) e OPEN-015 (duração da sessão): decisões provisórias, aguardam confirmação do grupo.
- Revisão do PR por um colega (estrategia-testes.md, seção 5).
