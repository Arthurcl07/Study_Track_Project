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
| SPEC-004 aprovada para implementação (aprovada por Arthur) | `aprovada` | 2026-10-13 |
| SPEC-004: alteração de escopo — cadastro de avaliação pelo professor passa a fazer parte da Spec (OPEN-017); sem migração nova, tabelas da `spec_003_indicador` (OPEN-016) (aprovada por Arthur) | `aprovada` | 2026-10-13 |
| SPEC-005 aprovada, com OPEN-003 e OPEN-010 fechadas (decisão humana, Arthur); layout pendente de aprovação (OPEN-020) | `aprovada` | 2026-10-16 |
| Layout da SPEC-005 (frequência, atividades, entregas, minhas atividades) | `aprovado` (Arthur) | 2026-10-16 |
| SPEC-006 e SPEC-007 aprovadas, com OPEN-004 e OPEN-011 fechadas (decisão humana, Arthur); layout pendente de aprovação (OPEN-020) | `aprovada` | 2026-10-16 |
| Layout das SPEC-006 e SPEC-007 (alertas e painel do estudante) | `aprovado` (Arthur) | 2026-10-16 |
| SPEC-008 e SPEC-009 aprovadas, com OPEN-005, OPEN-012 e OPEN-021 fechadas (decisão humana, Arthur); layout pendente de aprovação (OPEN-020) | `aprovada` | 2026-10-16 |
| Layout das SPEC-008 e SPEC-009 (dashboard da turma, plano e relatório) | `aprovado` (Arthur) | 2026-10-16 |
| SPEC-005 a SPEC-009 marcadas como `implementadas`: testes e verificação em `docs/verificacao/`, PRs #43 a #46 aprovados por Luiz Eduardo e integrados em `development` | `implementada` | 2026-10-17 |
| SPEC-010 (Administrador e gestão de contas) incluída e aprovada, com OPEN-025 fechada (decisão humana, Arthur); novo RF-16, RB-13 e RB-14, RB-01 com 4 perfis; layout pendente de aprovação (OPEN-020) | `aprovada` | 2026-10-17 |
| Layout da SPEC-010 (contas) `aprovado` e escopo ampliado com a troca do professor da turma (RF-17), por decisão de Arthur | `aprovada` | 2026-10-17 |
| SPEC-002, SPEC-003, SPEC-004 e SPEC-010 marcadas como `implementadas`: PRs #48 e #53 (`development` → `main`) aprovados por Luiz Eduardo | `implementada` | 2026-10-19 |
| SPEC-011 a SPEC-014 incluídas e aprovadas, com OPEN-026 a OPEN-029 fechadas (decisão humana, Arthur); RF-18 a RF-21, RB-15 e RB-16; layout pendente de aprovação (OPEN-020) | `aprovada` | 2026-10-19 |

---

## Lista ordenada

| Ordem | ID | Nome | Dependências | Status |
|---|---|---|---|---|
| 1 | SPEC-001 | Autenticação, perfis e autorização por escopo | — | `implementada` |
| 2 | SPEC-002 | Estrutura acadêmica e vínculos de turma | SPEC-001 | `implementada` |
| 3 | SPEC-003 | Cálculo da situação acadêmica e indicador persistido | SPEC-002 | `implementada` |
| 4 | SPEC-004 | Registro de avaliações, notas e médias | SPEC-001, SPEC-002, SPEC-003 | `implementada` |
| 5 | SPEC-005 | Frequência, atividades e entregas atrasadas | SPEC-001, SPEC-002, SPEC-003 | `implementada` |
| 6 | SPEC-006 | Alertas de atenção e risco | SPEC-001, SPEC-003, SPEC-004, SPEC-005 | `implementada` |
| 7 | SPEC-007 | Dashboard acadêmico do estudante | SPEC-001…SPEC-006 | `implementada` |
| 8 | SPEC-008 | Dashboard do professor e plano de recuperação | SPEC-001…SPEC-006 | `implementada` |
| 9 | SPEC-009 | Relatórios acadêmicos autorizados | SPEC-001…SPEC-008 | `implementada` |
| 10 | SPEC-010 | Administrador e gestão de contas | SPEC-001, SPEC-002 | `implementada` |
| 11 | SPEC-011 | Senha própria e troca no primeiro acesso | SPEC-001, SPEC-010 | `aprovada` |
| 12 | SPEC-012 | Plano de recuperação visível ao estudante | SPEC-007, SPEC-008 | `aprovada` |
| 13 | SPEC-013 | Histórico de notas | SPEC-004 | `aprovada` |
| 14 | SPEC-014 | Painel do coordenador | SPEC-009 | `aprovada` |

