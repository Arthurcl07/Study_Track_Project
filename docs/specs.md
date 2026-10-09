# Specs — StudyTrack

**Origem:** [`mapa-specs.md`](mapa-specs.md) + baseline de modelagem + [`decisoes-em-aberto.md`](decisoes-em-aberto.md)
**Data:** 2026-10-01
**Regra:** a implementação obedece a esta Spec. Conflito entre código, Spec e baseline não se resolve em silêncio.

Este arquivo contém o texto completo das Specs aprovadas, na ordem de implementação. Não contém código.

Legenda de status da Spec:

| Status | Significado |
|---|---|
| `especificada` | Texto completo gerado; ainda sem aprovação humana da lista |
| `aprovada` | Humano aprovou o texto e a posição na ordem |
| `em implementação` | Código em andamento contra esta Spec |
| `implementada` | Critérios, invariantes e testes atendidos |
| `fora de escopo` | Explicitamente excluído desta versão |

---

## Registro de aprovação humana

| Item | Decisão | Data |
|---|---|---|
| Lista SPEC-001 … SPEC-009 | `aprovada` | 2026-10-01 |
| Ordem de execução | 001 → 002 → 003 → 004 → 005 → 006 → 007 → 008 → 009 | 2026-10-01 |
| Primeira Spec a implementar | SPEC-001 | 2026-10-01 |
| SPEC-002 aprovada para implementação, com OPEN-001 e OPEN-009 fechadas (decisão delegada pelo grupo ao agente, aprovada por Arthur) | `aprovada` | 2026-10-09 |
| SPEC-003 aprovada para implementação, com OPEN-002 fechada (decisão delegada pelo grupo ao agente, aprovada por Arthur) | `aprovada` | 2026-10-09 |

---

## Lista ordenada

| Ordem | ID | Nome | Dependências | Status |
|---|---|---|---|---|
| 1 | SPEC-001 | Autenticação, perfis e autorização por escopo | — | `implementada` |
| 2 | SPEC-002 | Estrutura acadêmica e vínculos de turma | SPEC-001 | `em implementação` |
| 3 | SPEC-003 | Cálculo da situação acadêmica e indicador persistido | SPEC-002 | `em implementação` |
| 4 | SPEC-004 | Registro de avaliações, notas e médias | SPEC-001, SPEC-002, SPEC-003 | `especificada` |
| 5 | SPEC-005 | Frequência, atividades e entregas atrasadas | SPEC-001, SPEC-002, SPEC-003 | `especificada` |
| 6 | SPEC-006 | Alertas de atenção e risco | SPEC-001, SPEC-003, SPEC-004, SPEC-005 | `especificada` |
| 7 | SPEC-007 | Dashboard acadêmico do estudante | SPEC-001…SPEC-006 | `especificada` |
| 8 | SPEC-008 | Dashboard do professor e plano de recuperação | SPEC-001…SPEC-006 | `especificada` |
| 9 | SPEC-009 | Relatórios acadêmicos autorizados | SPEC-001…SPEC-008 | `especificada` |

Todas as Specs têm texto completo abaixo. A SPEC-001 está `implementada` e as SPEC-002 e SPEC-003 foram aprovadas em 2026-10-09 (hoje `em implementação`); as demais estão `especificadas` e aguardam aprovação humana antes de qualquer código.

---

# SPEC-001 — Autenticação, perfis e autorização por escopo

**Status:** `implementada`

INV-001-04 coberto por teste automatizado desde 2026-10-09 (junto com a SPEC-002); ver `docs/verificacao/SPEC-001.md`.

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-001 |
| **Nome** | Autenticação, perfis e autorização por escopo |
| **Objetivo** | Permitir que Estudante, Professor e Coordenador se autentiquem e acessem somente as funcionalidades e dados autorizados ao seu perfil e escopo de responsabilidade. |
| **Valor** | Entrada segura no sistema e proteção consistente dos dados acadêmicos; sem esta Spec nenhuma outra funcionalidade tem fronteira de acesso. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-01, RF-02 |
| **RB** | RB-01, RB-02, RB-03, RB-04 |
| **RNF** | RNF-02, RNF-03, RNF-05; RNF-04 na tela de login |
| **UC / fluxo** | UC-01 — Autenticar-se (pré-condição transversal dos demais casos de uso) |
| **Entidades** | `Usuario` (perfil), vínculos `Usuario`-`Turma` usados para delimitar escopo |
| **Drivers** | DA-01, DA-06, DA-07 |
| **ADRs** | ADR-001, ADR-003 |
| **OPEN relacionados** | OPEN-013 (fechada); OPEN-006 fechado em ADR-004 |

## 3. Escopo

**Incluído**
- Login de usuário com e-mail e senha. Nesta Spec as contas são criadas por script de carga inicial (seed); o cadastro por perfil autorizado fica para a SPEC-002 (OPEN-013).
- Atribuição de exatamente um perfil (Estudante, Professor ou Coordenador) a cada usuário.
- Bloqueio de acesso a funcionalidades não autorizadas ao perfil do usuário.
- Criação de sessão autenticada após login bem-sucedido.

**Fora do escopo**
- Recuperação de senha por e-mail (sem RF definido para isso).
- Login social / OAuth (não mencionado na baseline).

## 4. Dependências

Nenhuma (é a primeira Spec da ordem). Estabelece a base de identidade usada por todas as demais.

## 5. Comportamento esperado

**Pré-condições:** usuário possui cadastro ativo.

