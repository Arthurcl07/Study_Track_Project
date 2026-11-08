# UC-39 — Registrar Aproveitamento e Concluir Curso

- **Ator**: Administrador (secretaria)
- **Objetivo**: dispensar disciplina cursada fora e concluir o curso do estudante
- **Pré-condições**: disciplina na matriz do curso do estudante
- **Spec**: SPEC-042 · **Requisitos**: RF-50, RF-51

**Fluxo principal**
1. Secretaria abre a ficha e registra o aproveitamento (disciplina, origem, nota e carga).
2. Sistema grava, recalcula a integralização e registra na auditoria.
3. Com 100%, a secretaria marca o estudante como Concluído; o histórico mostra a conclusão.

**Fluxos alternativos**: excluir um aproveitamento.
**Exceções**: disciplina fora da matriz; aproveitamento repetido; concluir com menos de 100%.
**Regras aplicadas**: RB-22, RB-30, RB-35, RB-40.
