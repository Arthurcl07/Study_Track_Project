# UC-29 — Registrar Abono de Faltas

- **Ator**: Administrador (secretaria)
- **Objetivo**: abonar as faltas de um estudante num intervalo de datas
- **Pré-condições**: documento apresentado à secretaria
- **Spec**: SPEC-032 · **Requisitos**: RF-40

**Fluxo principal**
1. Administrador abre a ficha do estudante e escolhe Novo abono.
2. Informa início, fim, motivo e observação; o sistema mostra quantas faltas serão abonadas.
3. Sistema grava o abono, recalcula frequência e indicador nas turmas de período aberto e registra na auditoria.

**Fluxos alternativos**: excluir um abono (as faltas voltam a contar).
**Exceções**: intervalo inválido ou maior que 180 dias.
**Regras aplicadas**: RB-10, RB-20, RB-21, RB-22, RB-31.
