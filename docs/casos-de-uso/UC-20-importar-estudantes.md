# UC-20 — Importar Estudantes por Planilha

- **Ator**: Coordenador
- **Objetivo**: cadastrar e matricular vários estudantes numa turma a partir de um CSV
- **Pré-condições**: coordenador autenticado; turma de curso que coordena, em período aberto
- **Spec**: SPEC-021 · **Requisitos**: RF-30

**Fluxo principal**
1. Coordenador escolhe o arquivo CSV no detalhe da turma.
2. Sistema mostra a prévia de cada linha (conta nova, só matrícula, já matriculado ou erro), sem gravar.
3. Sem erros, o coordenador confirma; o sistema grava contas e matrículas numa transação, com a auditoria.
4. Sistema mostra as senhas provisórias das contas novas, uma única vez.

**Exceções**
- Linha com erro: a confirmação é recusada e nada é gravado.

**Pós-condições**: todas as linhas gravadas ou nenhuma.
**Regras aplicadas**: RB-15, RB-19, RB-20, RB-22.