**Fluxo principal:**
1. Usuário informa e-mail e senha.
2. Sistema valida as credenciais contra o cadastro.
3. Sistema cria uma sessão vinculada ao perfil do usuário.
4. Sistema redireciona ao painel correspondente ao perfil.

**Exceções:**
- Credenciais inválidas: sistema recusa o acesso e exibe mensagem de erro genérica (sem indicar se o e-mail existe).
- Usuário tenta função fora do seu perfil: sistema nega o acesso (RB-01, RF-02).

**Pós-condições de sucesso:** sessão ativa vinculada ao perfil correto.
**Pós-condição de falha:** nenhuma sessão criada; estado anterior preservado.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-001-01 | Todo usuário cadastrado possui exatamente um perfil dentre Estudante, Professor ou Coordenador (RB-01). |
| INV-001-02 | Nenhuma senha é armazenada em texto puro, em nenhuma circunstância (RNF-02). |
| INV-001-03 | Toda verificação de autorização ocorre no servidor, nunca apenas na interface (DA-01, ADR-003). |
| INV-001-04 | Um Estudante nunca recebe, em nenhuma resposta do sistema, dados acadêmicos de outro estudante (RB-02, RNF-05). |

## 7. Modelo de domínio envolvido

- `Usuario`: `id`, `nome`, `email`, `senhaHash`, `perfil` {Estudante, Professor, Coordenador}.
- Vínculos `Usuario`-`Turma` (leciona / matricula / responsável) usados para delimitar o escopo de autorização das demais Specs.

## 8. Impacto arquitetural

- Arquitetura em camadas (ADR-001): autenticação na camada de apresentação/API, regra de autorização na camada de domínio.
- Filtro de escopo dentro da própria query de acesso a dados, negando por padrão (ADR-003).
- Senha com hash (bcrypt/argon2), nunca texto puro (DA-06).

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| Autenticar | e-mail, senha | sessão criada + perfil | credenciais inválidas |
| Verificar autorização | sessão + recurso solicitado | acesso liberado | acesso negado |

Mecanismo de sessão: JWT assinado no servidor, entregue em cookie httpOnly (ADR-004).

## 10. RNFs aplicáveis

| RNF | Como verificar nesta Spec |
|---|---|
| RNF-02 | Senha no banco é hash, nunca igual ao texto informado |
| RNF-03 | Pedido sem sessão válida ou com perfil errado é recusado no servidor |
| RNF-05 | Estudante autenticado nunca recebe dados de outro estudante |
| RNF-04 | Tela de login utilizável em desktop e mobile |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-001-01 | Usuário com cadastro ativo e perfil Estudante | Submete e-mail e senha corretos | Sistema cria a sessão e redireciona ao painel do Estudante |
| AC-001-02 | Usuário tentando autenticar-se | A senha informada está incorreta | Sistema recusa o acesso e não cria sessão |
| AC-001-03 | Usuário autenticado com perfil Estudante | Tenta acessar função exclusiva de Coordenador | Sistema nega o acesso |
| AC-001-04 | Qualquer cadastro de usuário | Registro é inspecionado no banco | O valor armazenado é um hash, nunca a senha original |

## 12. Casos de teste derivados

1. Login bem-sucedido por perfil (Estudante, Professor, Coordenador).
2. Login com senha incorreta não cria sessão.
3. Acesso a função fora do perfil é negado no servidor (não só escondido na UI).
4. Senha persistida nunca é igual ao texto original.

## 13. Questões em aberto

OPEN-013 (fechada): sem cadastro público nesta versão. O mecanismo de autenticação foi decidido em ADR-004 (JWT em cookie httpOnly), fechando o OPEN-006.

Levantadas na implementação (decisão provisória do humano, 2026-10-09): OPEN-014 (cadastro ativo sem atributo no modelo) e OPEN-015 (duração da sessão: 8 h).

## 14. Definition of Done

Critérios AC-001-* implementados; INV-001-* preservados; testes da seção 12 aprovados; RNFs da seção 10 verificados; sem divergência conhecida em relação a esta Spec; qualquer divergência de baseline registrada e decidida por humano.

---

# SPEC-002 — Estrutura acadêmica e vínculos de turma

**Status:** `em implementação`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-002 |
| **Nome** | Estrutura acadêmica e vínculos de turma |
| **Objetivo** | Cadastrar estudantes, disciplinas e turmas e manter os vínculos entre professores, estudantes e coordenadores. |
| **Valor** | Base acadêmica consistente para registrar e consultar o acompanhamento. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-03, RF-04 |
| **RB** | RB-01 e vínculos do modelo de domínio |
| **RNF** | RNF-03, RNF-05; RNF-04 nas telas de cadastro |
| **UC / fluxo** | Fluxos de cadastro descritos na seção 5 (sem UC próprio) |
| **Entidades** | `Usuario`, `Disciplina`, `Turma` |
| **Drivers** | AD-01, AD-04 |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | #8, #9 |
| **OPEN relacionados** | OPEN-001 e OPEN-009 (fechadas em 2026-10-09) |

## 3. Escopo

**Incluído**
- Cadastro de estudante e vínculo à turma correspondente.
- Cadastro de disciplina e de turma.
- Associação da turma a um professor responsável, a estudantes (matrícula) e, opcionalmente, a um coordenador.
- Matrícula de estudante já cadastrado em outra turma (vínculo N:M).
- Consulta de turmas respeitando o escopo de cada perfil (INV-002-06).

**Fora do escopo**
- Edição e exclusão de cadastros (sem RF definido).
- Avaliações (SPEC-004), atividades e frequência (SPEC-005).
- Cadastro de contas de Professor e Coordenador (sem RF; continuam por seed, OPEN-001).
- Troca de senha do estudante (sem RF, OPEN-009).

