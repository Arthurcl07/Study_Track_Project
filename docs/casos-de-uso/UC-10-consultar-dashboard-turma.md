# UC-10 — Consultar Dashboard da Turma

- **Ator**: Professor
- **Objetivo**: acompanhar o desempenho dos estudantes de uma turma que leciona
- **Pré-condições**: professor autenticado e responsável pela turma (RB-03)
- **Spec**: SPEC-008 · **Requisito**: RF-13

**Fluxo principal**
1. Professor clica em "Abrir turma" no seu painel.
2. Sistema mostra quantos estudantes estão em Normal, Atenção, Risco e sem dados.
3. Sistema lista os estudantes da turma com média, frequência e situação do indicador vigente (RB-10).
4. Para estudante em Risco, sistema oferece "Criar plano" (extensão: UC-04); se já houver plano ativo, mostra o link e o progresso.

**Exceções**
- Turma que o professor não leciona: acesso negado (página não encontrada; na API, 403).

**Pós-condições**: nenhuma alteração de dados (consulta).
**Regras aplicadas**: RB-03, RB-09, RB-10, RB-11.
