# ADR-001 — Arquitetura em camadas (monólito modular)

## Contexto
O sistema tem domínio fortemente relacional (Turma, Estudante, Nota, Frequência, Atividade,
IndicadorAcademico, PlanoRecuperacao) e é construído por uma equipe de 3 pessoas dentro do
prazo de um semestre.

## Decisão
Adotar arquitetura em camadas (apresentação, lógica de negócio, persistência) em um único
deploy (monólito modular), em vez de microsserviços.

## Alternativas consideradas
- **Microsserviços**: rejeitado. Custo de infraestrutura, deploy e comunicação entre serviços
  não se paga para o escopo e o tempo disponíveis.
- **Script único sem separação de camadas**: rejeitado. Mistura regra de negócio com
  persistência/UI, o que viola DA-02 e DA-07 (regra de negócio precisa ser isolada e testável).

## Consequências
- Deploy simples, um único processo.
- Testes de domínio rodam sem subir banco nem servidor web (DA-07).
- Se o sistema crescer muito, separar módulos em serviços exigirá refatoração — risco aceito
  dado o escopo acadêmico do projeto.
