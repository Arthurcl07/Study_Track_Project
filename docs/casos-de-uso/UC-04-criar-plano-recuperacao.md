# UC-04 — Criar Plano de Recuperação

- **Ator**: Professor
- **Objetivo**: apoiar um estudante em situação de risco com um plano de atividades
- **Pré-condições**: estudante classificado como Risco (RB-11)

**Fluxo principal**
1. Professor acessa o dashboard da turma e seleciona um estudante em situação de Risco.
2. Professor escreve os itens do plano, um por linha (de 1 a 20, OPEN-021).
3. Sistema associa o plano ao estudante e ao professor responsável.
4. Sistema inicializa o progresso do plano em 0%.

**Fluxo alternativo**
- Conclusão de item do plano: professor marca ou desmarca o item (OPEN-003) e o sistema recalcula o progresso como concluídos ÷ previstos (RB-12).
- Encerramento: professor encerra o plano quando achar adequado, mesmo que o estudante já tenha saído do Risco (OPEN-012); o plano fica somente leitura.

**Exceções**
- Estudante não está em situação de Risco: sistema impede a criação do plano e exibe mensagem explicativa.
- Estudante já tem plano ativo na turma: sistema impede um segundo plano ativo.
- Turma que o professor não leciona: acesso negado.

**Pós-condições**: plano de recuperação criado e vinculado ao estudante.
**Regras aplicadas**: RB-11, RB-12.
