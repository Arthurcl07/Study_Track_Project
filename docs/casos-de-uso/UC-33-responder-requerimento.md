# UC-33 — Responder Requerimento

- **Ator**: Professor (revisão e segunda chamada), Administrador (os demais)
- **Objetivo**: analisar e decidir um requerimento
- **Pré-condições**: ser o responsável pelo requerimento
- **Spec**: SPEC-036 · **Requisitos**: RF-44

**Fluxo principal**
1. Responsável abre Requerimentos e vê os pendentes, com os atrasados em destaque.
2. Marca Em análise e depois Deferido ou Indeferido, com a resposta.
3. Sistema grava, notifica o estudante e registra na auditoria.

**Fluxos alternativos**: coordenação consulta os requerimentos do curso, só leitura.
**Exceções**: indeferir sem resposta; requerimento já decidido; não ser o responsável.
**Regras aplicadas**: RB-22, RB-23, RB-34.
