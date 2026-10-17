# Verificação — SPEC-010 (Administrador, gestão de contas e troca do professor da turma)

**Data:** 2026-10-17
**Status da Spec:** `em implementação`
**Comando:** `npm test` (Vitest 3.2.7, PostgreSQL 17 local)
**Resultado geral:** 13 arquivos, **142 testes aprovados**, 0 falhas (13 em `tests/spec-010/`).
**Outras checagens:** `tsc --noEmit` sem erros; telas conferidas no servidor de desenvolvimento no desktop, no tablet (768 px) e no celular (375 px).

## Decisões usadas (decisoes-em-aberto.md)

- **OPEN-025 (fechada):** Administrador é um quarto perfil só para gestão de contas (RB-13); desativação com efeito imediato, sem apagar dados; não desativa a si mesmo nem professor com turma (RB-14); troca do professor da turma pelo coordenador (RF-17), levando os planos ativos.
- **OPEN-014:** substituída pelo OPEN-025 (`Usuario.ativo`).

## Onde está cada coisa

| Parte | Arquivo |
|---|---|
| Regras (validação da conta, motivo para não desativar) | `src/domain/contas.ts`; perfis em `src/domain/perfil.ts`; matriz em `src/domain/autorizacao.ts` |
| Casos de uso | `src/server/academico/contas.ts`; troca em `src/server/academico/cadastros.ts` (`trocarProfessor`) |
| Dados | `src/server/dados/contas.ts`; `trocarProfessorDaTurma` em `src/server/dados/estrutura.ts` (transação com os planos ativos) |
| Conta ativa a cada requisição | `confirmarConta` em `src/server/auth/guardas.ts`; login em `src/server/auth/autenticacao.ts` |
| Banco | migração `20261017203515_spec_010_administrador` (valor `Administrador` no enum e coluna `ativo` com padrão verdadeiro); não mexe no índice parcial da SPEC-008 |
| API | `GET/POST /api/contas`, `POST /api/contas/:id/desativar`, `POST /api/contas/:id/reativar`, `POST /api/turmas/:id/professor` |
| Telas | `/admin/contas` (Administrador); cartão "Professor responsável" em `/coordenador/turmas/[id]` |

## Critérios

| Critério | Teste (`tests/spec-010/contas.test.ts` ›) | Resultado |
|---|---|---|
| AC-010-01 | administrador cria conta de Professor, ativa, com senha em hash, e ela consegue entrar | Aprovado |
| AC-010-02 | sem e-mail ou com e-mail repetido o cadastro é impedido, indica o campo e nada é gravado | Aprovado |
| AC-010-03 | filtro por perfil devolve só contas daquele perfil, sem hash de senha | Aprovado |
| AC-010-04 / INV-010-04 | conta desativada perde a sessão aberta na hora e não consegue mais entrar | Aprovado |
| AC-010-05 / INV-010-05 | reativar devolve o acesso, e os dados da conta continuam lá | Aprovado |
| AC-010-06 / INV-010-06 | administrador não desativa a si mesmo nem professor responsável por turma | Aprovado |
| AC-010-07 / INV-010-02 | Estudante, Professor e Coordenador não usam a gestão de contas | Aprovado |
| AC-010-08 / INV-010-03 | administrador não acessa dados acadêmicos | Aprovado |
| AC-010-09 / INV-010-07 | turma e plano ativo passam ao novo professor; o encerrado fica com o anterior; aí o anterior pode ser desativado | Aprovado |
| AC-010-10 | troca para professor desativado, para quem não é Professor ou em turma de outro coordenador é impedida | Aprovado |
| RB-01 / INV-010-01 | quatro perfis (domínio e banco); teste da SPEC-001 atualizado de 3 para 4 perfis | Aprovado |
| RB-13, RB-14 (domínio) | matriz de autorização e motivo para não desativar | Aprovado |

## Verificação manual (agente, navegador, dados do seed)

| Item | Resultado |
|---|---|
| Login pelo formulário com `admin@studytrack.test` leva a `/admin/contas`; menu só com "Contas" | Aprovado |
| Lista em ordem Administrador, Coordenador, Professor, Estudante; a própria conta aparece como "(você)" | Aprovado |
| Desativar o Professor de Teste (3 turmas): recusado com a mensagem explicativa | Aprovado |
| Desativar Henrique Dias: fica "○ Inativa" e o login dele recebe "E-mail ou senha inválidos."; reativar devolve o acesso | Aprovado |
| "Criar conta" vazio: erro em nome, e-mail, senha e perfil | Aprovado |
| Administrador abrindo `/professor` e `/relatorios`: vai para Acesso negado | Aprovado |
| Coordenador troca o professor da Turma B para Júlia Reis: a turma sai da lista do Professor de Teste e entra na da Júlia (depois foi devolvida ao Professor de Teste) | Aprovado |
| Sem rolagem horizontal em 375 px e 768 px | Aprovado |
| Ajustes feitos na verificação: ordem da lista; duas colunas só a partir de 1280 px; nome e e-mail juntos no cartão do celular; texto do aviso de desativação | Corrigidos |

**Falta a conferência humana** e a revisão do PR por um colega antes de marcar a Spec como `implementada`.
