# UC-05 — Consultar Relatórios

- **Ator**: Professor ou Coordenador
- **Objetivo**: consultar informações consolidadas de desempenho, frequência e situação acadêmica
- **Pré-condições**: usuário autenticado com perfil Professor ou Coordenador (RB-01)

**Fluxo principal**
1. Usuário solicita um relatório de uma turma (Professor) ou de turmas sob sua
   responsabilidade (Coordenador).
2. Sistema valida a autorização do solicitante conforme o perfil (RB-03, RB-04).
3. Sistema consolida notas, frequência e situação acadêmica das turmas autorizadas.
4. Sistema apresenta o relatório consolidado.

**Exceções**
- Usuário sem autorização para a turma solicitada: sistema bloqueia e exibe mensagem
  de negação (RNF-05).

**Pós-condições**: relatório consolidado exibido, respeitando o escopo do solicitante.
**Regras aplicadas**: RB-03, RB-04.
