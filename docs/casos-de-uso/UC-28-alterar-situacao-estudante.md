# UC-28 — Alterar Situação do Estudante

- **Ator**: Administrador (secretaria)
- **Objetivo**: registrar trancamento, transferência, cancelamento, conclusão, reativação ou troca de curso
- **Pré-condições**: estudante cadastrado
- **Spec**: SPEC-031 · **Requisitos**: RF-39

**Fluxo principal**
1. Administrador abre a ficha do estudante e escolhe Alterar situação.
2. Informa a situação, a data e o motivo.
3. Sistema grava a situação, ajusta as matrículas de período aberto e registra na auditoria.

**Fluxos alternativos**: trocar o curso de um estudante ativo sem matrícula cursando em período aberto.
**Exceções**: motivo vazio; data futura; matrícula cursando na troca de curso.
**Regras aplicadas**: RB-19, RB-22, RB-24, RB-30.
