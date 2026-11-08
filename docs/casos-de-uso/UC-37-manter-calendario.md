# UC-37 — Manter Calendário Acadêmico

- **Ator**: Administrador (secretaria); todos consultam
- **Objetivo**: registrar e consultar datas do período
- **Pré-condições**: período cadastrado
- **Spec**: SPEC-040 · **Requisitos**: RF-48

**Fluxo principal**
1. Secretaria abre Calendário e cadastra eventos do período (início e fim das aulas, feriados, recessos, semana de provas).
2. Sistema grava e registra na auditoria.
3. Todos veem o calendário do mês com os eventos e os prazos das próprias turmas.

**Fluxos alternativos**: editar ou excluir um evento.
**Exceções**: datas fora de ordem; tipo inválido.
**Regras aplicadas**: RB-22, RB-38.
