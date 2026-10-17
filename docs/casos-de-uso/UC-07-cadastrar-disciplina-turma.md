# UC-07 — Cadastrar Disciplina e Turma

- **Ator**: Coordenador
- **Objetivo**: criar a estrutura acadêmica (disciplinas e turmas) e ligar professor e estudantes
- **Pré-condições**: coordenador autenticado (OPEN-001)
- **Spec**: SPEC-002 · **Requisito**: RF-04

**Fluxo principal**
1. Coordenador cadastra uma disciplina com nome e carga horária (inteiro maior que zero, OPEN-009).
2. Coordenador cadastra uma turma com nome, período, disciplina e professor responsável.
3. Sistema grava a turma e registra o coordenador que a criou como responsável por ela.
4. Coordenador matricula estudantes na turma (UC-06).

**Fluxo alternativo**
- Trocar professor (RF-17, SPEC-010): coordenador responsável escolhe outro professor ativo; a turma e seus planos de recuperação ativos passam para ele.

**Exceções**
- Dado obrigatório ausente ou carga horária inválida: sistema impede o cadastro e indica o campo.
- Professor informado não tem perfil Professor: sistema recusa a turma (INV-002-02).
- Usuário sem perfil Coordenador: acesso negado (RNF-03).

**Pós-condições**: turma pertence a exatamente 1 disciplina e 1 professor, sob a responsabilidade do coordenador.
**Regras aplicadas**: RB-03, RB-04 (escopo das turmas).
