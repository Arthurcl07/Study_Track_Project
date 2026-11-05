# UC-14 — Gerenciar Cursos

- **Ator**: Administrador
- **Objetivo**: criar os cursos da instituição e definir quem coordena cada um
- **Pré-condições**: administrador autenticado com conta ativa
- **Spec**: SPEC-015 · **Requisito**: RF-22

**Fluxo principal**
1. Administrador abre "Cursos".
2. Administrador informa o nome do curso e escolhe o coordenador (conta ativa com perfil Coordenador).
3. Sistema cria o curso com esse coordenador (RB-17).

**Fluxo alternativo**
- Trocar coordenador: administrador escolhe outro coordenador ativo para o curso; o anterior deixa de ver as turmas desse curso na hora.

**Exceções**
- Nome ausente ou já usado por outro curso: sistema impede e indica o campo.
- Usuário escolhido não é Coordenador ou está desativado: sistema impede (RB-17).
- Usuário de outro perfil: acesso negado.

**Pós-condições**: curso com exatamente 1 coordenador. Nenhum dado acadêmico é exibido ao administrador (RB-13).
**Regras aplicadas**: RB-13, RB-14, RB-17.
