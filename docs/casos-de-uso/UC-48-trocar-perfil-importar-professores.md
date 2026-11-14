# UC-48 — Trocar Perfil e Importar Professores

- **Ator**: Administrador
- **Objetivo**: corrigir o perfil de uma conta e cadastrar professores em lote
- **Pré-condições**: nenhuma
- **Spec**: SPEC-053 · **Requisitos**: RF-62

**Fluxo principal**
1. Administrador troca o perfil de uma conta sem vínculos incompatíveis.
2. Importa a planilha de professores, confere a prévia e confirma.
3. Sistema cria as contas com senha provisória e mostra as senhas uma vez.

**Fluxos alternativos**: —.
**Exceções**: vínculo incompatível; e-mail repetido.
**Regras aplicadas**: RB-15, RB-22, RB-48.
