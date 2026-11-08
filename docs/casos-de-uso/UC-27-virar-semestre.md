# UC-27 — Virar o Semestre

- **Ator**: Administrador (secretaria)
- **Objetivo**: criar as turmas do período novo a partir das turmas de um período anterior
- **Pré-condições**: período de destino cadastrado e aberto
- **Spec**: SPEC-030 · **Requisitos**: RF-38

**Fluxo principal**
1. Administrador abre Virada de semestre e escolhe origem e destino.
2. Sistema mostra a prévia de cada turma (copiar, já existe, professor desativado).
3. Administrador marca as turmas e, se quiser, "levar os estudantes".
4. Sistema cria as turmas e as matrículas numa transação e registra na auditoria.

**Exceções**: destino encerrado ou igual à origem; nenhuma turma marcada.
**Regras aplicadas**: RB-18, RB-20, RB-22, RB-30.