## 4. Dependências

SPEC-001.

## 5. Comportamento esperado

**Pré-condições:** usuário autenticado com perfil Coordenador (OPEN-001). Estudantes só são cadastrados ou matriculados em turmas sob a responsabilidade desse coordenador; quem cria a turma passa a ser o coordenador responsável por ela.

**Fluxo principal:**
1. Coordenador informa nome, e-mail, senha inicial (mínimo de 8 caracteres) e a turma do estudante (OPEN-009).
2. Sistema valida que todos os dados obrigatórios foram informados.
3. Sistema armazena o cadastro e vincula o estudante à turma correspondente.

**Alternativo:** cadastro de disciplina ou turma armazena as informações e permite associação com professores e estudantes (RF-04).

**Exceções:**
- Dado obrigatório ausente: sistema impede o cadastro e indica o campo pendente (RF-03).
- E-mail já cadastrado: sistema impede o cadastro (OPEN-009).
- Turma fora da responsabilidade do coordenador, ou professor inexistente: sistema recusa a operação.

**Pós-condições de sucesso:** registro persistido com seus vínculos.
**Pós-condição de falha:** nada é persistido parcialmente.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-002-01 | Todo estudante cadastrado é vinculado à turma correspondente (RF-03). |
| INV-002-02 | Toda turma pertence a exatamente 1 disciplina e 1 professor responsável. |
| INV-002-03 | Uma turma tem de 0 a 1 coordenador responsável; um coordenador pode ser responsável por 0 a N turmas. |
| INV-002-04 | A matrícula é N:M entre estudantes e turmas. |
| INV-002-05 | Cadastro com campo obrigatório ausente não persiste nada. |
| INV-002-06 | Cada consulta de cadastro respeita o escopo do perfil (ADR-003). |

## 7. Modelo de domínio envolvido

`Usuario` (perfil Estudante, Professor, Coordenador), `Disciplina`, `Turma` e as associações leciona, matrícula e responsável.

## 8. Impacto arquitetural

Chaves estrangeiras e constraints refletem as multiplicidades do modelo (ADR-002). O schema do Prisma deriva de `docs/modelo-dominio.md`.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| Cadastrar estudante | nome, e-mail, senha inicial, turma (OPEN-009) | estudante vinculado à turma | campo obrigatório ausente, e-mail já cadastrado, turma fora do escopo |
| Cadastrar disciplina | nome, carga horária | disciplina criada | campo ausente |
| Cadastrar turma | nome, período, disciplina, professor | turma criada, com o coordenador autor como responsável | campo ausente, vínculo inexistente |
| Matricular estudante existente | turma, e-mail do estudante | matrícula criada | estudante inexistente, turma fora do escopo |
| Consultar turmas | sessão | turmas do escopo do perfil, com disciplina e professor | sem sessão |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-03 | Cadastro por perfil não autorizado é recusado no servidor |
| RNF-05 | Consulta de estudantes devolve só os do escopo do usuário |
| RNF-04 | Telas de cadastro utilizáveis em desktop e mobile |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-002-01 | Usuário autorizado e dados completos | Cadastra um estudante | Estudante armazenado e vinculado à turma |
| AC-002-02 | Usuário autorizado | Cadastra estudante sem campo obrigatório | Cadastro impedido e campo pendente indicado |
| AC-002-03 | Usuário autorizado | Cadastra disciplina e turma | Informações armazenadas e associação com professor e estudantes disponível |
| AC-002-04 | Usuário sem permissão | Tenta cadastrar | Acesso negado no servidor |
| AC-002-05 | Turma já criada | Consulta-se a turma | Ela pertence a exatamente 1 disciplina e 1 professor |

## 12. Casos de teste derivados

1. Cadastro feliz de estudante, disciplina e turma.
2. Campo obrigatório ausente não persiste nada.
3. Violação de FK (turma sem disciplina) é recusada pelo banco.
4. Perfil sem permissão é negado.

## 13. Questões em aberto

Nenhuma. OPEN-001 (quem pode cadastrar) e OPEN-009 (campos obrigatórios e credencial inicial) foram fechadas em 2026-10-09; ver `decisoes-em-aberto.md`.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-003 — Cálculo da situação acadêmica e indicador persistido

**Status:** `em implementação`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-003 |
| **Nome** | Cálculo da situação acadêmica e indicador persistido |
| **Objetivo** | Calcular média e classificação Normal/Atenção/Risco e manter um indicador vigente por estudante e turma. |
| **Valor** | Decisão acadêmica única, verificável e reutilizada por todas as funcionalidades de acompanhamento. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-06, RF-11 |
| **RB** | RB-05, RB-06, RB-07, RB-09, RB-10 |
| **RNF** | RNF-01 nas leituras; RNF-03 e RNF-05 quando consultado |
| **UC / fluxo** | UC-02; inclusão "Recalcular Indicador Acadêmico" |
| **Entidades** | `Avaliacao` (só a estrutura: turma e peso), `Nota`, `Frequencia`, `IndicadorAcademico`, `Turma` |
| **Drivers** | AD-02, AD-03, AD-05 |
| **ADRs** | ADR-001, ADR-002 |
| **Issues** | #11, #19 |
| **OPEN relacionados** | OPEN-002 (fechada em 2026-10-09) |

## 3. Escopo

**Incluído**
- Regra de classificação como função pura no domínio.
- Recálculo síncrono sempre que nota, frequência ou atividade relevante mudar.
- Persistência do indicador vigente (um por estudante e turma).
- Estrutura de dados de `Avaliacao`, `Nota` e `Frequencia` necessária ao cálculo (a média depende dos pesos das avaliações).
- Consulta de indicadores filtrada pelo escopo do perfil (RNF-03, RNF-05).

