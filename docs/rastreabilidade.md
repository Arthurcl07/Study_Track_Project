# Matriz de Rastreabilidade — StudyTrack

Liga cada requisito funcional aos artefatos que o sustentam: regras de negócio, caso de uso, Spec e issue. Atualize esta tabela quando uma Spec ou issue mudar.

| RF | Nome | RB | UC / fluxo | Spec | Issue | Testes | Verificação |
|---|---|---|---|---|---|---|---|
| RF-01 | Autenticação | RB-01 | UC-01 | SPEC-001 | #6 | `tests/spec-001/` | SPEC-001.md |
| RF-02 | Controle de acesso | RB-01, RB-02, RB-03, RB-04 | UC-01 (transversal) | SPEC-001 | #7 | `tests/spec-001/` | SPEC-001.md |
| RF-03 | Cadastro de estudantes | RB-01 | — | SPEC-002 | #8 | `tests/spec-002/` | SPEC-002.md |
| RF-04 | Cadastro de disciplinas e turmas | — | — | SPEC-002 | #9 | `tests/spec-002/` | SPEC-002.md |
| RF-05 | Registro de notas | RB-03 | UC-03 | SPEC-004 | #10 | `tests/spec-004/` | SPEC-004.md |
| RF-06 | Cálculo de média | RB-10 | UC-03 (passo 5) | SPEC-003, SPEC-004 | #11 | `tests/spec-003/`, `tests/spec-004/` | SPEC-003.md, SPEC-004.md |
| RF-07 | Registro de frequência | RB-05, RB-10 | — | SPEC-005 | #15 | `tests/spec-005/` | SPEC-005.md |
| RF-08 | Cadastro de atividades | RB-08 | — | SPEC-005 | #16 | `tests/spec-005/` | SPEC-005.md |
| RF-09 | Controle de atividades atrasadas | RB-08 | UC-02 (extensão atraso) | SPEC-005, SPEC-007 | #17 | `tests/spec-005/`, `tests/spec-007/` | SPEC-005.md, SPEC-006-007.md |
| RF-10 | Dashboard do estudante | RB-02 | UC-02 | SPEC-007 | #18 | `tests/spec-007/` | SPEC-006-007.md |
| RF-11 | Indicador acadêmico | RB-05, RB-06, RB-07, RB-09, RB-10 | UC-02, UC-03 (include) | SPEC-003 | #19 | `tests/spec-003/` | SPEC-003.md |
| RF-12 | Alertas | RB-09 | UC-02 (extensão risco) | SPEC-006 | #20 | `tests/spec-006/` | SPEC-006-007.md |
| RF-13 | Dashboard do professor | RB-03 | — | SPEC-008 | #21 | `tests/spec-008/` | SPEC-008-009.md |
| RF-14 | Plano de recuperação | RB-11, RB-12 | UC-04 | SPEC-008 | #22 | `tests/spec-008/` | SPEC-008-009.md |
| RF-15 | Relatórios | RB-04 | UC-05 | SPEC-009 | #2 | `tests/spec-009/` | SPEC-008-009.md |

## Lacunas conhecidas

- RF-03, RF-04, RF-07, RF-08 e RF-13 não têm caso de uso individual. Não é obrigatório, mas vale escrever se o professor pedir cobertura completa.
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
| SPEC-008 | PlanoRecuperacao, Atividade, IndicadorAcademico |
| SPEC-009 | Todas as de leitura acadêmica |
