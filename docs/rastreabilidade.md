# Matriz de Rastreabilidade — StudyTrack

Liga cada requisito funcional aos artefatos que o sustentam: regras de negócio, caso de uso, Spec e issue. Atualize esta tabela quando uma Spec ou issue mudar.

| RF | Nome | RB | UC / fluxo | Spec | Issue |
|---|---|---|---|---|---|
| RF-01 | Autenticação | RB-01 | UC-01 | SPEC-001 | #6 |
| RF-02 | Controle de acesso | RB-01, RB-02, RB-03, RB-04 | UC-01 (transversal) | SPEC-001 | #7 |
| RF-03 | Cadastro de estudantes | RB-01 | — | SPEC-002 | #8 |
| RF-04 | Cadastro de disciplinas e turmas | — | — | SPEC-002 | #9 |
| RF-05 | Registro de notas | RB-03 | UC-03 | SPEC-004 | #10 |
| RF-06 | Cálculo de média | RB-10 | UC-03 (passo 5) | SPEC-003, SPEC-004 | #11 |
| RF-07 | Registro de frequência | RB-05, RB-10 | — | SPEC-005 | #15 |
| RF-08 | Cadastro de atividades | RB-08 | — | SPEC-005 | #16 |
| RF-09 | Controle de atividades atrasadas | RB-08 | UC-02 (extensão atraso) | SPEC-005, SPEC-007 | #17 |
| RF-10 | Dashboard do estudante | RB-02 | UC-02 | SPEC-007 | #18 |
| RF-11 | Indicador acadêmico | RB-05, RB-06, RB-07, RB-09, RB-10 | UC-02, UC-03 (include) | SPEC-003 | #19 |
| RF-12 | Alertas | RB-09 | UC-02 (extensão risco) | SPEC-006 | #20 |
| RF-13 | Dashboard do professor | RB-03 | — | SPEC-008 | #21 |
| RF-14 | Plano de recuperação | RB-11, RB-12 | UC-04 | SPEC-008 | #22 |
| RF-15 | Relatórios | RB-04 | UC-05 | SPEC-009 | #2 |

## Lacunas conhecidas

- RF-03, RF-04, RF-07, RF-08 e RF-13 não têm caso de uso individual. Não é obrigatório, mas vale escrever se o professor pedir cobertura completa.
- RB-12 (progresso do plano) e RB-08 (atraso) dependem de OPEN-003 e OPEN-010 para virar contrato.

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