**Fora do escopo**
- Telas e alertas (SPEC-006, SPEC-007).
- Telas e rotas de registro de avaliação, nota e frequência (SPEC-004 e SPEC-005); elas chamam o recálculo desta Spec na mesma transação da escrita.

## 4. Dependências

SPEC-002.

## 5. Comportamento esperado

**Pré-condições:** estudante matriculado na turma.

**Fluxo principal:**
1. Uma nota, frequência ou atividade relevante é registrada ou alterada.
2. Sistema recalcula a média do estudante na turma: média ponderada pelos pesos das avaliações que já têm nota (OPEN-002).
3. Sistema classifica a situação: Risco se frequência < 75% ou média < 5,0; Atenção se média entre 5,0 e menos de 6,0 com frequência ≥ 75%; Normal se média ≥ 6,0 com frequência ≥ 75%.
4. Sistema atualiza o indicador vigente e o instante de atualização.

**Exceções:**
- Dados incompletos (OPEN-002): sem nota, só a frequência classifica; sem frequência, só a média classifica; sem nenhum dos dois, a situação é Normal.
- Valor fora da faixa (nota fora de 0–10, frequência fora de 0–100%, peso menor ou igual a zero): o cálculo é recusado e o indicador anterior é preservado.
- Estudante não matriculado na turma: o recálculo é recusado.

**Pós-condições de sucesso:** indicador vigente reflete os dados mais recentes.
**Pós-condição de falha:** indicador anterior preservado.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-003-01 | Frequência abaixo de 75% classifica Risco independentemente da média (RB-05). |
| INV-003-02 | Média abaixo de 5,0 classifica Risco (RB-07). |
| INV-003-03 | Atenção exige média ≥ 5,0 e < 6,0 com frequência ≥ 75% (RB-06). |
| INV-003-04 | A situação é sempre exatamente uma entre Normal, Atenção e Risco (RB-09). |
| INV-003-05 | Existe exatamente 1 indicador vigente por estudante e turma. |
| INV-003-06 | A classificação existe em um único lugar do código (domínio), nunca em controller ou trigger (DA-02). |

## 7. Modelo de domínio envolvido

`IndicadorAcademico`: `id`, `media`, `frequenciaAtual`, `situacao`, `atualizadoEm`; ligado a `Usuario` (estudante) e `Turma`.

## 8. Impacto arquitetural

Função pura na camada de domínio chamada nas escritas (DA-02). Indicador persistido, não recalculado a cada leitura (DA-05). Índice composto em (estudante, turma).

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| Classificar | média, frequência | situação | dados inválidos |
| Recalcular indicador | estudante, turma | indicador atualizado | estudante não matriculado, dados fora da faixa |
| Consultar indicadores | sessão | indicadores do escopo do perfil | sem sessão |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-01 | Leitura do indicador dentro de 3 s (P95) |
| RNF-03, RNF-05 | Indicador só é lido por quem tem escopo |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-003-01 | Média 6,0 e frequência 75% | Classifica | Normal |
| AC-003-02 | Média 5,0 e frequência 80% | Classifica | Atenção |
| AC-003-03 | Média 5,95 e frequência 80% | Classifica | Atenção (limite é 6,0 exclusivo) |
| AC-003-04 | Média 4,9 e frequência 90% | Classifica | Risco |
| AC-003-05 | Média 8,0 e frequência 74,9% | Classifica | Risco independentemente da média |
| AC-003-06 | Média 5,0 e frequência exatamente 75% | Classifica | Atenção (75% não é Risco) |
| AC-003-07 | Indicador vigente existente | Uma nota é alterada | Indicador recalculado e instante de atualização renovado |

## 12. Casos de teste derivados

1. Tabela de limites: 4,99, 5,0, 5,95, 6,0, 74,9%, 75%.
2. Recálculo ao alterar nota e ao alterar frequência.
3. Um único indicador vigente por estudante e turma.
4. A função de classificação roda sem banco.

## 13. Questões em aberto

Nenhuma. OPEN-002 (fórmula da média, faixa válida, avaliações sem nota) foi fechada em 2026-10-09; ver `decisoes-em-aberto.md`.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14), mais teste de limites da tabela 12.1.

---

# SPEC-004 — Registro de avaliações, notas e médias

