# Matriz de Rastreabilidade — StudyTrack

Liga cada requisito funcional aos artefatos que o sustentam: regras de negócio, caso de uso, Spec e issue. Atualize esta tabela quando uma Spec ou issue mudar.

| RF | Nome | RB | UC / fluxo | Spec | Issue | Testes | Verificação |
|---|---|---|---|---|---|---|---|
| RF-01 | Autenticação | RB-01 | UC-01 | SPEC-001 | #6 | `tests/spec-001/` | SPEC-001.md |
| RF-02 | Controle de acesso | RB-01, RB-02, RB-03, RB-04 | UC-01 (transversal) | SPEC-001 | #7 | `tests/spec-001/` | SPEC-001.md |
| RF-03 | Cadastro de estudantes | RB-01 | UC-06 | SPEC-002 | #8 | `tests/spec-002/` | SPEC-002.md |
| RF-04 | Cadastro de disciplinas e turmas | — | UC-07 | SPEC-002 | #9 | `tests/spec-002/` | SPEC-002.md |
| RF-05 | Registro de notas | RB-03 | UC-03 | SPEC-004 | #10 | `tests/spec-004/` | SPEC-004.md |
| RF-06 | Cálculo de média | RB-10 | UC-03 (passo 5) | SPEC-003, SPEC-004 | #11 | `tests/spec-003/`, `tests/spec-004/` | SPEC-003.md, SPEC-004.md |
| RF-07 | Registro de frequência | RB-05, RB-10 | UC-08 | SPEC-005 | #15 | `tests/spec-005/` | SPEC-005.md |
| RF-08 | Cadastro de atividades | RB-08 | UC-09 | SPEC-005 | #16 | `tests/spec-005/` | SPEC-005.md |
| RF-09 | Controle de atividades atrasadas | RB-08 | UC-09, UC-02 (extensão atraso) | SPEC-005, SPEC-007 | #17 | `tests/spec-005/`, `tests/spec-007/` | SPEC-005.md, SPEC-006-007.md |
| RF-10 | Dashboard do estudante | RB-02 | UC-02 | SPEC-007 | #18 | `tests/spec-007/` | SPEC-006-007.md |
| RF-11 | Indicador acadêmico | RB-05, RB-06, RB-07, RB-09, RB-10 | UC-02, UC-03 (include) | SPEC-003 | #19 | `tests/spec-003/` | SPEC-003.md |
| RF-12 | Alertas | RB-09 | UC-02 (extensão risco) | SPEC-006 | #20 | `tests/spec-006/` | SPEC-006-007.md |
| RF-13 | Dashboard do professor | RB-03 | UC-10 | SPEC-008 | #21 | `tests/spec-008/` | SPEC-008-009.md |
| RF-14 | Plano de recuperação | RB-11, RB-12 | UC-04 | SPEC-008 | #22 | `tests/spec-008/` | SPEC-008-009.md |
| RF-15 | Relatórios | RB-04 | UC-05 | SPEC-009 | #2 | `tests/spec-009/` | SPEC-008-009.md |
| RF-16 | Gestão de contas | RB-01, RB-13, RB-14 | UC-11 | SPEC-010 | — | `tests/spec-010/` | SPEC-010.md |
| RF-17 | Troca do professor da turma | RB-03, RB-11 | UC-07 | SPEC-010 | — | `tests/spec-010/` | SPEC-010.md |
| RF-18 | Senha própria | RB-15 | UC-12 | SPEC-011 | — | `tests/spec-011/` | SPEC-011-014.md |
| RF-19 | Plano visível ao estudante | RB-02, RB-12 | UC-02 | SPEC-012 | — | `tests/spec-012/` | SPEC-011-014.md |
| RF-20 | Histórico de notas | RB-03, RB-04, RB-16 | UC-03, UC-13 | SPEC-013 | — | `tests/spec-013/` | SPEC-011-014.md |
| RF-21 | Painel do coordenador | RB-04, RB-09 | — | SPEC-014 | — | `tests/spec-014/` | SPEC-011-014.md |
| RF-22 | Cursos | RB-13, RB-14, RB-17 | UC-14 | SPEC-015 | — | `tests/spec-015/` | SPEC-015-016.md |
| RF-23 | Grade do curso | RB-04, RB-18 | UC-15, UC-07 | SPEC-015 | — | `tests/spec-015/` | SPEC-015-016.md |
| RF-24 | Dashboard inicial por perfil | RB-02, RB-03, RB-04, RB-09 | UC-16 | SPEC-016 | — | `tests/spec-016/` | SPEC-015-016.md |
| RF-25 | Dashboard do administrador | RB-13 | UC-16 | SPEC-016 | — | `tests/spec-016/` | SPEC-015-016.md |

## Lacunas conhecidas

- RF-22 a RF-25 (SPEC-015 e SPEC-016) sem issue: pedido direto de Arthur em 2026-10-22, registrado nos OPEN-030 a OPEN-036.

- Todo RF tem caso de uso: RF-03, RF-04, RF-07, RF-08 e RF-13 ganharam os UC-06 a UC-10 em 2026-10-17.
- RB-08 (atraso) e RB-12 (progresso do plano) viraram contrato com o fechamento do OPEN-010, do OPEN-003 e do OPEN-021.
- Testes de cada RB, AC e INV pelo identificador: `docs/verificacao/qualidade.md`, seção 1. A coluna Verificação aponta para `docs/verificacao/`.

## Entidades por Spec (resumo)

| Spec | Entidades |
|---|---|
| SPEC-001 | Usuario |
| SPEC-002 | Usuario, Disciplina, Turma |
| SPEC-003 | Nota, Frequencia, IndicadorAcademico |
| SPEC-004 | Avaliacao, Nota, IndicadorAcademico |
| SPEC-005 | Frequencia, Atividade, Entrega |
| SPEC-006 | IndicadorAcademico |
| SPEC-007 | Todas as de leitura acadêmica |
| SPEC-008 | PlanoRecuperacao, ItemPlano, IndicadorAcademico (OPEN-021) |
| SPEC-009 | Todas as de leitura acadêmica |
| SPEC-010 | Usuario (perfil Administrador, ativo), Turma, PlanoRecuperacao |
| SPEC-011 | Usuario (trocarSenha) |
| SPEC-012 | PlanoRecuperacao, ItemPlano |
| SPEC-013 | HistoricoNota, Nota |
| SPEC-014 | IndicadorAcademico, Turma, Atividade, Entrega (leitura) |
| SPEC-015 | Curso, CursoDisciplina, Turma (curso), Usuario (curso do estudante) |
| SPEC-016 | Usuario (criadaEm); leitura de IndicadorAcademico, Turma, Curso, Atividade, Entrega, PlanoRecuperacao |
