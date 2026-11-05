# UC-16 — Consultar o Dashboard Inicial

- **Ator**: Estudante, Professor, Coordenador, Administrador
- **Objetivo**: ver, logo ao entrar, os números e gráficos mais importantes do próprio perfil
- **Pré-condições**: usuário autenticado com conta ativa e senha própria definida (RB-15)
- **Spec**: SPEC-016 · **Requisitos**: RF-24, RF-25 (e RF-10, RF-13, RF-21, que o dashboard reúne)

**Fluxo principal**
1. Usuário entra no sistema (UC-01).
2. Sistema abre o dashboard do perfil ("Início"), calculado na hora com os dados do seu escopo:
   - Estudante: os próprios dados (RB-02).
   - Professor: as turmas que leciona (RB-03).
   - Coordenador: as turmas dos cursos que coordena (RB-04), com filtro por curso.
   - Administrador: só contas e estrutura dos cursos (RB-13).
3. Usuário segue para as demais funções pelo menu lateral ou pelos atalhos do dashboard.

**Exceções**
- Sem dados no escopo (ex.: professor sem turmas): estado vazio com orientação.
- Coordenador escolhe no filtro um curso que não coordena: o filtro é ignorado e o dashboard mostra só os próprios cursos.

**Pós-condições**: nenhuma alteração de dados (consulta).
**Regras aplicadas**: RB-02, RB-03, RB-04, RB-09, RB-13.
