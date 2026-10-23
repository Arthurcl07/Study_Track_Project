# UC-06 — Cadastrar Estudante

- **Ator**: Coordenador
- **Objetivo**: cadastrar um estudante já vinculado a uma turma, ou matricular um estudante existente
- **Pré-condições**: coordenador autenticado e responsável pela turma (OPEN-001, RB-04)
- **Spec**: SPEC-002 · **Requisito**: RF-03

**Fluxo principal**
1. Coordenador abre a turma em "Turmas e estudantes".
2. Coordenador informa nome, e-mail e senha inicial do estudante (OPEN-009).
3. Sistema valida os dados obrigatórios e a senha com no mínimo 8 caracteres.
4. Sistema cria o usuário com perfil Estudante (RB-01), guarda a senha com hash (RNF-02) e o matricula na turma. O estudante pertence ao curso da turma (RB-19, SPEC-015).

**Fluxo alternativo**
- Estudante já cadastrado: coordenador informa o e-mail e o sistema só cria a matrícula na turma, se o estudante for do mesmo curso da turma (RB-19).

**Exceções**
- Dado obrigatório ausente ou inválido: sistema impede o cadastro, indica o campo e não grava nada.
- E-mail já cadastrado: sistema recusa o cadastro.
- Estudante de outro curso: sistema recusa a matrícula (RB-19).
- Turma fora da responsabilidade do coordenador ou usuário de outro perfil: acesso negado (RNF-03).

**Pós-condições**: estudante cadastrado e matriculado na turma.
**Regras aplicadas**: RB-01, RB-04, RB-19.
