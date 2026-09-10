# UC-03 — Registrar Nota

- **Ator**: Professor
- **Objetivo**: lançar a nota de um estudante em uma avaliação
- **Pré-condições**: professor autenticado e responsável pela turma; avaliação cadastrada

**Fluxo principal**
1. Professor seleciona a turma, a avaliação e o estudante.
2. Professor informa o valor da nota.
3. Sistema valida o valor informado.
4. Sistema associa a nota ao estudante, à disciplina e à avaliação.
5. Sistema recalcula a média do estudante na disciplina (RF-06) e atualiza o indicador acadêmico (RF-11).

**Fluxo alternativo**
- Alteração de nota já lançada: sistema sobrescreve o valor anterior e repete os passos 3–5.

**Exceções**
- Valor de nota inválido (fora da faixa permitida): sistema rejeita o registro e solicita correção.

**Pós-condições**: nota registrada; média e indicador atualizados.
**Regras aplicadas**: RB-06, RB-07, RB-10.
