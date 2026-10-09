# Verificação — SPEC-002 (Estrutura acadêmica e vínculos de turma)

**Data:** 2026-10-09
**Status da Spec:** `em implementação`
**Comando:** `npm test` (Vitest 3.2.7, PostgreSQL 17 local)
**Resultado geral:** 3 arquivos, 27 testes aprovados, 0 pendentes, 0 falhas (15 deles em `tests/spec-002/estrutura.test.ts`).
**Outras checagens:** `tsc --noEmit` sem erros; `next build` concluído.

## Decisões usadas (decisoes-em-aberto.md)

- **OPEN-001 (fechada):** Coordenador cadastra disciplinas, turmas e estudantes e faz matrículas, só nas turmas sob sua responsabilidade; quem cria a turma vira o coordenador responsável. Contas de Professor e Coordenador continuam por seed.
- **OPEN-009 (fechada):** Estudante = nome, e-mail único e senha inicial de no mínimo 8 caracteres, cadastrado já dentro de uma turma; Disciplina = nome e carga horária inteira maior que zero; Turma = nome, período, disciplina e professor (perfil Professor).

## Critérios de aceitação e invariantes

| Critério | Teste (`tests/spec-002/estrutura.test.ts` ›) | Resultado |
|---|---|---|
| AC-002-01 | AC-002-01 / INV-002-01: coordenador responsável cadastra estudante já vinculado à turma | Aprovado |
| AC-002-02 | AC-002-02 / INV-002-05: cadastro sem campo obrigatório é impedido, indica o campo e não persiste nada | Aprovado |
| AC-002-03 | AC-002-03: coordenador cadastra disciplina e turma e associa professor e estudantes | Aprovado |
| AC-002-04 | AC-002-04: usuário sem permissão tem o cadastro negado no servidor | Aprovado |
| AC-002-04 | AC-002-04 / OPEN-001: coordenador não cadastra nem matricula em turma que não é sua | Aprovado |
| AC-002-05 | AC-002-05 / INV-002-02: turma consultada pertence a exatamente 1 disciplina e 1 professor | Aprovado |
| INV-002-01 | ver AC-002-01 (estudante criado e matriculado na mesma transação) | Aprovado |
| INV-002-02 | INV-002-02: turma com professor que não tem perfil Professor é recusada | Aprovado |
| INV-002-03 | INV-002-03: turma pode ficar sem coordenador e um coordenador pode responder por várias turmas | Aprovado |
| INV-002-04 | INV-002-04: matrícula é N:M e não duplica | Aprovado |
| INV-002-05 | ver AC-002-02 | Aprovado |
| INV-002-06 | INV-002-06: cada perfil só vê as turmas do seu escopo; Estudante não recebe a lista de colegas | Aprovado |
| OPEN-009 | e-mail já cadastrado é recusado (409); validações de domínio de estudante, disciplina e turma (3 testes sem banco) | Aprovado |

## Casos de teste derivados (seção 12)

| Caso | Teste | Resultado |
|---|---|---|
| 12.1 Cadastro feliz de estudante, disciplina e turma | AC-002-01, AC-002-03 | Aprovado |
| 12.2 Campo obrigatório ausente não persiste nada | AC-002-02 | Aprovado |
| 12.3 Violação de FK é recusada pelo banco | Caso de teste 12.3 (turma sem disciplina; carga horária zero barrada por CHECK) | Aprovado |
| 12.4 Perfil sem permissão é negado | AC-002-04 (403 para Estudante e Professor, 401 sem sessão) | Aprovado |

## RNFs (seção 10)

| RNF | Verificação | Resultado |
|---|---|---|
| RNF-03 | AC-002-04: negação no servidor por perfil e por turma fora do escopo | Aprovado |
| RNF-05 | INV-002-06 e INV-001-04: Estudante só vê as próprias turmas, sem colegas; turma alheia responde 404 | Aprovado |
| RNF-04 | Manual (agente, navegador em 375×812): formulário de estudante vazio mostra o erro de cada campo; listas e formulários usáveis no celular | Aprovado (manual) |

## Verificação manual

**Data:** 2026-10-09 — feita pelo agente no navegador (servidor local, contas do seed). **Falta a conferência humana.**

| Item | Resultado |
|---|---|
| Coordenador vê "Turma de exemplo" em `/coordenador/turmas`, com formulário de nova turma | Aprovado |
| Formulário de estudante enviado vazio mostra "Informe o nome/e-mail/senha inicial" (celular) | Aprovado |
| Estudante vê só a própria turma em `/estudante`, sem lista de colegas | Aprovado |
| Estudante recebe 403 em `/api/disciplinas` e é levado a "Acesso negado" em `/coordenador/turmas` | Aprovado |

## Pendências para fechar a Spec como `implementada`

- Conferência manual humana (roteiro acima) e revisão do PR por um colega.
- Edição e exclusão de cadastros continuam fora do escopo (sem RF).
