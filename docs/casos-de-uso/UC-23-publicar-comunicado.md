# UC-23 — Publicar Comunicado

- **Ator**: Professor, Coordenador
- **Objetivo**: avisar os estudantes de uma turma ou de um curso
- **Pré-condições**: professor da turma ou coordenador do curso; período aberto
- **Spec**: SPEC-025 · **Requisitos**: RF-34

**Fluxo principal**
1. Autor abre Comunicados e escolhe o alcance (turma ou curso).
2. Escreve título e texto e publica.
3. Sistema grava o comunicado, notifica os alcançados e registra na auditoria.

**Fluxos alternativos**: o autor apaga o próprio comunicado.
**Exceções**: campo inválido; alcance fora do escopo; período encerrado.
**Regras aplicadas**: RB-20, RB-22, RB-23, RB-26.
