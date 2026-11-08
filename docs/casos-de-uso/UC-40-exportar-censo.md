# UC-40 — Exportar Dados de Apoio ao Censo

- **Ator**: Administrador (secretaria)
- **Objetivo**: gerar o arquivo de apoio para o Censo Escolar
- **Pré-condições**: período cadastrado
- **Spec**: SPEC-043 · **Requisitos**: RF-52

**Fluxo principal**
1. Secretaria abre Exportação do Censo e escolhe o período.
2. Sistema gera o CSV de apoio e registra a exportação na auditoria.

**Fluxos alternativos**: —
**Exceções**: período inexistente.
**Regras aplicadas**: RB-13, RB-22.
