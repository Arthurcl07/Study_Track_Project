# UC-50 — Importar do Sistema Anterior

- **Ator**: Administrador
- **Objetivo**: trazer alunos e histórico do sistema antigo
- **Pré-condições**: cursos e matrizes cadastrados
- **Spec**: SPEC-058 · **Requisitos**: RF-64

**Fluxo principal**
1. Secretaria envia as planilhas de alunos e de histórico.
2. Sistema valida tudo e mostra a prévia, sem gravar.
3. Secretaria confirma; o sistema grava tudo ou nada e audita.

**Fluxos alternativos**: baixar os modelos.
**Exceções**: qualquer linha inválida.
**Regras aplicadas**: RB-19, RB-33, RB-49.
