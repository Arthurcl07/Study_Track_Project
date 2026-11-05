# UC-11 — Gerenciar Contas

- **Ator**: Administrador
- **Objetivo**: criar contas com o perfil certo e controlar quem pode entrar no sistema
- **Pré-condições**: administrador autenticado com conta ativa
- **Spec**: SPEC-010 · **Requisito**: RF-16

**Fluxo principal**
1. Administrador abre "Contas".
2. Administrador informa nome, e-mail, senha inicial e perfil da nova conta; para Estudante, também o curso (RB-19, SPEC-015).
3. Sistema valida os dados, grava a senha com hash e cria a conta ativa com o perfil escolhido (RB-01).

**Fluxo alternativo**
- Consultar: administrador filtra a lista de contas por perfil.
- Desativar: administrador desativa uma conta; ela não entra mais e uma sessão aberta perde o acesso na próxima requisição (RB-14). Os dados continuam no sistema.
- Reativar: administrador reativa a conta.

**Exceções**
- Dado obrigatório ausente ou e-mail já cadastrado: sistema impede o cadastro e indica o campo.
- Administrador tenta desativar a si mesmo, um professor responsável por turma ou o coordenador de um curso: sistema impede e explica.
- Usuário de outro perfil: acesso negado. Administrador tentando ver dados acadêmicos: acesso negado (RB-13).

**Pós-condições**: conta criada com exatamente 1 perfil, ou conta ativada/desativada.
**Regras aplicadas**: RB-01, RB-13, RB-14, RB-19.
