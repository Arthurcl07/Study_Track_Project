# UC-19 — Emitir Boletim e Histórico Escolar

- **Ator**: Estudante, Coordenador
- **Objetivo**: obter o boletim de um período ou o histórico completo, pronto para imprimir ou salvar em PDF
- **Pré-condições**: estudante autenticado (os próprios) ou coordenador (estudante de curso que coordena)
- **Spec**: SPEC-020 · **Requisitos**: RF-29

**Fluxo principal**
1. Usuário abre o documento (estudante: menu Documentos; coordenador: detalhe da turma).
2. Sistema monta o documento com as turmas do estudante e o resultado de cada uma (RB-24).
3. Usuário clica em Baixar PDF.

**Exceções**
- Estudante de outro curso (coordenador): não encontrado. Professor e administrador: acesso negado.

**Pós-condições**: nenhuma alteração (consulta).
**Regras aplicadas**: RB-02, RB-04, RB-13, RB-24.
