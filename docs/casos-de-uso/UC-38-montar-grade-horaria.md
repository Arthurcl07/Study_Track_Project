# UC-38 — Montar Grade Horária

- **Ator**: Coordenador (horários), Administrador (salas)
- **Objetivo**: definir quando e onde cada turma tem aula
- **Pré-condições**: turma de curso que coordena; sala cadastrada
- **Spec**: SPEC-041 · **Requisitos**: RF-49

**Fluxo principal**
1. Secretaria cadastra as salas.
2. Coordenador abre a turma e inclui os horários (dia, início, fim e sala).
3. Sistema confere choques e capacidade, grava e registra na auditoria.
4. Estudante e professor veem a grade da semana.

**Fluxos alternativos**: excluir horário; mudar as vagas da turma.
**Exceções**: choque de sala ou de professor; vagas acima da capacidade; fim antes do início.
**Regras aplicadas**: RB-22, RB-39.
