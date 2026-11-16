# UC-41 — Aceitar Termos e Baixar Meus Dados

- **Ator**: Todos os perfis
- **Objetivo**: aceitar os termos vigentes e obter os próprios dados
- **Pré-condições**: estar autenticado
- **Spec**: SPEC-045 · **Requisitos**: RF-54

**Fluxo principal**
1. Usuário entra; sem aceite da versão vigente, o sistema mostra os termos e a política.
2. Usuário aceita; o sistema grava o aceite com data e versão e libera o sistema.
3. Em Meus dados, o usuário baixa o arquivo com os próprios dados; o pedido vai para a auditoria.

**Fluxos alternativos**: rever os termos pelo rodapé.
**Exceções**: recusar o aceite (só pode sair).
**Regras aplicadas**: RB-22, RB-43.
