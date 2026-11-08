# UC-26 — Pedir Redefinição de Senha

- **Ator**: qualquer usuário (sem sessão); Administrador (aprova)
- **Objetivo**: voltar a entrar no sistema depois de esquecer a senha
- **Pré-condições**: conta ativa
- **Spec**: SPEC-027 · **Requisitos**: RF-36, RF-18

**Fluxo principal**
1. Usuário clica em "Esqueci minha senha" no login e informa o e-mail.
2. Sistema grava o pedido (se a conta existir e estiver ativa) e responde com a mensagem padrão.
3. Administrador confere a identidade da pessoa, abre Pedidos de senha e aprova.
4. Sistema gera a senha provisória, mostra uma vez ao administrador e registra na auditoria.
5. Usuário entra com a senha provisória e define a senha nova (UC-12).

**Fluxos alternativos**: o administrador recusa o pedido.
**Exceções**: pedido já resolvido; administrador aprovando o próprio pedido.
**Regras aplicadas**: RB-14, RB-15, RB-22, RB-27.
