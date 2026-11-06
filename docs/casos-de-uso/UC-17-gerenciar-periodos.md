# UC-17 — Gerenciar Períodos Letivos

- **Ator**: Administrador
- **Objetivo**: cadastrar períodos (AAAA/1, AAAA/2) e encerrar ou reabrir um período
- **Pré-condições**: administrador autenticado
- **Spec**: SPEC-017 · **Requisitos**: RF-26

**Fluxo principal**
1. Administrador abre Períodos letivos.
2. Cadastra um período (nasce Aberto) ou escolhe Encerrar / Reabrir.
3. Sistema grava o status e a auditoria; encerrado, as turmas do período ficam somente leitura (RB-20).

**Exceções**
- Nome fora do formato ou repetido: recusado com o campo indicado.

**Pós-condições**: período e auditoria gravados.
**Regras aplicadas**: RB-13, RB-20, RB-22.
