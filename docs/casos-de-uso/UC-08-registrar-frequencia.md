# UC-08 — Registrar Frequência

- **Ator**: Professor
- **Objetivo**: registrar ou alterar o percentual de frequência dos estudantes de uma turma
- **Pré-condições**: professor autenticado e responsável pela turma (RB-03)
- **Spec**: SPEC-005 · **Requisito**: RF-07

**Fluxo principal**
1. Professor abre "Frequência" e escolhe uma das turmas que leciona.
2. Professor informa o percentual de frequência de um estudante (de 0 a 100%).
3. Sistema grava a frequência vigente do estudante na turma.
4. Na mesma transação, sistema recalcula o indicador acadêmico (include Recalcular Indicador, RB-10).
5. Sistema mostra a nova situação; abaixo de 75% o estudante fica em Risco (RB-05).

**Exceções**
- Valor fora de 0 a 100% ou não numérico: sistema recusa e indica o campo.
- Turma que o professor não leciona: acesso negado.

**Pós-condições**: frequência e indicador atualizados; o histórico acadêmico mostra o valor vigente com a data da última atualização (OPEN-011).
**Regras aplicadas**: RB-03, RB-05, RB-10.