**Status:** `especificada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-004 |
| **Nome** | Registro de avaliações, notas e médias |
| **Objetivo** | Permitir ao professor registrar ou alterar a nota de um estudante em uma avaliação e atualizar média e indicador. |
| **Valor** | Lançamento confiável de desempenho por avaliação. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-05, RF-06, RF-11 |
| **RB** | RB-03, RB-05, RB-06, RB-07, RB-09, RB-10 |
| **RNF** | RNF-03, RNF-05; RNF-04 na interface |
| **UC / fluxo** | UC-03, incluindo alteração de nota |
| **Entidades** | `Usuario` (professor), `Turma`, `Disciplina`, `Avaliacao`, `Nota`, `IndicadorAcademico` |
| **Drivers** | AD-01, AD-02, AD-04 |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | #10, #11, #19 |
| **OPEN relacionados** | OPEN-001, OPEN-002 |

## 3. Escopo

**Incluído:** lançar nota, alterar nota já lançada, recalcular média e indicador (via SPEC-003).

**Fora do escopo:** cadastro de avaliação (quem cria e como: OPEN-001), faixa de nota e fórmula da média (OPEN-002).

## 4. Dependências

SPEC-001, SPEC-002, SPEC-003.

## 5. Comportamento esperado

**Pré-condições:** professor autenticado e responsável pela turma; avaliação cadastrada.

**Fluxo principal:**
1. Professor seleciona turma, avaliação e estudante.
2. Professor informa o valor da nota.
3. Sistema valida o valor.
4. Sistema associa a nota ao estudante, à avaliação e à turma/disciplina.
5. Sistema recalcula a média e atualiza o indicador.

**Alternativo:** alteração de nota já lançada sobrescreve o valor e repete os passos 3 a 5.

**Exceções:** valor inválido: sistema rejeita o registro e solicita correção.

**Pós-condições de sucesso:** nota registrada; média e indicador atualizados.
**Pós-condição de falha:** nota anterior preservada.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-004-01 | Cada nota pertence a exatamente 1 avaliação e 1 estudante. |
| INV-004-02 | Só o professor responsável pela turma lança ou altera nota dessa turma (RB-03). |
| INV-004-03 | Toda escrita de nota recalcula o indicador na mesma operação (RB-10). |
| INV-004-04 | Valor inválido nunca é persistido. |

## 7. Modelo de domínio envolvido

`Avaliacao` (turma, peso, data), `Nota` (valor, dataRegistro), `IndicadorAcademico`.

## 8. Impacto arquitetural

Escrita da nota e recálculo do indicador na mesma transação (consistência, AD-02).

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| Registrar nota | turma, avaliação, estudante, valor | nota registrada, indicador atualizado | valor inválido, sem permissão |
| Alterar nota | nota, novo valor | nota atualizada, indicador recalculado | valor inválido, sem permissão |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-03 | Professor de outra turma é recusado no servidor |
| RNF-05 | Dados de notas só para o escopo autorizado |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-004-01 | Professor responsável e avaliação cadastrada | Lança nota válida | Nota associada ao estudante e à avaliação; média e indicador atualizados |
| AC-004-02 | Professor responsável | Lança nota inválida | Registro rejeitado e correção solicitada |
| AC-004-03 | Nota já lançada | Professor altera o valor | Valor sobrescrito e média recalculada |
| AC-004-04 | Professor de outra turma | Tenta lançar nota | Acesso negado |
| AC-004-05 | Estudante autenticado | Tenta lançar nota | Acesso negado |

## 12. Casos de teste derivados

1. Lançamento feliz e recálculo.
2. Valor fora da faixa (depende de OPEN-002).
3. Alteração de nota recalcula indicador.
4. Escopo do professor e negação ao estudante.

## 13. Questões em aberto

OPEN-001, OPEN-002.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-005 — Frequência, atividades e entregas atrasadas

**Status:** `especificada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-005 |
| **Nome** | Frequência, atividades e entregas atrasadas |
| **Objetivo** | Registrar frequência e atividades e classificar como atrasada a entrega não registrada após o prazo. |
| **Valor** | Acompanhamento de presença e prazos que alimenta a situação acadêmica. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-07, RF-08, RF-09, RF-11 |
| **RB** | RB-03, RB-05, RB-08, RB-09, RB-10 |
| **RNF** | RNF-03, RNF-05; RNF-04 nas telas |
| **UC / fluxo** | Extensão de atividade atrasada do UC-02; fluxos de frequência e entrega ainda não documentados |
| **Entidades** | `Turma`, `Frequencia`, `Atividade`, `Entrega`, `IndicadorAcademico` |
| **Drivers** | AD-01, AD-02, AD-04 |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | #15, #16, #17 |
| **OPEN relacionados** | OPEN-001, OPEN-003, OPEN-010, OPEN-011 |

## 3. Escopo

**Incluído:** registro e alteração de frequência; cadastro de atividade; marcação de entrega como Atrasada; atualização do indicador.

**Fora do escopo:** quem registra a entrega e quando (OPEN-003); como a marcação é disparada (OPEN-010); histórico e evolução (OPEN-011).

## 4. Dependências

SPEC-001, SPEC-002, SPEC-003.

## 5. Comportamento esperado

**Pré-condições:** professor autenticado e responsável pela turma.

**Fluxo principal (frequência):**
1. Professor registra ou altera a frequência de um estudante.
2. Sistema atualiza o percentual e reflete a mudança no histórico acadêmico.
3. Sistema recalcula o indicador (SPEC-003).

**Fluxo (atividade):** professor cadastra atividade com descrição, prazo e disciplina vinculada; sistema registra.

**Fluxo (atraso):** quando o prazo termina sem entrega registrada, sistema marca a entrega como Atrasada para aquele estudante e indica a condição a ele e ao professor.

**Exceções:** dados da atividade incompletos: sistema impede o cadastro (RF-08).

**Pós-condições de sucesso:** frequência, atividade ou status de entrega atualizados e indicador recalculado.
**Pós-condição de falha:** estado anterior preservado.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-005-01 | Frequência abaixo de 75% leva a Risco (RB-05). |
| INV-005-02 | Atividade sem entrega após o prazo é Atrasada (RB-08). |
| INV-005-03 | Cada atividade gera no máximo 1 entrega por estudante. |
| INV-005-04 | Toda alteração de frequência recalcula o indicador (RB-10). |
| INV-005-05 | Só o professor responsável pela turma registra frequência e atividades dela (RB-03). |

## 7. Modelo de domínio envolvido

`Frequencia` (percentual, atualizadaEm), `Atividade` (descrição, prazo), `Entrega` (dataEntrega, status NoPrazo, Atrasada ou Pendente).

## 8. Impacto arquitetural

