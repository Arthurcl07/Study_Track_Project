# UC-04 — Criar Plano de Recuperação

- **Ator**: Professor
- **Objetivo**: apoiar um estudante em situação de risco com um plano de atividades
- **Pré-condições**: estudante classificado como Risco (RB-11)

**Fluxo principal**
1. Professor acessa o dashboard da turma e seleciona um estudante em situação de Risco.
2. Professor define as atividades previstas no plano.
3. Sistema associa o plano ao estudante e ao professor responsável.
4. Sistema inicializa o progresso do plano em 0%.

**Fluxo alternativo**
- Conclusão de atividade do plano: sistema recalcula o progresso (RB-12) a cada atividade concluída.

**Exceções**
- Estudante não está em situação de Risco: sistema impede a criação do plano e exibe mensagem explicativa.

**Pós-condições**: plano de recuperação criado e vinculado ao estudante.
**Regras aplicadas**: RB-11, RB-12.
