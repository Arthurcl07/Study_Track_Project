# UC-01 — Autenticar-se

- **Ator**: Estudante, Professor ou Coordenador
- **Objetivo**: obter acesso autenticado ao sistema
- **Pré-condições**: usuário possui cadastro ativo

**Fluxo principal**
1. Usuário informa e-mail e senha.
2. Sistema valida as credenciais.
3. Sistema cria a sessão e redireciona ao painel do perfil correspondente.

**Exceções**
- Credenciais inválidas: sistema exibe mensagem de erro e mantém o usuário na tela de login. (RF-01)

**Pós-condições**: sessão ativa vinculada ao perfil do usuário.
**Regras aplicadas**: RB-01.