A marcação de atraso depende do mecanismo escolhido em OPEN-010 (rotina agendada ou derivação na leitura). Até lá, não implementar essa parte.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| Registrar frequência | turma, estudante, percentual | frequência atualizada, indicador recalculado | valor inválido, sem permissão |
| Cadastrar atividade | descrição, prazo, turma | atividade registrada | dados incompletos |
| Marcar atraso | atividade, estudante | entrega Atrasada | entrega já registrada |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-03 | Professor de outra turma é recusado |
| RNF-05 | Estudante só vê as próprias entregas |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-005-01 | Professor responsável | Registra frequência de um estudante | Percentual atualizado e indicador recalculado |
| AC-005-02 | Professor responsável | Cadastra atividade completa | Atividade registrada |
| AC-005-03 | Professor responsável | Cadastra atividade sem prazo | Cadastro impedido |
| AC-005-04 | Prazo encerrado e sem entrega | O sistema avalia a atividade | Entrega marcada Atrasada, visível ao estudante e ao professor |
| AC-005-05 | Entrega registrada dentro do prazo | O sistema avalia a atividade | Entrega não é marcada Atrasada |

## 12. Casos de teste derivados

1. Frequência de 74,9% leva a Risco, 75% não.
2. Atividade incompleta é recusada.
3. Marcação de atraso nos dois lados do prazo.
4. Escopo do professor.

## 13. Questões em aberto

OPEN-001, OPEN-003, OPEN-010, OPEN-011.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-006 — Alertas de atenção e risco

**Status:** `especificada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-006 |
| **Nome** | Alertas de atenção e risco |
| **Objetivo** | Apresentar alerta ao estudante e ao professor responsável quando o indicador atingir Atenção ou Risco. |
| **Valor** | Sinalização acionável de dificuldades acadêmicas. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-12 |
| **RB** | RB-03, RB-04, RB-09, RB-10 |
| **RNF** | RNF-01, RNF-03, RNF-05; RNF-04 na apresentação |
| **UC / fluxo** | Inclusão "Emitir Alerta de Atenção/Risco"; extensão 1 do UC-02 |
| **Entidades** | `IndicadorAcademico`, `Usuario`, `Turma` |
| **Drivers** | AD-01, AD-02, AD-05 |
| **ADRs** | ADR-001, ADR-003 |
| **Issues** | #20 |
| **OPEN relacionados** | OPEN-004 |

## 3. Escopo

**Incluído:** exibir alerta quando a situação for Atenção ou Risco, ao estudante e ao professor responsável.

**Fora do escopo:** canal de envio (e-mail, notificação), persistência e deduplicação (OPEN-004).

## 4. Dependências

SPEC-001, SPEC-003, SPEC-004, SPEC-005.

## 5. Comportamento esperado

**Pré-condições:** indicador vigente existente.

**Fluxo principal:**
1. O indicador de um estudante é atualizado.
2. Se a situação for Atenção ou Risco, o sistema apresenta o alerta ao estudante e ao professor responsável pela turma.
3. Se for Normal, nenhum alerta é apresentado.

**Exceções:** nenhuma específica; falha ao exibir não altera o indicador.

**Pós-condições de sucesso:** alerta visível para os destinatários corretos.
**Pós-condição de falha:** indicador preservado.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-006-01 | Só existe alerta para situação Atenção ou Risco (RB-09). |
| INV-006-02 | O alerta reflete o indicador atual, nunca um valor desatualizado. |
| INV-006-03 | O alerta é visível apenas ao próprio estudante e ao professor responsável (RB-02, RB-03). |

## 7. Modelo de domínio envolvido

`IndicadorAcademico.situacao`; vínculo professor responsável pela `Turma`.

## 8. Impacto arquitetural

O alerta é derivado do indicador persistido (DA-05); o canal fica fora até OPEN-004.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| Consultar alertas do estudante | estudante autenticado | lista de alertas | sem permissão |
| Consultar alertas da turma | professor responsável | lista de alertas dos estudantes da turma | sem permissão |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-01 | Consulta de alertas dentro de 3 s |
| RNF-03, RNF-05 | Alertas só aparecem para os destinatários corretos |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-006-01 | Indicador passa a Atenção | O estudante e o professor consultam | Alerta de Atenção visível a ambos |
| AC-006-02 | Indicador passa a Risco | O estudante e o professor consultam | Alerta de Risco visível a ambos |
| AC-006-03 | Indicador Normal | O estudante consulta | Nenhum alerta |
| AC-006-04 | Alerta de um estudante | Outro estudante consulta | Não vê o alerta |
| AC-006-05 | Estudante que sai de Risco | O indicador é recalculado | O alerta de Risco deixa de ser exibido |

## 12. Casos de teste derivados

1. Alerta por situação (Normal, Atenção, Risco).
2. Escopo do alerta (estudante, professor responsável, outros).
3. Alerta some quando a situação melhora.

## 13. Questões em aberto

OPEN-004.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-007 — Dashboard acadêmico do estudante

**Status:** `especificada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-007 |
| **Nome** | Dashboard acadêmico do estudante |
| **Objetivo** | Consolidar notas, médias, frequência, atividades, evolução, situação e alertas das turmas do estudante autenticado. |
| **Valor** | Visão individual atualizada para acompanhamento e priorização. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-09, RF-10, RF-11, RF-12 |
| **RB** | RB-02, RB-05, RB-06, RB-07, RB-08, RB-09, RB-10 |
| **RNF** | RNF-01, RNF-03, RNF-04, RNF-05 |
| **UC / fluxo** | UC-02, incluindo estudante sem turmas, alertas e atrasos |
| **Entidades** | `Usuario`, `Turma`, `Disciplina`, `Avaliacao`, `Nota`, `Frequencia`, `Atividade`, `Entrega`, `IndicadorAcademico` |
| **Drivers** | AD-01, AD-02, AD-05 |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | #18, #17, #19, #20 |
| **OPEN relacionados** | OPEN-011 |

