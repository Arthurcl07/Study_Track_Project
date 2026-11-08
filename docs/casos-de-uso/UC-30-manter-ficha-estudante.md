# UC-30 — Manter Ficha do Estudante

- **Ator**: Administrador (edita); Coordenador do curso e o próprio Estudante (consultam)
- **Objetivo**: manter número de matrícula e dados pessoais do estudante
- **Pré-condições**: estudante cadastrado (a ficha nasce com a conta)
- **Spec**: SPEC-033, SPEC-034, SPEC-035 · **Requisitos**: RF-41, RF-43

**Fluxo principal**
1. Administrador busca o estudante em Estudantes e abre a ficha.
2. Preenche CPF, data de nascimento, telefone e responsável e salva.
3. Sistema valida, grava e registra na auditoria.

**Fluxos alternativos**: coordenador ou estudante consultam a ficha; administrador emite boletim ou histórico a partir dela.
**Exceções**: CPF inválido ou repetido; data de nascimento futura.
**Regras aplicadas**: RB-13, RB-22, RB-33.