Todas as Specs têm texto completo abaixo. As SPEC-001 a SPEC-010 estão `implementadas`: critérios, invariantes e testes atendidos (`docs/verificacao/`) e PR revisado por um colega (SPEC-002 a 004 e 010 pela revisão de Luiz Eduardo nos PRs #48 e #53, de `development` para `main`).

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
- Ação **Sair** na casca autenticada: `POST /api/auth/logout` apaga o cookie de sessão e volta ao login (OPEN-019, incluída em 2026-10-16).

**Fora do escopo**
- Recuperação de senha por e-mail (sem RF definido para isso).
- Login social / OAuth (não mencionado na baseline).

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-10-16 por Arthur; aplicado ao código como refatoração visual. Marca, cores e componentes: [`identidade-visual.md`](identidade-visual.md) (RNF-06). Protótipo: [`layout/prototipo.html`](layout/prototipo.html).

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Login | [prototipo.html#login](layout/prototipo.html#login) | [x] | [x] | Arthur | 2026-10-16 |
| Credencial inválida | [prototipo.html#login-erro](layout/prototipo.html#login-erro) | [x] | [x] | Arthur | 2026-10-16 |
| Acesso negado | [prototipo.html#acesso-negado](layout/prototipo.html#acesso-negado) | [x] | [x] | Arthur | 2026-10-16 |
| Casca autenticada com menu do perfil e **Sair** (OPEN-019) | todas as telas autenticadas do protótipo | [x] | [x] | Arthur | 2026-10-16 |

Checklist RNF: navegação consistente com menu do perfil e Sair (RNF-06); usável em computador, tablet e smartphone (RNF-04); situação sempre com cor, símbolo e rótulo (RNF-06).

## 4. Dependências

Nenhuma (é a primeira Spec da ordem). Estabelece a base de identidade usada por todas as demais.

## 5. Comportamento esperado

**Pré-condições:** usuário cadastrado com conta ativa (RB-14, OPEN-025).

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
| AC-001-01 | Usuário cadastrado com perfil Estudante | Submete e-mail e senha corretos | Sistema cria a sessão e redireciona ao painel do Estudante |
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

Levantadas na implementação e fechadas por Arthur em 2026-10-17: OPEN-014 (substituída pelo OPEN-025: conta ativa/inativa, desativação na SPEC-010) e OPEN-015 (sessão de 8 h, com saída manual pelo botão Sair, OPEN-019).

## 14. Definition of Done

Critérios AC-001-* implementados; INV-001-* preservados; testes da seção 12 aprovados; RNFs da seção 10 verificados; sem divergência conhecida em relação a esta Spec; qualquer divergência de baseline registrada e decidida por humano.

---

# SPEC-002 — Estrutura acadêmica e vínculos de turma

**Status:** `implementada`

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

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-10-16 por Arthur; aplicado ao código como refatoração visual. Marca, cores e componentes: [`identidade-visual.md`](identidade-visual.md) (RNF-06). Protótipo: [`layout/prototipo.html`](layout/prototipo.html).

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Estudante — Minhas turmas | [prototipo.html#estudante-inicio](layout/prototipo.html#estudante-inicio) | [x] | [x] | Arthur | 2026-10-16 |
| Professor — Turmas que leciono | [prototipo.html#professor-inicio](layout/prototipo.html#professor-inicio) | [x] | [x] | Arthur | 2026-10-16 |
| Coordenador — Início | [prototipo.html#coordenador-inicio](layout/prototipo.html#coordenador-inicio) | [x] | [x] | Arthur | 2026-10-16 |
| Coordenador — Disciplinas | [prototipo.html#coordenador-disciplinas](layout/prototipo.html#coordenador-disciplinas) | [x] | [x] | Arthur | 2026-10-16 |
| Coordenador — Turmas | [prototipo.html#coordenador-turmas](layout/prototipo.html#coordenador-turmas) | [x] | [x] | Arthur | 2026-10-16 |
| Coordenador — Detalhe da turma | [prototipo.html#coordenador-turma](layout/prototipo.html#coordenador-turma) | [x] | [x] | Arthur | 2026-10-16 |
| Campos pendentes no cadastro (AC-002-02) | [prototipo.html#cadastro-erro](layout/prototipo.html#cadastro-erro) | [x] | [x] | Arthur | 2026-10-16 |

Checklist RNF: navegação consistente com menu do perfil e Sair (RNF-06); usável em computador, tablet e smartphone (RNF-04); situação sempre com cor, símbolo e rótulo (RNF-06).

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

**Status:** `implementada`

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

## Telas e evidência de layout

Sem tela própria nesta Spec (indicador exposto só pela API). As telas que mostram média e situação são das SPEC-006 e SPEC-007 e seguem os selos de situação de [`identidade-visual.md`](identidade-visual.md).

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

**Status:** `implementada`

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
| **OPEN relacionados** | OPEN-001, OPEN-002, OPEN-016, OPEN-017 |

## 3. Escopo

**Incluído:** cadastrar avaliação (turma, nome, peso, data) pelo professor responsável pela turma (OPEN-001, OPEN-017), lançar nota, alterar nota já lançada, recalcular média e indicador (via SPEC-003).

**Fora do escopo:** faixa de nota e fórmula da média (OPEN-002).

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-10-16 por Arthur; aplicado ao código como refatoração visual. Marca, cores e componentes: [`identidade-visual.md`](identidade-visual.md) (RNF-06). Protótipo: [`layout/prototipo.html`](layout/prototipo.html).

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Professor — Notas e avaliações (lançar, alterar, nova avaliação) | [prototipo.html#professor-notas](layout/prototipo.html#professor-notas) | [x] | [x] | Arthur | 2026-10-16 |

Checklist RNF: navegação consistente com menu do perfil e Sair (RNF-06); usável em computador, tablet e smartphone (RNF-04); situação sempre com cor, símbolo e rótulo (RNF-06).

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
| Cadastrar avaliação (OPEN-017) | turma, nome, peso, data | avaliação cadastrada | peso não maior que zero ou dado ausente, sem permissão |

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
| AC-004-06 | Professor responsável pela turma | Cria avaliação (turma, peso, data) com peso > 0 | Avaliação cadastrada na turma; peso ≤ 0 é recusado (OPEN-017) |
| AC-004-07 | Professor de outra turma ou estudante | Tenta criar avaliação | Acesso negado (OPEN-017) |

## 12. Casos de teste derivados

1. Lançamento feliz e recálculo.
2. Valor fora da faixa (depende de OPEN-002).
3. Alteração de nota recalcula indicador.
4. Escopo do professor e negação ao estudante.
5. Cadastro de avaliação pelo professor responsável; negação a outro professor e ao estudante (OPEN-017).

## 13. Questões em aberto

OPEN-001, OPEN-002, OPEN-016 e OPEN-017 (todas fechadas).

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-005 — Frequência, atividades e entregas atrasadas

**Status:** `implementada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-005 |
| **Nome** | Frequência, atividades e entregas atrasadas |
| **Objetivo** | Registrar frequência e atividades, registrar entregas e classificar como atrasada a entrega não registrada até o prazo. |
| **Valor** | Acompanhamento de presença e prazos que alimenta a situação acadêmica. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-07, RF-08, RF-09, RF-11 |
| **RB** | RB-03, RB-05, RB-08, RB-09, RB-10 |
| **RNF** | RNF-03, RNF-05, RNF-06; RNF-04 nas telas |
| **UC / fluxo** | Extensão de atividade atrasada do UC-02; fluxos de frequência, atividade e entrega descritos na seção 5 |
| **Entidades** | `Turma`, `Frequencia`, `Atividade`, `Entrega`, `IndicadorAcademico` |
| **Drivers** | AD-01, AD-02, AD-04 |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | #15, #16, #17 |
| **OPEN relacionados** | OPEN-001, OPEN-003 e OPEN-010 (fechadas); OPEN-011 (fora do escopo) |

## 3. Escopo

**Incluído**
- Registro e alteração da frequência (percentual de 0 a 100) de um estudante numa turma, com recálculo do indicador na mesma transação (RB-10).
- Cadastro de atividade com descrição e prazo, na turma (e portanto na disciplina) do professor responsável.
- Registro da entrega de um estudante pelo professor, com data (padrão: hoje), e desfazer de um registro feito por engano (OPEN-003).
- Status de entrega derivado na leitura: No prazo, Pendente ou Atrasada (OPEN-010, RB-08), indicado ao estudante e ao professor (RF-09).

**Fora do escopo**
- Histórico e evolução da frequência (OPEN-011, SPEC-007).
- Envio de arquivo pelo estudante (sem RF).
- Edição e exclusão de atividade (sem RF).
- Alertas (SPEC-006): a atividade atrasada não entra na classificação Normal/Atenção/Risco (RB-09 usa só média e frequência).

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-10-16 por Arthur. Marca, cores e componentes: [`identidade-visual.md`](identidade-visual.md) (RNF-06). Protótipo: [`layout/prototipo.html`](layout/prototipo.html).

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Professor — Frequência | [prototipo.html#professor-frequencia](layout/prototipo.html#professor-frequencia) | [x] | [x] | Arthur | 2026-10-16 |
| Professor — Atividades (lista e nova atividade) | [prototipo.html#professor-atividades](layout/prototipo.html#professor-atividades) | [x] | [x] | Arthur | 2026-10-16 |
| Professor — Entregas de uma atividade | [prototipo.html#professor-atividade](layout/prototipo.html#professor-atividade) | [x] | [x] | Arthur | 2026-10-16 |
| Estudante — Minhas atividades | [prototipo.html#estudante-atividades](layout/prototipo.html#estudante-atividades) | [x] | [x] | Arthur | 2026-10-16 |

Checklist RNF: navegação consistente com menu do perfil e Sair (RNF-06); usável em computador, tablet e smartphone (RNF-04); status de entrega sempre com cor, símbolo e rótulo (RNF-06).

## 4. Dependências

SPEC-001, SPEC-002, SPEC-003.

## 5. Comportamento esperado

**Pré-condições:** professor autenticado e responsável pela turma; estudante matriculado na turma.

**Fluxo principal (frequência):**
1. Professor escolhe a turma e o estudante e informa o percentual de frequência.
2. Sistema valida o valor (0 a 100) e grava a frequência vigente do estudante na turma.
3. Na mesma transação, sistema recalcula o indicador (SPEC-003, RB-10).

**Fluxo (atividade):** professor cadastra atividade com descrição e prazo na turma escolhida; sistema registra.

**Fluxo (entrega):**
1. Professor abre a atividade e vê, para cada estudante da turma, o status da entrega.
2. Professor registra a entrega de um estudante, com a data (padrão: hoje), ou desfaz um registro.

**Status da entrega (OPEN-010, RB-08):** calculado na leitura, com o prazo valendo até o fim do dia (horário de Brasília):
- entregue até o prazo → **No prazo**;
- entregue depois do prazo → **Atrasada**;
- sem entrega e prazo ainda não encerrado → **Pendente**;
- sem entrega e prazo encerrado → **Atrasada**.

**Exceções:**
- Dados da atividade incompletos: sistema impede o cadastro e indica o campo (RF-08).
- Percentual fora de 0–100: sistema recusa e indica o campo.
- Turma de outro professor ou estudante fora da turma: acesso negado, nada é gravado (RB-03).
- Entrega já registrada para o estudante na atividade: sistema recusa o segundo registro (INV-005-03).

**Pós-condições de sucesso:** frequência, atividade ou entrega gravadas; indicador recalculado quando a frequência muda.
**Pós-condição de falha:** estado anterior preservado.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-005-01 | Frequência abaixo de 75% leva a Risco (RB-05), pela regra única da SPEC-003. |
| INV-005-02 | Atividade sem entrega após o prazo é Atrasada (RB-08). |
| INV-005-03 | Cada atividade tem no máximo 1 entrega por estudante. |
| INV-005-04 | Toda alteração de frequência recalcula o indicador na mesma transação (RB-10). |
| INV-005-05 | Só o professor responsável pela turma registra frequência, atividades e entregas dela (RB-03). |
| INV-005-06 | O status de entrega existe em um único lugar do código (domínio) e não é gravado no banco (OPEN-010). |

## 7. Modelo de domínio envolvido

`Frequencia` (percentual, atualizadaEm), `Atividade` (descrição, prazo; pertence a 1 turma), `Entrega` (dataEntrega; 1 por estudante e atividade; status derivado).

## 8. Impacto arquitetural

Status de entrega como função pura em `src/domain` (DA-02, DA-07), sem rotina agendada. Escrita de frequência e recálculo do indicador na mesma transação (AD-02). Escopo do professor e do estudante filtrado na própria query (ADR-003).

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| Registrar frequência | turma, estudante, percentual | frequência gravada, indicador recalculado | valor inválido, sem permissão |
| Cadastrar atividade | turma, descrição, prazo | atividade registrada | dados incompletos, sem permissão |
| Registrar entrega | atividade, estudante, data (opcional) | entrega registrada | entrega já registrada, sem permissão |
| Desfazer entrega | entrega | entrega removida | sem permissão |
| Consultar entregas | sessão | atividades do escopo com status por estudante | sem sessão |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-03 | Professor de outra turma é recusado em todas as escritas |
| RNF-05 | Estudante só vê as próprias atividades e entregas |
| RNF-04, RNF-06 | Telas aprovadas no protótipo, em computador e celular |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-005-01 | Professor responsável | Registra frequência de um estudante | Percentual atualizado e indicador recalculado |
| AC-005-02 | Professor responsável | Cadastra atividade completa | Atividade registrada |
| AC-005-03 | Professor responsável | Cadastra atividade sem prazo | Cadastro impedido |
| AC-005-04 | Prazo encerrado e sem entrega | O status é consultado | Entrega aparece Atrasada para o estudante e para o professor |
| AC-005-05 | Entrega registrada dentro do prazo | O status é consultado | Entrega aparece No prazo, não Atrasada |
| AC-005-06 | Entrega registrada depois do prazo | O status é consultado | Entrega aparece Atrasada |
| AC-005-07 | Prazo ainda não encerrado e sem entrega | O status é consultado | Entrega aparece Pendente |
| AC-005-08 | Professor de outra turma | Tenta registrar frequência, atividade ou entrega | Acesso negado e nada gravado |
| AC-005-09 | Dois estudantes na mesma turma | Um deles consulta as atividades | Vê só o próprio status de entrega |

## 12. Casos de teste derivados

1. Frequência de 74,9% leva a Risco, 75% não.
2. Atividade incompleta é recusada.
3. Status de entrega nos dois lados do prazo, inclusive no último dia.
4. Escopo do professor e do estudante.
5. Segunda entrega para o mesmo estudante e atividade é recusada.

## 13. Questões em aberto

Nenhuma. OPEN-003 e OPEN-010 fechadas em 2026-10-16; OPEN-011 continua aberta e fora do escopo desta Spec.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-006 — Alertas de atenção e risco

**Status:** `implementada`

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
| **RB** | RB-02, RB-03, RB-09, RB-10 |
| **RNF** | RNF-01, RNF-03, RNF-05, RNF-06; RNF-04 na apresentação |
| **UC / fluxo** | Inclusão "Emitir Alerta de Atenção/Risco"; extensão 1 do UC-02 |
| **Entidades** | `IndicadorAcademico`, `Usuario`, `Turma` |
| **Drivers** | AD-01, AD-02, AD-05 |
| **ADRs** | ADR-001, ADR-003 |
| **Issues** | #20 |
| **OPEN relacionados** | OPEN-004 (fechada) |

## 3. Escopo

**Incluído**
- Alerta derivado do indicador vigente (OPEN-004): existe enquanto a situação da turma for Atenção ou Risco e some sozinho quando ela volta a Normal.
- Apresentação ao estudante, no topo do seu painel, e ao professor responsável, no início do professor ("Alertas das minhas turmas").
- Consulta de alertas pela API, com o escopo de cada perfil.

**Fora do escopo**
- E-mail, notificação push ou outro canal fora da tela (sem RF nem infraestrutura, OPEN-004).
- Histórico de alertas, "marcar como lido" e deduplicação: o alerta não é gravado (OPEN-004).
- Alertas para o Coordenador (RF-12 cita só estudante e professor responsável; relatórios são da SPEC-009).

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-10-16 por Arthur. Marca, cores e componentes: [`identidade-visual.md`](identidade-visual.md) (RNF-06). Protótipo: [`layout/prototipo.html`](layout/prototipo.html).

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Estudante — alertas no topo do painel | [prototipo.html#estudante-painel](layout/prototipo.html#estudante-painel) | [x] | [x] | Arthur | 2026-10-16 |
| Professor — alertas das minhas turmas | [prototipo.html#professor-inicio](layout/prototipo.html#professor-inicio) | [x] | [x] | Arthur | 2026-10-16 |

Checklist RNF: alerta sempre com cor, símbolo e rótulo (RNF-06); usável em computador e celular (RNF-04).

## 4. Dependências

SPEC-001, SPEC-003, SPEC-004, SPEC-005.

## 5. Comportamento esperado

**Pré-condições:** indicador vigente existente.

**Fluxo principal:**
1. O indicador de um estudante é recalculado (nota ou frequência, SPEC-004/005).
2. Na próxima consulta, se a situação da turma for Atenção ou Risco, o sistema apresenta o alerta ao estudante e ao professor responsável pela turma, com a disciplina, a média e a frequência que levaram à situação.
3. Se for Normal, nenhum alerta é apresentado.

**Exceções:** nenhuma específica; como o alerta é só leitura, uma falha ao exibir não altera o indicador.

**Pós-condições de sucesso:** alerta visível para os destinatários corretos.
**Pós-condição de falha:** indicador preservado.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-006-01 | Só existe alerta para situação Atenção ou Risco (RB-09). |
| INV-006-02 | O alerta reflete o indicador atual, nunca um valor desatualizado: é derivado na leitura e não é gravado (OPEN-004). |
| INV-006-03 | O alerta é visível apenas ao próprio estudante e ao professor responsável (RB-02, RB-03). |

## 7. Modelo de domínio envolvido

`IndicadorAcademico` (situação, média, frequência atual); vínculo professor responsável pela `Turma`.

## 8. Impacto arquitetural

Regra "o que gera alerta" como função pura em `src/domain` (DA-02); consulta sobre o indicador persistido (DA-05), com escopo na query (ADR-003). Sem fila, agendador ou tabela nova.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| Consultar alertas | sessão de Estudante ou Professor | alertas do escopo (estudante: os próprios; professor: os dos estudantes das turmas que leciona) | sem sessão, perfil sem permissão |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-01 | Consulta de alertas lê o indicador persistido, sem recálculo |
| RNF-03, RNF-05 | Alertas só aparecem para os destinatários corretos |
| RNF-04, RNF-06 | Telas aprovadas no protótipo, em computador e celular |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-006-01 | Indicador passa a Atenção | O estudante e o professor consultam | Alerta de Atenção visível a ambos |
| AC-006-02 | Indicador passa a Risco | O estudante e o professor consultam | Alerta de Risco visível a ambos |
| AC-006-03 | Indicador Normal | O estudante consulta | Nenhum alerta |
| AC-006-04 | Alerta de um estudante | Outro estudante consulta | Não vê o alerta |
| AC-006-05 | Estudante que sai de Risco | O indicador é recalculado | O alerta de Risco deixa de ser exibido |
| AC-006-06 | Professor de outra turma ou Coordenador | Consulta alertas | Não recebe alerta de estudantes fora do seu escopo |

## 12. Casos de teste derivados

1. Alerta por situação (Normal, Atenção, Risco).
2. Escopo do alerta (estudante, professor responsável, outros).
3. Alerta some quando a situação melhora.

## 13. Questões em aberto

Nenhuma. OPEN-004 fechada em 2026-10-16.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-007 — Dashboard acadêmico do estudante

**Status:** `implementada`

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
| **RNF** | RNF-01, RNF-03, RNF-04, RNF-05, RNF-06 |
| **UC / fluxo** | UC-02, incluindo estudante sem turmas, alertas e atrasos |
| **Entidades** | `Usuario`, `Turma`, `Disciplina`, `Avaliacao`, `Nota`, `Frequencia`, `Atividade`, `Entrega`, `IndicadorAcademico` |
| **Drivers** | AD-01, AD-02, AD-05 |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | #18, #17, #19, #20 |
| **OPEN relacionados** | OPEN-011 (fechada) |

## 3. Escopo

**Incluído**
- Painel do estudante autenticado (página inicial do perfil), por turma: disciplina, professor, média, frequência, situação, notas por avaliação e **evolução** (OPEN-011).
- Alertas de Atenção e Risco no topo (SPEC-006) e destaque da disciplina afetada.
- Atividades atrasadas e pendentes do estudante (SPEC-005), com atalho para "Minhas atividades".

**Fora do escopo**
- Dados de outros estudantes.
- Histórico gravado do indicador (OPEN-011: a evolução usa as notas já existentes).

**Evolução (OPEN-011):** a sequência das notas do estudante nas avaliações da turma, em ordem de data, apresentada em um gráfico de linha simples (0 a 10). Avaliação ainda sem nota não entra no gráfico.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-10-16 por Arthur. Marca, cores e componentes: [`identidade-visual.md`](identidade-visual.md) (RNF-06). Protótipo: [`layout/prototipo.html`](layout/prototipo.html).

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Estudante — painel acadêmico (alertas, turmas, evolução, atividades) | [prototipo.html#estudante-painel](layout/prototipo.html#estudante-painel) | [x] | [x] | Arthur | 2026-10-16 |
| Estudante — painel sem turmas | [prototipo.html#estudante-vazio](layout/prototipo.html#estudante-vazio) | [x] | [x] | Arthur | 2026-10-16 |

Checklist RNF: situação sempre com cor, símbolo e rótulo e gráfico com valores legíveis (RNF-06); usável em computador e celular (RNF-04).

## 4. Dependências

SPEC-001 a SPEC-006.

## 5. Comportamento esperado

**Pré-condições:** estudante autenticado (UC-01).

**Fluxo principal:**
1. Estudante acessa o painel (início do perfil).
2. Sistema consulta notas, médias, frequência e atividades das turmas em que está matriculado, filtrando pelo estudante dentro da query (ADR-003).
3. Sistema recupera o indicador vigente de cada turma (sem recalcular, DA-05).
4. Sistema apresenta o painel consolidado com a situação (Normal, Atenção ou Risco) e a evolução das notas.

**Extensão 1:** situação Atenção ou Risco: alerta no topo e destaque da disciplina afetada.
**Extensão 2:** atividade sem entrega após o prazo: sinalizada como atrasada.

**Exceções:** estudante sem turmas: painel vazio com orientação para procurar a coordenação. Turma ainda sem indicador (sem nota nem frequência): mostra "sem dados ainda" em vez da situação.

**Pós-condições de sucesso:** estudante visualiza sua situação acadêmica atualizada.
**Pós-condição de falha:** nenhum dado de terceiros é exibido.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-007-01 | O painel mostra apenas dados do próprio estudante (RB-02). |
| INV-007-02 | A situação exibida é a do indicador vigente (RB-09, RB-10). |
| INV-007-03 | O escopo é aplicado dentro da consulta (ADR-003). |
| INV-007-04 | A evolução usa só notas já lançadas, em ordem de data da avaliação (OPEN-011). |

## 7. Modelo de domínio envolvido

Leitura de todas as entidades acadêmicas filtradas pelo estudante autenticado.

## 8. Impacto arquitetural

Consulta agregada com índice composto, usando o indicador persistido para cumprir RNF-01 (DA-05). Gráfico de evolução em SVG gerado no servidor, sem biblioteca externa.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| Consultar painel | estudante autenticado | turmas com média, frequência, situação, notas, evolução, alertas e atividades | sem sessão, perfil diferente de Estudante |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-01 | Carga do painel em até 3 s (P95) com dados de amostra |
| RNF-03, RNF-05 | Estudante nunca recebe dados de outro |
| RNF-04, RNF-06 | Painel aprovado no protótipo, utilizável em computador e celular |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-007-01 | Estudante com turmas | Acessa o painel | Vê notas, médias, frequência, atividades, evolução e situação |
| AC-007-02 | Situação Atenção ou Risco | Acessa o painel | Disciplina afetada destacada e alerta exibido |
| AC-007-03 | Atividade sem entrega após o prazo | Acessa o painel | Atividade sinalizada como atrasada |
| AC-007-04 | Estudante sem turmas | Acessa o painel | Painel vazio com orientação |
| AC-007-05 | Dois estudantes com dados diferentes | Cada um acessa | Cada um vê só os próprios dados |
| AC-007-06 | Painel com dados de amostra | Medição de carga | Resposta em até 3 s (P95) |
| AC-007-07 | Notas em avaliações de datas diferentes | Acessa o painel | A evolução mostra as notas na ordem das datas |

## 12. Casos de teste derivados

1. Painel com dados completos.
2. Destaques de Atenção, Risco e atraso.
3. Estudante sem turmas.
4. Isolamento entre estudantes.
5. Medição de tempo de resposta.
6. Ordem da evolução.

## 13. Questões em aberto

Nenhuma. OPEN-011 fechada em 2026-10-16.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-008 — Dashboard do professor e plano de recuperação

**Status:** `implementada`

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
| **RNF** | RNF-01, RNF-03, RNF-04, RNF-05, RNF-06 |
| **UC / fluxo** | Dashboard do professor; UC-04, incluindo progresso |
| **Entidades** | `Usuario`, `Turma`, `IndicadorAcademico`, `PlanoRecuperacao`, `ItemPlano` |
| **Drivers** | AD-01, AD-02, AD-04, AD-05 |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | #21, #22 |
| **OPEN relacionados** | OPEN-003, OPEN-012 e OPEN-021 (fechadas) |

## 3. Escopo

**Incluído**
- Dashboard da turma (RF-13): estudantes da turma com média, frequência e situação vigentes, contagem Normal, Atenção, Risco e sem dados, e o plano de cada estudante.
- Criação de plano de recuperação para estudante em Risco (RF-14, RB-11), com 1 ou mais itens próprios do plano (OPEN-021).
- Marcar e desmarcar a conclusão de cada item pelo professor (OPEN-003) e cálculo do progresso (RB-12).
- Encerramento do plano pelo professor (OPEN-012); a tela avisa quando o estudante já saiu do Risco.

**Fora do escopo**
- Visão do plano pelo estudante (sem RF).
- Edição ou exclusão de itens e de planos (sem RF).
- Encerramento automático (OPEN-012).

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-10-16 por Arthur. Marca, cores e componentes: [`identidade-visual.md`](identidade-visual.md) (RNF-06). Protótipo: [`layout/prototipo.html`](layout/prototipo.html).

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Professor — Dashboard da turma e criação de plano | [prototipo.html#professor-turma](layout/prototipo.html#professor-turma) | [x] | [x] | Arthur | 2026-10-16 |
| Professor — Plano de recuperação | [prototipo.html#professor-plano](layout/prototipo.html#professor-plano) | [x] | [x] | Arthur | 2026-10-16 |

Checklist RNF: situação e progresso com cor, símbolo e rótulo (RNF-06); usável em computador e celular (RNF-04).

## 4. Dependências

SPEC-001 a SPEC-006; SPEC-007 como padrão de consulta consolidada.

## 5. Comportamento esperado

**Pré-condições:** professor autenticado e responsável pela turma.

**Fluxo principal (dashboard):** professor abre uma turma que leciona; sistema apresenta os indicadores vigentes apenas dos estudantes dessa turma e a contagem por situação.

**Fluxo principal (plano):**
1. No dashboard da turma, professor escolhe um estudante em Risco.
2. Professor informa os itens previstos no plano (um por linha).
3. Sistema cria o plano `Ativo`, vinculado ao estudante, à turma e ao professor responsável.
4. Sistema inicializa o progresso em 0%.

**Alternativo (progresso):** professor marca ou desmarca um item como concluído; o progresso é recalculado como concluídos ÷ previstos (RB-12).

**Alternativo (encerramento):** professor encerra o plano; ele fica `Encerrado` e somente leitura. Se o estudante voltar ao Risco, um novo plano pode ser criado.

**Exceções:**
- Estudante fora de Risco: sistema impede a criação e explica o motivo (RB-11).
- Plano sem nenhum item: sistema impede a criação e indica o campo.
- Estudante já com plano ativo na turma: sistema impede um segundo plano ativo.
- Turma de outro professor: acesso negado.

**Pós-condições de sucesso:** plano vinculado ao estudante e a exatamente um professor.
**Pós-condição de falha:** nenhum plano criado ou alterado.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-008-01 | Só estudante em Risco recebe plano de recuperação (RB-11). |
| INV-008-02 | Todo plano tem exatamente 1 professor responsável, o da turma (RB-11). |
| INV-008-03 | Progresso é concluídos ÷ previstos, e o plano tem de 1 a N itens (RB-12). |
| INV-008-04 | O professor só vê estudantes e planos das turmas que leciona (RB-03). |
| INV-008-05 | Há no máximo 1 plano `Ativo` por estudante e turma. |
| INV-008-06 | Plano `Encerrado` não aceita alteração de itens. |

## 7. Modelo de domínio envolvido

`PlanoRecuperacao` (status Ativo/Encerrado, criadoEm, encerradoEm; 1 estudante, 1 turma, 1 professor) com `ItemPlano` (descrição, concluído, concluídoEm). O progresso é derivado, não gravado.

## 8. Impacto arquitetural

Progresso e regra de criação como funções puras em `src/domain` (DA-07). Escopo na query (ADR-003). Índice parcial único garante INV-008-05 no banco.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| Consultar turma | professor responsável, turma | indicadores, contagem por situação e planos | turma fora do escopo |
| Criar plano | turma, estudante, itens | plano Ativo com progresso 0% | estudante fora de Risco, sem itens, plano ativo existente, sem permissão |
| Marcar item | item, concluído (sim/não) | item atualizado, progresso recalculado | plano encerrado, sem permissão |
| Encerrar plano | plano | plano Encerrado | já encerrado, sem permissão |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-01 | Dashboard da turma lê o indicador persistido, em até 3 s |
| RNF-03, RNF-05 | Professor só acessa as turmas e planos dele |
| RNF-04, RNF-06 | Telas aprovadas no protótipo, em computador e celular |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-008-01 | Professor responsável por uma turma | Acessa a turma | Vê só os estudantes dela, com contagem Normal, Atenção e Risco |
| AC-008-02 | Estudante em Risco | Professor cria um plano | Plano associado ao estudante e ao professor, progresso 0% |
| AC-008-03 | Estudante em Normal ou Atenção | Professor tenta criar plano | Criação impedida com mensagem explicativa |
| AC-008-04 | Plano com 4 itens previstos | 1 item é concluído | Progresso 25% |
| AC-008-05 | Professor de outra turma | Tenta acessar a turma ou criar plano | Acesso negado |
| AC-008-06 | Estudante já com plano ativo | Professor tenta criar outro | Criação impedida |
| AC-008-07 | Plano ativo de estudante que saiu de Risco | Professor encerra o plano | Plano Encerrado e sem alteração de itens |

## 12. Casos de teste derivados

1. Cálculo de progresso (0%, 25%, 100%).
2. Criação só para Risco.
3. Plano com exatamente 1 professor.
4. Escopo do professor.
5. Um plano ativo por estudante e turma.

## 13. Questões em aberto

Nenhuma. OPEN-003, OPEN-012 e OPEN-021 fechadas.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-009 — Relatórios acadêmicos autorizados

**Status:** `implementada`

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
| **RB** | RB-03, RB-04, RB-08, RB-09, RB-10 |
| **RNF** | RNF-01, RNF-03, RNF-04, RNF-05, RNF-06 |
| **UC / fluxo** | UC-05 |
| **Entidades** | `Usuario`, `Turma`, `Disciplina`, `Frequencia`, `Atividade`, `Entrega`, `IndicadorAcademico` |
| **Drivers** | AD-01, AD-02, AD-04, AD-05 |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | #2 |
| **OPEN relacionados** | OPEN-005 (fechada) |

## 3. Escopo

**Incluído (OPEN-005)**
- Relatório na tela, para Professor (turmas que leciona) e Coordenador (turmas sob sua responsabilidade).
- Resumo por turma: estudantes, média da turma, frequência média, quantos em Normal, Atenção, Risco e sem dados, e entregas atrasadas.
- Detalhe por estudante: média, frequência, situação e entregas atrasadas.
- Filtros por turma e por situação.
- Exportação em CSV (separador `;` e vírgula decimal, para abrir no Excel em português), com os mesmos filtros.

**Fora do escopo**
- PDF e gráficos no relatório.
- Relatórios agendados ou enviados por e-mail.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-10-16 por Arthur. Marca, cores e componentes: [`identidade-visual.md`](identidade-visual.md) (RNF-06). Protótipo: [`layout/prototipo.html`](layout/prototipo.html).

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Relatório acadêmico (professor e coordenador) | [prototipo.html#relatorio](layout/prototipo.html#relatorio) | [x] | [x] | Arthur | 2026-10-16 |

Checklist RNF: situação com cor, símbolo e rótulo (RNF-06); usável em computador e celular (RNF-04).

## 4. Dependências

SPEC-001 a SPEC-008.

## 5. Comportamento esperado

**Pré-condições:** usuário autenticado com perfil Professor ou Coordenador.

**Fluxo principal:**
1. Usuário abre o relatório e, se quiser, escolhe turma e situação.
2. Sistema valida a autorização conforme o perfil (RB-03, RB-04), filtrando dentro da query (ADR-003).
3. Sistema consolida média, frequência e situação vigentes (RB-10) e as entregas atrasadas (RB-08) das turmas autorizadas.
4. Sistema apresenta o relatório; o usuário pode exportar o mesmo conteúdo em CSV.

**Média da turma:** média simples das médias dos estudantes que já têm média; **frequência média:** média simples das frequências registradas. Estudante sem dados conta em "sem dados" e não entra nessas médias.

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
| INV-009-05 | Tela e CSV trazem exatamente as mesmas linhas para os mesmos filtros. |

## 7. Modelo de domínio envolvido

Leitura de todas as entidades acadêmicas filtradas por escopo de professor ou coordenador.

## 8. Impacto arquitetural

Consolidação (médias e contagens) como funções puras em `src/domain` (DA-07); consulta agregada com filtro de escopo na própria query (ADR-003), apoiada no indicador persistido (DA-05); status de entrega pela regra única da SPEC-005.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| Gerar relatório | sessão, turma (opcional), situação (opcional) | resumo por turma e detalhe por estudante | turma fora do escopo, perfil sem permissão |
| Exportar CSV | os mesmos filtros | arquivo `relatorio-studytrack.csv` | os mesmos |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-01 | Relatório em até 3 s para turmas de tamanho típico |
| RNF-03, RNF-05 | Nenhuma linha de turma fora do escopo aparece, na tela nem no CSV |
| RNF-04, RNF-06 | Tela aprovada no protótipo, em computador e celular |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-009-01 | Professor responsável | Solicita relatório da própria turma | Relatório consolidado |
| AC-009-02 | Coordenador responsável por turmas | Solicita relatório | Relatório só dessas turmas |
| AC-009-03 | Professor | Solicita relatório de turma alheia | Bloqueado com mensagem de negação |
| AC-009-04 | Estudante | Tenta solicitar relatório | Acesso negado |
| AC-009-05 | Indicador alterado | Relatório é gerado em seguida | Reflete o indicador atual |
| AC-009-06 | Filtro por situação Risco | Relatório é gerado | Só estudantes em Risco no detalhe |
| AC-009-07 | Mesmos filtros | Usuário exporta CSV | CSV com as mesmas linhas da tela |

## 12. Casos de teste derivados

1. Relatório de professor e de coordenador.
2. Turma fora do escopo é bloqueada.
3. Negação ao estudante.
4. Relatório reflete a última alteração.
5. Consolidação: médias e contagens com estudantes sem dados.
6. CSV com separador `;` e vírgula decimal.

## 13. Questões em aberto

Nenhuma. OPEN-005 fechada em 2026-10-16.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-010 — Administrador e gestão de contas

**Status:** `implementada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-010 |
| **Nome** | Administrador e gestão de contas |
| **Objetivo** | Permitir que um administrador crie contas escolhendo o perfil, consulte as contas e desative ou reative o acesso de uma conta; e permitir que o coordenador troque o professor de uma turma. |
| **Valor** | Contas de Professor e Coordenador deixam de depender do seed, e o acesso de quem saiu da instituição pode ser cortado sem apagar dados acadêmicos. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-16, RF-17 (e RF-01, RF-02 para login e autorização) |
| **RB** | RB-01, RB-13, RB-14 |
| **RNF** | RNF-02, RNF-03, RNF-04, RNF-05, RNF-06 |
| **UC / fluxo** | UC-11 Gerenciar contas; UC-07 (troca de professor) |
| **Entidades** | `Usuario` (perfil Administrador, atributo `ativo`), `Turma`, `PlanoRecuperacao` |
| **Drivers** | AD-01, AD-04, AD-06 |
| **ADRs** | ADR-001, ADR-002, ADR-003, ADR-004 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-025 (fechada); substitui a decisão do OPEN-014 |

## 3. Escopo

**Incluído**
- Perfil Administrador (RB-01), com menu próprio e página inicial em "Contas".
- Criar conta com nome, e-mail, senha inicial (mínimo 8 caracteres, OPEN-009) e perfil, inclusive Administrador.
- Listar contas (nome, e-mail, perfil, ativa ou não) com filtro por perfil.
- Desativar e reativar conta (RB-14): login recusado com a mesma mensagem genérica de credencial inválida (SPEC-001) e sessão em andamento negada na próxima requisição.
- Conta de administrador de teste criada pelo seed (`admin@studytrack.test`, OPEN-013).
- Troca do professor da turma pelo coordenador responsável (RF-17), levando os planos ativos da turma para o novo professor; só professores ativos aparecem para escolha (também no cadastro de turma).

**Fora do escopo**
- Acesso do administrador a dados acadêmicos (RB-13).
- Trocar o perfil de uma conta existente, editar nome ou e-mail, redefinir senha e excluir conta (sem RF).
- Cadastro público ou autocadastro (OPEN-013).

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-10-17 por Arthur (a troca de professor entrou na mesma aprovação, no detalhe da turma já aprovado na SPEC-002). Marca, cores e componentes: [`identidade-visual.md`](identidade-visual.md) (RNF-06). Protótipo: [`layout/prototipo.html`](layout/prototipo.html).

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Administrador — Contas (lista, filtro, nova conta, desativar/reativar) | [prototipo.html#admin-contas](layout/prototipo.html#admin-contas) | [x] | [x] | Arthur | 2026-10-17 |
| Administrador — Contas com erros (campos e desativação recusada) | [prototipo.html#admin-contas-erro](layout/prototipo.html#admin-contas-erro) | [x] | [x] | Arthur | 2026-10-17 |
| Coordenador — Detalhe da turma com troca de professor | [prototipo.html#coordenador-turma](layout/prototipo.html#coordenador-turma) | [x] | [x] | Arthur | 2026-10-17 |

Checklist RNF: situação da conta com cor, símbolo e rótulo (RNF-06); usável em computador, tablet e celular (RNF-04).

## 4. Dependências

SPEC-001 (autenticação, guardas e casca) e SPEC-002 (cadastro de estudante, validação de dados de conta).

## 5. Comportamento esperado

**Pré-condições:** administrador autenticado com conta ativa.

**Fluxo principal (criar conta):**
1. Administrador abre "Contas".
2. Informa nome, e-mail, senha inicial e perfil.
3. Sistema valida os dados, grava a senha com hash (RNF-02) e cria a conta ativa com exatamente o perfil escolhido (RB-01).
4. A conta aparece na lista.

**Alternativo (consultar):** administrador filtra a lista por perfil.

**Alternativo (desativar):** administrador desativa uma conta; o login dela passa a ser recusado e uma sessão aberta dessa conta perde o acesso na próxima requisição (RB-14). Os dados da conta (notas, matrículas, turmas) continuam no sistema.

**Alternativo (reativar):** administrador reativa a conta e ela volta a entrar normalmente.

**Alternativo (trocar professor, RF-17):** no detalhe da turma, o coordenador responsável escolhe outro professor ativo; a turma e seus planos de recuperação ativos passam para ele. Depois disso, o professor anterior pode ser desativado se não tiver outras turmas.

**Exceções:**
- Dado obrigatório ausente, e-mail inválido ou senha curta: sistema impede o cadastro e indica o campo.
- E-mail já cadastrado: sistema recusa.
- Administrador tenta desativar a si mesmo: sistema impede (RB-14).
- Professor responsável por ao menos uma turma: sistema impede a desativação e explica o motivo (RB-14).
- Usuário de outro perfil acessa a gestão de contas, ou administrador acessa dado acadêmico: acesso negado (RB-13, RNF-03).
- Troca para usuário que não é Professor ou está desativado, ou turma de outro coordenador: troca impedida.

**Pós-condições de sucesso:** conta criada com 1 perfil, ou conta com `ativo` alterado.
**Pós-condição de falha:** nenhuma conta criada ou alterada.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-010-01 | Toda conta tem exatamente 1 perfil dentre Estudante, Professor, Coordenador e Administrador (RB-01). |
| INV-010-02 | Só o Administrador cria, lista, desativa e reativa contas (RNF-03). |
| INV-010-03 | O Administrador não acessa dados acadêmicos (RB-13). |
| INV-010-04 | Conta inativa não faz login nem usa sessão já emitida (RB-14). |
| INV-010-05 | Desativar não apaga nem esconde dados acadêmicos da conta. |
| INV-010-06 | O administrador não desativa a própria conta, e professor responsável por turma não é desativado (RB-14). |
| INV-010-07 | Depois da troca, a turma e seus planos ativos têm como professor o novo professor, que é ativo e tem perfil Professor (RF-17, INV-008-02). |

## 7. Modelo de domínio envolvido

`Usuario` com `perfil` incluindo Administrador e `ativo` (padrão: sim). Nenhuma entidade nova.

## 8. Impacto arquitetural

Migração: valor `Administrador` no enum de perfil e coluna `ativo` com padrão verdadeiro (contas existentes continuam ativas). Regras de desativação como funções puras em `src/domain` (DA-07). A guarda de páginas e de API passa a conferir no banco, pelo id da sessão, se a conta continua ativa (uma consulta por requisição). A matriz de recursos (`autorizacao.ts`) ganha o recurso de gestão de contas só para Administrador, e nenhum recurso acadêmico inclui Administrador (nega por padrão, ADR-003).

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| Criar conta | nome, e-mail, senha inicial, perfil | conta ativa criada | dado inválido, e-mail já cadastrado, sem permissão |
| Listar contas | filtro de perfil (opcional) | contas com nome, e-mail, perfil e ativo | sem permissão |
| Desativar conta | conta | conta inativa | própria conta, professor com turma, sem permissão |
| Reativar conta | conta | conta ativa | sem permissão |
| Trocar professor da turma | turma, novo professor | turma com o novo professor e planos ativos transferidos | não é Professor, desativado, turma fora do escopo |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-02 | Senha da conta criada guardada com hash |
| RNF-03, RNF-05 | Só Administrador usa a gestão de contas; Administrador não lê dados acadêmicos |
| RNF-04, RNF-06 | Telas aprovadas no protótipo, em computador, tablet e celular |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-010-01 | Administrador | Cria conta com dados válidos e perfil Professor | Conta ativa criada com perfil Professor, senha com hash, e consegue entrar |
| AC-010-02 | Administrador | Tenta criar conta sem e-mail ou com e-mail já cadastrado | Cadastro impedido, campo indicado, nada gravado |
| AC-010-03 | Administrador | Filtra a lista por Coordenador | Só contas de Coordenador aparecem |
| AC-010-04 | Conta de estudante ativa e logada | Administrador desativa a conta | Próxima requisição é negada e novo login é recusado com mensagem genérica |
| AC-010-05 | Conta desativada | Administrador reativa | Conta volta a entrar; notas e matrículas continuam lá |
| AC-010-06 | Administrador | Tenta desativar a própria conta ou um professor com turma | Desativação impedida com mensagem explicativa |
| AC-010-07 | Professor, Coordenador ou Estudante | Acessa a gestão de contas | Acesso negado |
| AC-010-08 | Administrador | Acessa dados acadêmicos (turmas, notas, relatórios) | Acesso negado |
| AC-010-09 | Turma com plano ativo | Coordenador responsável troca o professor | Turma e plano ativo passam ao novo professor; o anterior deixa de ver a turma |
| AC-010-10 | Coordenador | Tenta trocar para um usuário desativado ou que não é Professor, ou em turma de outro coordenador | Troca impedida |

## 12. Casos de teste derivados

1. Regras de desativação (própria conta, professor com turma, demais).
2. Criação com cada perfil e validação de campos.
3. Sessão de conta desativada negada nas guardas de página e de API.
4. Matriz de autorização: Administrador sem recurso acadêmico; demais perfis sem gestão de contas.
5. Troca de professor com transferência dos planos ativos, e desativação liberada depois da troca.

## 13. Questões em aberto

Nenhuma. OPEN-025 fechada; a troca de professor (RF-17) resolve a desativação de professor com turma.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-011 — Senha própria e troca no primeiro acesso

**Status:** `aprovada` (layout pendente de aprovação, OPEN-020)

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-011 |
| **Nome** | Senha própria e troca no primeiro acesso |
| **Objetivo** | Garantir que a senha definida por outra pessoa seja provisória e permitir que qualquer usuário troque a própria senha. |
| **Valor** | Quem criou a conta deixa de conhecer a senha de uso; fecha uma falha de segurança das contas criadas pela tela. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-18 |
| **RB** | RB-15 |
| **RNF** | RNF-02, RNF-03, RNF-04, RNF-06 |
| **UC / fluxo** | UC-12 Definir ou alterar senha |
| **Entidades** | `Usuario` (atributo `trocarSenha`) |
| **ADRs** | ADR-003, ADR-004 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-026 |

## 3. Escopo

**Incluído**
- Contas criadas pelo administrador (SPEC-010) ou pelo coordenador (cadastro de estudante, SPEC-002) nascem com `trocarSenha`.
- Com `trocarSenha`, toda página leva à tela "Defina sua senha" e toda API responde 403, exceto definir a senha e sair.
- "Alterar minha senha" no menu de todos os perfis: senha atual, nova e confirmação.

**Fora do escopo**
- Recuperação de senha por e-mail (sem infraestrutura de envio).
- Administrador redefinir a senha de outra pessoa.
- Contas do seed (não são obrigadas a trocar, OPEN-026).

## Telas e evidência de layout

**Gate (OPEN-020):** layout pendente de aprovação. Marca, cores e componentes: [`identidade-visual.md`](identidade-visual.md) (RNF-06). Protótipo: [`layout/prototipo.html`](layout/prototipo.html).

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Primeiro acesso — Defina sua senha | [prototipo.html#primeiro-acesso](layout/prototipo.html#primeiro-acesso) | [ ] | [ ] | — | — |
| Alterar minha senha (todos os perfis) | [prototipo.html#minha-senha](layout/prototipo.html#minha-senha) | [ ] | [ ] | — | — |

## 4. Dependências

SPEC-001 (login, guardas) e SPEC-010 (contas, `confirmarConta`).

## 5. Comportamento esperado

**Pré-condições:** usuário autenticado com conta ativa.

**Fluxo principal:**
1. Usuário com conta criada pela tela entra com a senha inicial.
2. Sistema leva à tela "Defina sua senha".
3. Usuário informa a senha atual, a nova e a confirmação.
4. Sistema valida, grava o novo hash, desmarca `trocarSenha` e leva ao painel do perfil.

**Alternativo (alterar):** qualquer usuário abre "Alterar minha senha" no menu e troca pelo mesmo formulário.

**Exceções:**
- Senha atual errada, nova com menos de 8 caracteres, igual à atual ou confirmação diferente: troca impedida e campo indicado.
- Com `trocarSenha`, qualquer outra página ou API: redireciona para "Defina sua senha" (página) ou 403 (API).

**Pós-condições:** senha substituída (só o hash é gravado) e `trocarSenha` falso.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-011-01 | Conta criada pela tela começa com `trocarSenha` verdadeiro; conta do seed, falso. |
| INV-011-02 | Com `trocarSenha`, só definir a senha e sair são permitidos (RB-15). |
| INV-011-03 | A nova senha tem 8+ caracteres e é diferente da atual (RB-15). |
| INV-011-04 | A senha nunca é gravada em texto puro (RNF-02). |

## 7. Modelo de domínio envolvido

`Usuario.trocarSenha` (padrão: falso).

## 8. Impacto arquitetural

Migração com a coluna. Regras de validação puras em `src/domain`. A guarda (`confirmarConta`) passa a conhecer `trocarSenha` e bloqueia o resto. Rota `POST /api/auth/senha` usa a sessão do próprio usuário.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| Definir/alterar senha | senha atual, nova, confirmação | senha trocada, `trocarSenha` falso | senha atual errada, nova inválida, confirmação diferente, sem sessão |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-02 | Hash novo diferente do anterior; senha nunca em texto |
| RNF-03 | Com `trocarSenha`, páginas e APIs bloqueadas |
| RNF-04, RNF-06 | Telas aprovadas no protótipo, em computador e celular |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-011-01 | Conta criada pelo administrador | A pessoa entra pela primeira vez | Vai para "Defina sua senha" e as APIs respondem 403 até trocar |
| AC-011-02 | Conta com `trocarSenha` | Define senha nova válida | Entra no painel; a senha antiga deixa de funcionar |
| AC-011-03 | Usuário autenticado | Informa a senha atual errada | Troca impedida, campo indicado |
| AC-011-04 | Usuário autenticado | Nova senha curta, igual à atual ou com confirmação diferente | Troca impedida, campo indicado |
| AC-011-05 | Conta do seed | Entra | Vai direto ao painel, sem troca obrigatória |

## 12. Casos de teste derivados

1. Validação da nova senha.
2. Bloqueio de páginas e APIs com `trocarSenha`.
3. Troca bem-sucedida e login com a senha nova.

## 13. Questões em aberto

Nenhuma. OPEN-026 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-012 — Plano de recuperação visível ao estudante

**Status:** `aprovada` (layout pendente de aprovação, OPEN-020)

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-012 |
| **Nome** | Plano de recuperação visível ao estudante |
| **Objetivo** | Mostrar ao estudante os próprios planos de recuperação, só para leitura. |
| **Valor** | O estudante sabe o que precisa fazer para sair do Risco e acompanha o progresso. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-19 (e RF-14) |
| **RB** | RB-02, RB-12 |
| **RNF** | RNF-01, RNF-03, RNF-04, RNF-05, RNF-06 |
| **UC / fluxo** | UC-02 Consultar situação acadêmica (extensão: plano) |
| **Entidades** | `PlanoRecuperacao`, `ItemPlano` |
| **ADRs** | ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-027 |

## 3. Escopo

**Incluído**
- Seção "Plano de recuperação" no painel do estudante: plano ativo de cada turma com itens, concluídos e progresso.
- Planos encerrados num histórico recolhido.

**Fora do escopo**
- Estudante marcar itens (continua com o professor, OPEN-003).
- Comentários ou mensagens no plano (sem RF).

## Telas e evidência de layout

**Gate (OPEN-020):** layout pendente de aprovação. Marca, cores e componentes: [`identidade-visual.md`](identidade-visual.md) (RNF-06). Protótipo: [`layout/prototipo.html`](layout/prototipo.html).

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Estudante — Painel com plano de recuperação | [prototipo.html#estudante-plano](layout/prototipo.html#estudante-plano) | [ ] | [ ] | — | — |

## 4. Dependências

SPEC-007 (painel) e SPEC-008 (plano).

## 5. Comportamento esperado

**Pré-condições:** estudante autenticado.

**Fluxo principal:**
1. Estudante abre o painel.
2. Sistema mostra, para cada turma em que ele tem plano ativo, os itens, quais estão concluídos e o progresso (RB-12).
3. Planos encerrados aparecem recolhidos, com a data de encerramento.



**Exceções:**
- Estudante sem plano: a seção não aparece.

**Pós-condições:** nenhuma alteração de dados (consulta).

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-012-01 | O estudante vê só os próprios planos (RB-02). |
| INV-012-02 | O progresso mostrado é o mesmo calculado para o professor (RB-12). |
| INV-012-03 | O estudante não altera plano nem itens. |

## 7. Modelo de domínio envolvido

Sem entidade nova.

## 8. Impacto arquitetural

Consulta filtrada pelo estudante da sessão dentro da query (ADR-003); progresso por `progressoDoPlano` (regra única).

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| Consultar meus planos | sessão do estudante | planos ativos e encerrados com itens e progresso | sem sessão, outro perfil |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-03, RNF-05 | Outro estudante nunca vê o plano |
| RNF-04, RNF-06 | Tela aprovada no protótipo |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-012-01 | Estudante com plano ativo de 4 itens, 1 concluído | Abre o painel | Vê os 4 itens, 1 marcado, progresso 25% |
| AC-012-02 | Estudante com plano encerrado | Abre o painel | Vê o plano no histórico, com a data de encerramento |
| AC-012-03 | Outro estudante da mesma turma | Abre o painel | Não vê o plano do colega |
| AC-012-04 | Estudante | Tenta marcar item pela API | Acesso negado |

## 12. Casos de teste derivados

1. Escopo do estudante.
2. Progresso igual ao do professor.
3. Escrita negada.

## 13. Questões em aberto

Nenhuma. OPEN-027 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-013 — Histórico de notas

**Status:** `aprovada` (layout pendente de aprovação, OPEN-020)

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-013 |
| **Nome** | Histórico de notas |
| **Objetivo** | Registrar cada lançamento e alteração de nota e permitir que coordenador e professor consultem esse histórico. |
| **Valor** | Transparência em contestação de nota: sempre se sabe quem mudou, quando e de quanto para quanto. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-20 |
| **RB** | RB-03, RB-04, RB-16 |
| **RNF** | RNF-03, RNF-04, RNF-05, RNF-06 |
| **UC / fluxo** | UC-03 Registrar nota (inclui registrar histórico); UC-13 Consultar histórico de notas |
| **Entidades** | `HistoricoNota`, `Nota` |
| **ADRs** | ADR-002, ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-028 |

## 3. Escopo

**Incluído**
- Registro na mesma transação do lançamento e da alteração de nota (SPEC-004).
- Tela "Histórico de notas" para Coordenador (turmas sob responsabilidade) e Professor (turmas que leciona), com filtro por turma.

**Fora do escopo**
- Histórico para o estudante (OPEN-028).
- Editar ou apagar registros (RB-16).
- Histórico de frequência (sem RF).

## Telas e evidência de layout

**Gate (OPEN-020):** layout pendente de aprovação. Marca, cores e componentes: [`identidade-visual.md`](identidade-visual.md) (RNF-06). Protótipo: [`layout/prototipo.html`](layout/prototipo.html).

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Histórico de notas (coordenador e professor) | [prototipo.html#historico-notas](layout/prototipo.html#historico-notas) | [ ] | [ ] | — | — |

## 4. Dependências

SPEC-004 (notas) e SPEC-009 (escopo de turmas por perfil).

## 5. Comportamento esperado

**Pré-condições:** coordenador ou professor autenticado.

**Fluxo principal:**
1. Professor lança ou altera uma nota (SPEC-004).
2. Na mesma transação, sistema grava o registro com autor, data e hora, valor anterior (vazio no lançamento) e valor novo.
3. Coordenador ou professor abre "Histórico de notas" e escolhe a turma.
4. Sistema lista os registros da turma, do mais recente para o mais antigo.



**Exceções:**
- Turma fora do escopo: acesso negado.
- Estudante ou administrador: acesso negado.

**Pós-condições:** registro gravado junto com a nota; se a nota falhar, nenhum registro fica (transação).

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-013-01 | Todo lançamento e toda alteração geram exatamente 1 registro, na mesma transação (RB-16). |
| INV-013-02 | Não existe operação para editar ou apagar registro (RB-16). |
| INV-013-03 | Coordenador só vê turmas sob sua responsabilidade; professor só as que leciona (RB-03, RB-04). |

## 7. Modelo de domínio envolvido

`HistoricoNota` (valorAnterior, valorNovo, registradoEm; avaliação, estudante e autor).

## 8. Impacto arquitetural

Migração com a tabela e FKs. Escrita dentro da transação existente de `registrarNota` e `alterarNota`. Consulta com o escopo da turma na própria query (ADR-003).

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| Consultar histórico | turma (opcional) | registros da turma no escopo | turma fora do escopo, perfil sem permissão |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-03, RNF-05 | Escopo por perfil na consulta |
| RNF-04, RNF-06 | Tela aprovada no protótipo |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-013-01 | Professor lança nota 6 e depois altera para 8 | Coordenador consulta o histórico da turma | Vê 2 registros: — → 6 e 6 → 8, com autor e data |
| AC-013-02 | Lançamento de nota com valor inválido | A operação falha | Nenhum registro é gravado |
| AC-013-03 | Coordenador de outra turma | Consulta o histórico | Acesso negado |
| AC-013-04 | Professor responsável | Consulta o histórico da turma que leciona | Vê os registros |
| AC-013-05 | Estudante ou administrador | Consulta o histórico | Acesso negado |

## 12. Casos de teste derivados

1. Registro na mesma transação.
2. Escopo por perfil.
3. Ausência de rotas de alteração.

## 13. Questões em aberto

Nenhuma. OPEN-028 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-014 — Painel do coordenador

**Status:** `aprovada` (layout pendente de aprovação, OPEN-020)

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-014 |
| **Nome** | Painel do coordenador |
| **Objetivo** | Dar ao coordenador uma visão comparativa das turmas sob sua responsabilidade. |
| **Valor** | Identificar rapidamente as turmas com mais estudantes em Risco e mais atrasos. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-21 |
| **RB** | RB-04, RB-09 |
| **RNF** | RNF-01, RNF-03, RNF-04, RNF-06 |
| **UC / fluxo** | Painel do coordenador |
| **Entidades** | `IndicadorAcademico`, `Turma`, `Atividade`, `Entrega` (leitura) |
| **ADRs** | ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-029 |

## 3. Escopo

**Incluído**
- Totais: disciplinas, turmas, estudantes e estudantes em Risco.
- Distribuição Normal/Atenção/Risco/Sem dados por turma (barra empilhada).
- Média e frequência média por turma, com as linhas de 5,0, 6,0 e 75%.
- Turmas que pedem atenção (mais Risco, mais entregas atrasadas), com link para o relatório filtrado.

**Fora do escopo**
- Filtros por período e exportação (já existem no relatório, SPEC-009).
- Gráficos para professor ou estudante.

## Telas e evidência de layout

**Gate (OPEN-020):** layout pendente de aprovação. Marca, cores e componentes: [`identidade-visual.md`](identidade-visual.md) (RNF-06). Protótipo: [`layout/prototipo.html`](layout/prototipo.html).

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Coordenador — Painel com gráficos | [prototipo.html#coordenador-painel](layout/prototipo.html#coordenador-painel) | [ ] | [ ] | — | — |

## 4. Dependências

SPEC-009 (consolidação do relatório).

## 5. Comportamento esperado

**Pré-condições:** coordenador autenticado.

**Fluxo principal:**
1. Coordenador abre o Início.
2. Sistema consolida as turmas sob sua responsabilidade com a mesma regra do relatório (SPEC-009).
3. Sistema mostra totais, distribuição, média e frequência por turma e as turmas que pedem atenção.



**Exceções:**
- Coordenador sem turmas: estado vazio com atalho para cadastrar turma.

**Pós-condições:** nenhuma alteração de dados (consulta).

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-014-01 | Os números são os mesmos do relatório para as mesmas turmas (RB-10). |
| INV-014-02 | Só turmas sob responsabilidade do coordenador (RB-04). |
| INV-014-03 | Situações sempre com cor, símbolo e rótulo (RNF-06). |

## 7. Modelo de domínio envolvido

Sem entidade nova.

## 8. Impacto arquitetural

Reaproveita `gerarRelatorio` e `consolidarTurma` (SPEC-009); ordenação de "turmas que pedem atenção" como função pura em `src/domain`. Gráficos em SVG no servidor, como o gráfico de evolução (SPEC-007).

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| Consultar painel | sessão do coordenador | totais, distribuição, médias e ranking | sem permissão |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-01 | Painel em até 3 s com os dados de demonstração |
| RNF-04, RNF-06 | Tela aprovada no protótipo |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-014-01 | Coordenador com 2 turmas | Abre o Início | Vê os totais, inclusive estudantes em Risco, e um gráfico por turma |
| AC-014-02 | Turma com 3 estudantes em Risco e outra com 1 | Abre o Início | A turma com 3 aparece primeiro em "Turmas que pedem atenção" |
| AC-014-03 | Mesmas turmas | Compara com o relatório | Contagens e médias iguais |
| AC-014-04 | Coordenador de outra turma | Abre o Início | Não vê turmas que não são suas |

## 12. Casos de teste derivados

1. Ordenação das turmas que pedem atenção.
2. Mesmos números do relatório.
3. Escopo do coordenador.

## 13. Questões em aberto

Nenhuma. OPEN-029 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).
