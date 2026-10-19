# UC-13 — Consultar Histórico de Notas

- **Ator**: Coordenador, Professor
- **Objetivo**: saber quem lançou ou alterou cada nota, quando e de quanto para quanto
- **Pré-condições**: usuário autenticado; turma no seu escopo (RB-03, RB-04)
- **Spec**: SPEC-013 · **Requisito**: RF-20

**Fluxo principal**
1. Usuário abre "Histórico de notas" e escolhe a turma.
2. Sistema lista os registros da turma, do mais recente para o mais antigo: data e hora, avaliação, estudante, valor anterior, valor novo e autor.

**Exceções**
- Turma fora do escopo: acesso negado.

**Pós-condições**: nenhuma alteração (consulta). Registros não podem ser editados nem apagados (RB-16).
**Regras aplicadas**: RB-03, RB-04, RB-16.
