# UC-25 — Corrigir Cadastro

- **Ator**: Administrador (contas), Coordenador (disciplinas, turmas, matrículas), Professor (avaliações, atividades, aulas)
- **Objetivo**: corrigir um dado digitado errado ou excluir um cadastro criado por engano
- **Pré-condições**: cadastro no escopo de quem pede; turma de período aberto
- **Spec**: SPEC-026 · **Requisitos**: RF-35

**Fluxo principal**
1. O ator abre o cadastro e escolhe Editar (ou Excluir).
2. Altera os campos e salva (ou confirma a exclusão).
3. Sistema valida, grava, recalcula média, frequência e indicador quando necessário e registra na auditoria.

**Fluxos alternativos**: tirar um estudante da turma (coordenador); mudar a data ou excluir uma aula (professor).
**Exceções**: campo inválido; registro dependente (RB-32); fora do escopo; período encerrado.
**Regras aplicadas**: RB-10, RB-20, RB-21, RB-22, RB-32.
