# UC-36 — Fechar e Homologar Diário

- **Ator**: Professor (fecha), Coordenador (homologa, devolve, reabre)
- **Objetivo**: concluir oficialmente o registro da turma
- **Pré-condições**: turma de período aberto
- **Spec**: SPEC-039 · **Requisitos**: RF-47

**Fluxo principal**
1. Professor registra o conteúdo de cada aula na chamada.
2. No fim, fecha o diário; o sistema confere se toda avaliação tem as notas.
3. Coordenador abre Diários e homologa.
4. Sistema trava a turma e registra na auditoria.

**Fluxos alternativos**: coordenador devolve com observação (o professor é notificado) ou reabre um diário homologado.
**Exceções**: nota faltando ao fechar.
**Regras aplicadas**: RB-20, RB-22, RB-23, RB-37.
