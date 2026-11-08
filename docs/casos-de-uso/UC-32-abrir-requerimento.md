# UC-32 — Abrir Requerimento

- **Ator**: Estudante
- **Objetivo**: pedir revisão de prova, segunda chamada, declaração, trancamento ou outro
- **Pré-condições**: estudante com conta ativa; para revisão e segunda chamada, turma cursando
- **Spec**: SPEC-036 · **Requisitos**: RF-44

**Fluxo principal**
1. Estudante abre Requerimentos e escolhe Novo requerimento.
2. Escolhe o tipo (e a turma e a avaliação, quando pedido) e descreve o pedido.
3. Sistema grava com protocolo, prazo de 5 dias úteis e responsável, e registra na auditoria.
4. Estudante acompanha o status e recebe notificação a cada mudança.

**Fluxos alternativos**: abrir a declaração de matrícula deferida para imprimir.
**Exceções**: turma em que não está cursando; descrição vazia.
**Regras aplicadas**: RB-22, RB-23, RB-34.
