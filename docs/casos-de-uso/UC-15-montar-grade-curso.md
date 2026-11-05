# UC-15 — Montar a Grade do Curso

- **Ator**: Coordenador
- **Objetivo**: definir quais disciplinas fazem parte de cada curso que coordena
- **Pré-condições**: coordenador autenticado, coordenando ao menos um curso
- **Spec**: SPEC-015 · **Requisito**: RF-23

**Fluxo principal**
1. Coordenador abre "Disciplinas" e escolhe o curso (quando coordena mais de um).
2. Coordenador cadastra uma disciplina nova com nome e carga horária.
3. Sistema cria a disciplina na grade do curso escolhido.

**Fluxo alternativo**
- Adicionar disciplina existente: coordenador escolhe uma disciplina que já está na grade de outro curso (ex.: Cálculo I) e a adiciona ao seu curso; a disciplina não é duplicada (OPEN-033).

**Exceções**
- Dado obrigatório ausente ou carga horária inválida: sistema impede e indica o campo.
- Curso que ele não coordena: acesso negado (RB-04).
- Disciplina já está na grade do curso: sistema avisa e não duplica.

**Pós-condições**: disciplina na grade do curso, disponível para criar turmas desse curso (UC-07).
**Regras aplicadas**: RB-04, RB-18.