## 3. Escopo

**Incluído:** painel consolidado do estudante autenticado, com destaque de Atenção, Risco e atividades atrasadas.

**Fora do escopo:** dados de outros estudantes; definição de "evolução" (OPEN-011).

## 4. Dependências

SPEC-001 a SPEC-006.

## 5. Comportamento esperado

**Pré-condições:** estudante autenticado (UC-01).

**Fluxo principal:**
1. Estudante acessa o dashboard.
2. Sistema consulta notas, médias, frequência e atividades das turmas em que está matriculado.
3. Sistema recupera o indicador vigente de cada turma.
4. Sistema apresenta o painel consolidado com a situação (Normal, Atenção ou Risco).

**Extensão 1:** situação Atenção ou Risco: destaque da disciplina afetada e alerta.
**Extensão 2:** atividade sem entrega após o prazo: sinalizada como atrasada.

**Exceções:** estudante sem turmas: painel vazio com orientação para procurar a coordenação.

**Pós-condições de sucesso:** estudante visualiza sua situação acadêmica atualizada.
**Pós-condição de falha:** nenhum dado de terceiros é exibido.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-007-01 | O painel mostra apenas dados do próprio estudante (RB-02). |
| INV-007-02 | A situação exibida é a do indicador vigente (RB-09, RB-10). |
| INV-007-03 | O escopo é aplicado dentro da consulta (ADR-003). |

## 7. Modelo de domínio envolvido

Leitura de todas as entidades acadêmicas filtradas pelo estudante autenticado.

## 8. Impacto arquitetural

Consulta agregada com índice composto, usando o indicador persistido para cumprir RNF-01 (DA-05).

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| Consultar dashboard | estudante autenticado | painel consolidado | sem sessão |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-01 | Carga do dashboard em até 3 s (P95) |
| RNF-03, RNF-05 | Estudante nunca recebe dados de outro |
| RNF-04 | Painel utilizável em desktop, tablet e smartphone |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-007-01 | Estudante com turmas | Acessa o dashboard | Vê notas, médias, frequência, atividades e situação |
| AC-007-02 | Situação Atenção ou Risco | Acessa o dashboard | Disciplina afetada destacada e alerta exibido |
| AC-007-03 | Atividade sem entrega após o prazo | Acessa o dashboard | Atividade sinalizada como atrasada |
| AC-007-04 | Estudante sem turmas | Acessa o dashboard | Painel vazio com orientação |
| AC-007-05 | Dois estudantes com dados diferentes | Cada um acessa | Cada um vê só os próprios dados |
| AC-007-06 | Dashboard com dados de amostra | Medição de carga | Resposta em até 3 s (P95) |

## 12. Casos de teste derivados

1. Painel com dados completos.
2. Destaques de Atenção, Risco e atraso.
3. Estudante sem turmas.
4. Isolamento entre estudantes.
5. Medição de tempo de resposta.

## 13. Questões em aberto

OPEN-011 (o que é "evolução" e de onde vem, já que o modelo guarda só os valores vigentes).

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-008 — Dashboard do professor e plano de recuperação

