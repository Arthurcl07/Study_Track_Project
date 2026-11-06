# UC-18 — Consultar Auditoria

- **Ator**: Coordenador, Administrador
- **Objetivo**: saber quem alterou o quê, quando e de quanto para quanto
- **Pré-condições**: usuário autenticado
- **Spec**: SPEC-019 · **Requisitos**: RF-28

**Fluxo principal**
1. Usuário abre Auditoria.
2. Sistema lista os registros do escopo, mais recentes primeiro: coordenador, ações acadêmicas dos cursos que coordena; administrador, ações de contas, cursos e períodos.
3. Usuário filtra por tipo de ação e navega pelas páginas.

**Pós-condições**: nenhuma alteração (consulta).
**Regras aplicadas**: RB-04, RB-13, RB-22.
