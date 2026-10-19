# UC-12 — Definir ou Alterar Senha

- **Ator**: Estudante, Professor, Coordenador ou Administrador
- **Objetivo**: usar uma senha que só o dono da conta conhece
- **Pré-condições**: usuário autenticado com conta ativa
- **Spec**: SPEC-011 · **Requisito**: RF-18

**Fluxo principal**
1. Usuário com conta criada pela tela entra pela primeira vez e é levado a "Defina sua senha" (RB-15).
2. Informa a senha atual, a nova e a confirmação.
3. Sistema valida (8+ caracteres, diferente da atual, confirmação igual), grava o novo hash e libera o sistema.

**Fluxo alternativo**
- Alterar: qualquer usuário abre "Alterar minha senha" no menu e segue os passos 2 e 3.

**Exceções**
- Senha atual errada ou nova inválida: troca impedida e campo indicado.

**Pós-condições**: senha trocada; a antiga deixa de funcionar.
**Regras aplicadas**: RB-15.