**Status:** `especificada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-008 |
| **Nome** | Dashboard do professor e plano de recuperação |
| **Objetivo** | Permitir ao professor analisar os estudantes de suas turmas e criar e acompanhar plano de recuperação para estudantes em Risco. |
| **Valor** | Intervenção pedagógica baseada em indicadores e progresso de atividades. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-13, RF-14 |
| **RB** | RB-03, RB-09, RB-11, RB-12 |
| **RNF** | RNF-01, RNF-03, RNF-04, RNF-05 |
| **UC / fluxo** | Dashboard do professor; UC-04, incluindo progresso |
| **Entidades** | `Usuario`, `Turma`, `IndicadorAcademico`, `PlanoRecuperacao`, `Atividade` |
| **Drivers** | AD-01, AD-02, AD-04, AD-05 |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | #21, #22 |
| **OPEN relacionados** | OPEN-003, OPEN-012 |

## 3. Escopo

**Incluído:** indicadores dos estudantes da turma (com contagem Normal, Atenção e Risco); criação de plano para estudante em Risco; cálculo de progresso do plano.

**Fora do escopo:** quem marca a conclusão de atividade do plano (OPEN-003); o que acontece com o plano se o estudante sair de Risco (OPEN-012).

## 4. Dependências

SPEC-001 a SPEC-006; SPEC-007 como padrão de consulta consolidada.

## 5. Comportamento esperado

**Pré-condições:** professor autenticado e responsável pela turma.

**Fluxo principal (dashboard):** professor acessa uma turma; sistema apresenta os indicadores apenas dos estudantes dessa turma.

**Fluxo principal (plano):**
1. Professor acessa o dashboard da turma e seleciona um estudante em Risco.
2. Professor define as atividades previstas no plano.
3. Sistema associa o plano ao estudante e ao professor responsável.
4. Sistema inicializa o progresso em 0%.

**Alternativo:** a cada atividade concluída, o sistema recalcula o progresso (concluídas dividido pelo total previsto).

**Exceções:** estudante fora de Risco: sistema impede a criação do plano e explica o motivo.

**Pós-condições de sucesso:** plano vinculado ao estudante e a exatamente um professor.
**Pós-condição de falha:** nenhum plano criado.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-008-01 | Só estudante em Risco recebe plano de recuperação (RB-11). |
| INV-008-02 | Todo plano tem exatamente 1 professor responsável (RB-11). |
| INV-008-03 | Progresso é concluídas dividido por previstas, e o plano tem de 1 a N atividades (RB-12). |
| INV-008-04 | O professor só vê estudantes das turmas que leciona (RB-03). |

## 7. Modelo de domínio envolvido

`PlanoRecuperacao` (progresso, criadoEm) ligado a estudante, professor e atividades previstas.

## 8. Impacto arquitetural

Cálculo de progresso no domínio, testável sem banco (DA-07). Escopo na query (ADR-003).

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| Consultar turma | professor responsável, turma | indicadores e contagem por situação | sem permissão |
| Criar plano | estudante, atividades previstas | plano criado com progresso 0% | estudante fora de Risco, sem permissão |
| Atualizar progresso | plano, atividade concluída | progresso recalculado | atividade fora do plano |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-01 | Dashboard da turma em até 3 s |
| RNF-03, RNF-05 | Professor só acessa as turmas dele |
| RNF-04 | Telas utilizáveis em desktop e mobile |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-008-01 | Professor responsável por uma turma | Acessa a turma | Vê só os estudantes dela, com contagem Normal, Atenção e Risco |
| AC-008-02 | Estudante em Risco | Professor cria um plano | Plano associado ao estudante e ao professor, progresso 0% |
| AC-008-03 | Estudante em Normal ou Atenção | Professor tenta criar plano | Criação impedida com mensagem explicativa |
| AC-008-04 | Plano com 4 atividades previstas | 1 atividade é concluída | Progresso 25% |
| AC-008-05 | Professor de outra turma | Tenta acessar a turma ou criar plano | Acesso negado |

## 12. Casos de teste derivados

1. Cálculo de progresso (0%, 25%, 100%).
2. Criação só para Risco.
3. Plano com exatamente 1 professor.
4. Escopo do professor.

## 13. Questões em aberto

OPEN-003, OPEN-012.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-009 — Relatórios acadêmicos autorizados

**Status:** `especificada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-009 |
| **Nome** | Relatórios acadêmicos autorizados |
| **Objetivo** | Gerar informações consolidadas de desempenho, frequência e situação conforme o escopo do professor ou do coordenador. |
| **Valor** | Apoio à análise pedagógica e institucional sem exposição indevida de dados. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-15 |
| **RB** | RB-03, RB-04, RB-09, RB-10 |
| **RNF** | RNF-01, RNF-03, RNF-04, RNF-05 |
| **UC / fluxo** | UC-05 |
| **Entidades** | `Usuario`, `Turma`, `Disciplina`, `Nota`, `Frequencia`, `Atividade`, `IndicadorAcademico` |
| **Drivers** | AD-01, AD-02, AD-04, AD-05 |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | #2 |
| **OPEN relacionados** | OPEN-005 |

## 3. Escopo

**Incluído:** relatório consolidado de uma turma (professor) ou das turmas sob responsabilidade (coordenador).

**Fora do escopo:** formato de saída, filtros e granularidade (OPEN-005).

## 4. Dependências

SPEC-001 a SPEC-008.

## 5. Comportamento esperado

**Pré-condições:** usuário autenticado com perfil Professor ou Coordenador.

**Fluxo principal:**
1. Usuário solicita um relatório.
2. Sistema valida a autorização conforme o perfil (RB-03, RB-04).
3. Sistema consolida notas, frequência e situação das turmas autorizadas.
4. Sistema apresenta o relatório.

**Exceções:** turma fora do escopo: sistema bloqueia e exibe mensagem de negação.

**Pós-condições de sucesso:** relatório consolidado, respeitando o escopo.
**Pós-condição de falha:** nenhum dado fora do escopo é exposto.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-009-01 | Professor só obtém relatório das turmas que leciona (RB-03). |
| INV-009-02 | Coordenador só obtém relatório das turmas sob sua responsabilidade (RB-04). |
| INV-009-03 | Estudante não solicita relatórios. |
| INV-009-04 | O relatório usa os indicadores vigentes (RB-10). |

## 7. Modelo de domínio envolvido

Leitura de todas as entidades acadêmicas filtradas por escopo de professor ou coordenador.

## 8. Impacto arquitetural

Consulta agregada com filtro de escopo na própria query (ADR-003), apoiada no indicador persistido (DA-05).

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| Gerar relatório | usuário autenticado, turma(s) | informações consolidadas | sem permissão, turma fora do escopo |

Formato de saída em aberto (OPEN-005).

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-01 | Relatório em até 3 s para turmas de tamanho típico |
| RNF-03, RNF-05 | Nenhuma linha de turma fora do escopo aparece |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-009-01 | Professor responsável | Solicita relatório da própria turma | Relatório consolidado |
| AC-009-02 | Coordenador responsável por turmas | Solicita relatório | Relatório só dessas turmas |
| AC-009-03 | Professor | Solicita relatório de turma alheia | Bloqueado com mensagem de negação |
| AC-009-04 | Estudante | Tenta solicitar relatório | Acesso negado |
| AC-009-05 | Indicador alterado | Relatório é gerado em seguida | Reflete o indicador atual |

## 12. Casos de teste derivados

1. Relatório de professor e de coordenador.
2. Turma fora do escopo é bloqueada.
3. Negação ao estudante.
4. Relatório reflete a última alteração.

## 13. Questões em aberto

OPEN-005.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).
