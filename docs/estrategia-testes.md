# Estratégia de Testes e Qualidade — StudyTrack

## 1. Princípios

- Qualidade não é ausência de bug: é previsibilidade, estabilidade e evolução segura.
- Cada cláusula SHALL de uma Spec vira pelo menos um teste (regra do curso).
- Regra de negócio roda sem banco e sem interface (DA-07): teste unitário puro sobre a camada de domínio.
- Um teste por RB, nomeado pelo identificador, por exemplo `RB-09_classifica_risco_por_frequencia`.

## 2. Pirâmide de testes

| Nível | O que cobre | Quantidade | Quando roda |
|---|---|---|---|
| Unitário | Regras de domínio: classificação (RB-05/06/07/09), progresso do plano (RB-12), atraso (RB-08) | Muitos | A cada commit |
| Integração | Rotas `app/api/` com banco de teste: autenticação, escopo (ADR-003), recálculo na escrita | Médio | A cada PR |
| Ponta a ponta | Fluxos críticos: login, registrar nota e ver o dashboard atualizado | Poucos | Antes de cada entrega |

## 3. Rastreabilidade Spec → teste

| Spec | Critérios | Nível principal |
|---|---|---|
| SPEC-001 | AC-001-01 a 04 | Integração |
| SPEC-003 | AC-003-01 a 07 | Unitário (limites de 5,0, 6,0 e 75%) |
| SPEC-004 | AC-004-01 a 05 | Integração |
| SPEC-005 | AC-005-01 a 05 | Unitário + integração |
| SPEC-006 | AC-006-01 a 05 | Integração |
| SPEC-007 | AC-007-01 a 06 | Integração + ponta a ponta |
| SPEC-008 | AC-008-01 a 05 | Unitário + integração |
| SPEC-009 | AC-009-01 a 05 | Integração |

## 4. Atributos de qualidade (ISO/IEC 25010) e onde são verificados

| Característica | Requisito do projeto | Como verificar |
|---|---|---|
| Funcionalidade (segurança de acesso) | RNF-03, RNF-05, RB-02/03/04 | Testes de integração com 3 perfis; chamada direta à API sem permissão deve falhar |
| Funcionalidade (acurácia) | RB-05 a RB-09 | Testes unitários nos limites de 5,0, 6,0 e 75% |
| Confiabilidade | RB-10 (recálculo a cada alteração) | Teste: alterar nota e conferir indicador na mesma operação |
| Usabilidade | RNF-04 (interface adaptável) | Verificação manual em computador, tablet e smartphone |
| Eficiência | RNF-01 (3 s, P95) | Medição de tempo de resposta das páginas principais (amostra) |
| Manutenibilidade | DA-02, DA-07 (regra isolada) | Revisão: nenhuma regra de classificação fora do domínio |
| Portabilidade | ADR-004 (stack única) | Aplicação sobe a partir do README em máquina limpa |

## 5. Critérios de pronto para uma Spec

- Todos os critérios AC da Spec têm teste e passam.
- Invariantes INV da Spec têm teste (ou revisão registrada).
- Nenhuma regra de negócio duplicada fora do domínio.
- PR revisado por um colega, ligado à issue (`Closes #N`).

## 6. Ferramentas

Framework de testes: Vitest (OPEN-008, fechada). Comando: `npm test`. Os resultados de cada Spec ficam em `docs/verificacao/`.

## 7. Dados de teste

Cada teste cria os próprios dados (estudante, turma, nota) e não depende de ordem de execução. Nenhum dado real de aluno entra no repositório.

## 8. Defeitos

Defeito encontrado vira issue com o rótulo `bug`, referenciando a Spec e o critério violado. Correção entra com um teste que reproduz o defeito.
