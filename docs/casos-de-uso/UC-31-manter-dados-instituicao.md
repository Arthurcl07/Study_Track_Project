# UC-31 — Manter Dados da Instituição

- **Ator**: Administrador (secretaria)
- **Objetivo**: registrar os dados da instituição que aparecem nos documentos
- **Pré-condições**: —
- **Spec**: SPEC-033 · **Requisitos**: RF-42

**Fluxo principal**
1. Administrador abre Instituição.
2. Preenche nome, CNPJ, endereço, contato, responsável pela secretaria e envia o logotipo.
3. Sistema valida, grava e registra na auditoria; boletim e histórico passam a usar os dados.

**Exceções**: CNPJ inválido; logotipo fora do formato ou maior que 200 KB.
**Regras aplicadas**: RB-13, RB-22.
