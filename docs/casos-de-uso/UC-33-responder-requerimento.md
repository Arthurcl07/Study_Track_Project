# UC-33 — Responder Requerimento

- **Ator**: Professor (revisão e segunda chamada), Administrador (os demais)
- **Objetivo**: analisar e decidir um requerimento
- **Pré-condições**: ser o responsável pelo requerimento
- **Spec**: SPEC-036, SPEC-044 · **Requisitos**: RF-44, RF-53

**Fluxo principal**
1. Responsável abre Requerimentos e vê os pendentes, com os atrasados em destaque.
2. Marca Em análise e depois Deferido ou Indeferido, com a resposta.
3. Sistema grava, notifica o estudante e registra na auditoria.
4. No trancamento de disciplina ou de curso, deferir também tranca a matrícula ou o curso, na mesma operação (SPEC-044, RB-42).

**Fluxos alternativos**: coordenação consulta os requerimentos do curso, só leitura.
**Exceções**: indeferir sem resposta; requerimento já decidido; não ser o responsável; trancamento de disciplina com a matrícula já fora de Cursando, o diário fechado ou o período encerrado; trancamento de curso de estudante que não está Ativo.
**Regras aplicadas**: RB-22, RB-23, RB-30, RB-34, RB-42.
