# UC-34 — Montar Matriz Curricular

- **Ator**: Coordenador
- **Objetivo**: definir semestre, caráter e pré-requisitos das disciplinas do curso
- **Pré-condições**: disciplina na grade de um curso que coordena
- **Spec**: SPEC-037 · **Requisitos**: RF-45

**Fluxo principal**
1. Coordenador abre Disciplinas e a aba Matriz do curso.
2. Define o semestre sugerido, se é obrigatória e os pré-requisitos de cada disciplina.
3. Sistema grava sem ciclo e registra na auditoria.

**Fluxos alternativos**: estudante, coordenador e secretaria consultam a integralização.
**Exceções**: pré-requisito fora da matriz, a própria disciplina ou ciclo.
**Regras aplicadas**: RB-22, RB-35, RB-41.
