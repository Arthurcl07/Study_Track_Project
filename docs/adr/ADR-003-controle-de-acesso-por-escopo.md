# ADR-003 — Controle de acesso filtrado por escopo na própria query

## Contexto
RB-02, RB-03 e RB-04 definem que Estudante, Professor e Coordenador enxergam subconjuntos
diferentes dos dados acadêmicos, de acordo com vínculo (próprio estudante / turmas lecionadas
/ turmas sob responsabilidade).

## Decisão
Toda consulta de dados acadêmicos filtra pelo usuário autenticado dentro da própria query
de acesso a dados (nunca como uma verificação posterior, feita depois de já ter buscado tudo).
Negar por padrão (deny by default).

## Alternativas consideradas
- **Buscar tudo e filtrar na camada de apresentação**: rejeitado. Um bug de UI vazaria dados
  de outros estudantes/turmas — viola RNF-05 (privacidade).

## Consequências
- Toda nova consulta de dado acadêmico precisa declarar explicitamente seu filtro de escopo.
- Reduz drasticamente o risco de vazamento de dados entre perfis.
