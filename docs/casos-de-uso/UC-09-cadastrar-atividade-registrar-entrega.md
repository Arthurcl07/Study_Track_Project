# UC-09 — Cadastrar Atividade e Registrar Entrega

- **Ator**: Professor
- **Objetivo**: cadastrar atividades com prazo e registrar quando cada estudante entregou
- **Pré-condições**: professor autenticado e responsável pela turma (RB-03)
- **Spec**: SPEC-005 · **Requisitos**: RF-08, RF-09

**Fluxo principal**
1. Professor abre "Atividades" e escolhe a turma.
2. Professor cadastra a atividade com descrição e prazo.
3. Sistema grava a atividade na turma.
4. Professor abre a atividade e registra a entrega de um estudante, com a data da entrega (padrão: hoje, OPEN-003).
5. Sistema mostra o status de cada estudante: No prazo, Pendente ou Atrasada, calculado na leitura (OPEN-010).

**Fluxo alternativo**
- Registro feito por engano: professor desfaz a entrega e o status volta a ser calculado sem ela.
- Estudante consulta "Minhas atividades" e vê apenas o próprio status (RB-02).

**Exceções**
- Atividade sem descrição ou sem prazo: sistema impede o cadastro e indica o campo.
- Data de entrega no futuro: sistema recusa.
- Turma que o professor não leciona: acesso negado.

**Pós-condições**: atividade cadastrada; entregas registradas; sem entrega depois do fim do prazo (23:59, horário de Brasília) o status é Atrasada.
**Regras aplicadas**: RB-02, RB-03, RB-08.
