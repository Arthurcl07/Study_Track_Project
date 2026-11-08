# UC-35 — Rematricular-se

- **Ator**: Estudante
- **Objetivo**: escolher as turmas do próximo período
- **Pré-condições**: estudante Ativo; janela de rematrícula aberta
- **Spec**: SPEC-038 · **Requisitos**: RF-46

**Fluxo principal**
1. Estudante abre Rematrícula e vê as turmas do curso no período, com horários, vagas e o que impede cada uma.
2. Escolhe uma turma.
3. Sistema confere vaga, pré-requisitos, aprovação anterior e choque de horário, matricula e registra na auditoria.

**Fluxos alternativos**: cancelar a própria matrícula na janela, se ainda não tiver registros.
**Exceções**: fora da janela; sem vaga; pré-requisito pendente; já aprovado; choque de horário.
**Regras aplicadas**: RB-22, RB-30, RB-32, RB-36.
