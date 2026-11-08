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
| Layout das SPEC-011 a SPEC-014 (senha, plano do estudante, histórico de notas, painel do coordenador) | `aprovado` (Arthur) | 2026-10-19 |
| SPEC-011 a SPEC-014 marcadas como `implementadas`, condicionadas à aprovação do PR de `development` para `main` que leva este status (cobre os PRs #56 a #60) | `implementada` | 2026-10-19 |
| SPEC-015 e SPEC-016 incluídas a pedido de Arthur, com OPEN-030 a OPEN-034 e OPEN-036 fechadas (decisão humana, Arthur); RF-22 a RF-25, RB-17 a RB-19 e ajustes em RB-04, RB-13 e RB-14; texto das Specs, OPEN-035 e layout aguardando aprovação | `especificada` | 2026-10-22 |
| SPEC-015 e SPEC-016 aprovadas, com OPEN-035 fechada (decisão humana, Arthur) | `aprovada` | 2026-10-22 |
| Layout das SPEC-015 e SPEC-016 (cursos, grade, turmas com curso e os 4 dashboards) | `aprovado` (Arthur) | 2026-10-22 |
| SPEC-015 e SPEC-016 marcadas como `implementadas`: 201 testes e verificação em `docs/verificacao/SPEC-015-016.md`; PR #64 integrado em `development` por Arthur antes da revisão, que Luiz Eduardo faz depois (pedida no PR #64), condicionadas à aprovação do PR de `development` para `main` | `implementada` | 2026-10-23 |
| SPEC-017 a SPEC-022 incluídas a pedido do grupo (Luiz), com OPEN-038 a OPEN-044 fechadas (decisão humana, Luiz); RF-26 a RF-31, RB-20 a RB-24, RF-07 e RB-14 ajustados; texto das Specs e layout aguardando aprovação | `especificada` | 2026-11-05 |
| SPEC-017 a SPEC-022 aprovadas (Luiz) | `aprovada` | 2026-11-05 |
| Layout das SPEC-017 a SPEC-022 (períodos, chamada, auditoria, documentos, importação e notificações) | `aprovado` (Luiz) | 2026-11-05 |
| SPEC-017 a SPEC-022 marcadas como `implementadas`: 268 testes e verificação em `docs/verificacao/SPEC-017-022.md`, condicionadas à aprovação do PR de `development` para `main` | `implementada` | 2026-11-06 |
| SPEC-023 a SPEC-025 incluídas a pedido do grupo (Luiz), com OPEN-045 a OPEN-047 fechadas (decisão humana, Luiz); RF-32 a RF-34, RB-25 e RB-26; texto das Specs e layout aguardando aprovação | `especificada` | 2026-11-06 |
| SPEC-023 a SPEC-025 e layout aprovados (Luiz) | `aprovada` | 2026-11-06 |
| SPEC-023 a SPEC-025 marcadas como `implementadas`: 290 testes e verificação em `docs/verificacao/SPEC-023-025.md`, condicionadas à aprovação do PR de `development` para `main` | `implementada` | 2026-11-06 |
| SPEC-026 a SPEC-035 (Nível 1: secretaria) incluídas a pedido de Arthur, com OPEN-048 a OPEN-057 fechadas (decisão humana, Arthur); RF-35 a RF-43, RB-27 a RB-33; RB-01, RB-13, RB-15, RB-19, RB-20, RB-21, RB-24, RB-25, RF-27 e RF-29 ajustados | `especificada` | 2026-11-06 |
| SPEC-026 a SPEC-035 e layout aprovados (Arthur) | `aprovada` | 2026-11-06 |
| SPEC-026 a SPEC-035 marcadas como `implementadas`: 353 testes e verificação em `docs/verificacao/SPEC-026-035.md`, condicionadas à aprovação do PR de `development` para `main` | `implementada` | 2026-11-06 |
| SPEC-036 a SPEC-043 (Nível 3, sem os itens 28 e 30) incluídas a pedido de Arthur, com OPEN-058 a OPEN-065 fechadas (decisão humana, Arthur); RF-44 a RF-52 e RB-34 a RB-41; RB-20 e RB-30 ajustados | `especificada` | 2026-11-08 |
| SPEC-036 a SPEC-043 e layout aprovados (Arthur) | `aprovada` | 2026-11-08 |

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
| 11 | SPEC-011 | Senha própria e troca no primeiro acesso | SPEC-001, SPEC-010 | `implementada` |
| 12 | SPEC-012 | Plano de recuperação visível ao estudante | SPEC-007, SPEC-008 | `implementada` |
| 13 | SPEC-013 | Histórico de notas | SPEC-004 | `implementada` |
| 14 | SPEC-014 | Painel do coordenador | SPEC-009 | `implementada` |
| 15 | SPEC-015 | Cursos e coordenação por curso | SPEC-002, SPEC-009, SPEC-010 | `implementada` |
| 16 | SPEC-016 | Dashboards por perfil | SPEC-006…SPEC-009, SPEC-012, SPEC-014, SPEC-015 | `implementada` |

Todas as Specs têm texto completo abaixo. As SPEC-001 a SPEC-016 estão `implementadas` (SPEC-011 a 014 pela revisão do PR de `development` para `main` que trouxe este status; SPEC-015 e 016 pela revisão do PR de `development` para `main` que traz este status): critérios, invariantes e testes atendidos (`docs/verificacao/`) e PR revisado por um colega (SPEC-002 a 004 e 010 pela revisão de Luiz Eduardo nos PRs #48 e #53, de `development` para `main`).

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

**Status:** `implementada`

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

**Gate (OPEN-020):** Layout `aprovado` em 2026-10-19 por Arthur. Marca, cores e componentes: [`identidade-visual.md`](identidade-visual.md) (RNF-06). Protótipo: [`layout/prototipo.html`](layout/prototipo.html).

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Primeiro acesso — Defina sua senha | [prototipo.html#primeiro-acesso](layout/prototipo.html#primeiro-acesso) | [x] | [x] | Arthur | 2026-10-19 |
| Alterar minha senha (todos os perfis) | [prototipo.html#minha-senha](layout/prototipo.html#minha-senha) | [x] | [x] | Arthur | 2026-10-19 |

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

**Status:** `implementada`

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

**Gate (OPEN-020):** Layout `aprovado` em 2026-10-19 por Arthur. Marca, cores e componentes: [`identidade-visual.md`](identidade-visual.md) (RNF-06). Protótipo: [`layout/prototipo.html`](layout/prototipo.html).

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Estudante — Painel com plano de recuperação | [prototipo.html#estudante-plano](layout/prototipo.html#estudante-plano) | [x] | [x] | Arthur | 2026-10-19 |

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

**Status:** `implementada`

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

**Gate (OPEN-020):** Layout `aprovado` em 2026-10-19 por Arthur. Marca, cores e componentes: [`identidade-visual.md`](identidade-visual.md) (RNF-06). Protótipo: [`layout/prototipo.html`](layout/prototipo.html).

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Histórico de notas (coordenador e professor) | [prototipo.html#historico-notas](layout/prototipo.html#historico-notas) | [x] | [x] | Arthur | 2026-10-19 |

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

**Status:** `implementada`

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

**Gate (OPEN-020):** Layout `aprovado` em 2026-10-19 por Arthur. Marca, cores e componentes: [`identidade-visual.md`](identidade-visual.md) (RNF-06). Protótipo: [`layout/prototipo.html`](layout/prototipo.html).

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Coordenador — Painel com gráficos | [prototipo.html#coordenador-painel](layout/prototipo.html#coordenador-painel) | [x] | [x] | Arthur | 2026-10-19 |

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

---

# SPEC-015 — Cursos e coordenação por curso

**Status:** `implementada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-015 |
| **Nome** | Cursos e coordenação por curso |
| **Objetivo** | Organizar disciplinas, turmas e estudantes por curso, cada curso com o seu coordenador, permitindo disciplinas compartilhadas entre cursos. |
| **Valor** | A instituição pode ter vários cursos (ex.: Eng. da Computação, Eng. Elétrica, Publicidade e Propaganda) e cada coordenador cuida só dos seus, sem ver os dados dos outros. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-03, RF-04, RF-16, RF-22, RF-23 |
| **RB** | RB-04, RB-13, RB-14, RB-17, RB-18, RB-19 |
| **RNF** | RNF-03, RNF-04, RNF-05, RNF-06 |
| **UC / fluxo** | UC-14 Gerenciar cursos; UC-15 Montar a grade do curso; UC-06 e UC-07 (com curso); UC-11 (curso do estudante) |
| **Entidades** | `Curso` (nova), grade Curso–Disciplina (N:M, nova), `Turma` (curso), `Usuario` (curso do estudante) |
| **ADRs** | ADR-002, ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-030, OPEN-031, OPEN-032, OPEN-033, OPEN-034, OPEN-036 |

## 3. Escopo

**Incluído**
- Entidade `Curso` (nome único) com exatamente 1 coordenador; grade N:M entre curso e disciplina; turma com exatamente 1 curso; estudante com exatamente 1 curso.
- Administrador: tela **Cursos** — lista (nome, coordenador, número de disciplinas, turmas e estudantes), cadastro (nome e coordenador) e troca do coordenador. Conta de Estudante criada em **Contas** exige o curso. Coordenador de curso não pode ser desativado.
- Coordenador: o escopo passa a ser **as turmas dos cursos que coordena** (substitui o coordenador gravado em cada turma). **Disciplinas** por curso: cadastrar nova no curso e adicionar disciplina já existente à grade. **Nova turma** com curso (quando coordena mais de um) e disciplina da grade desse curso. Cadastro de estudante na turma: o estudante fica no curso da turma. Matrícula só de estudante do mesmo curso.
- Relatório, histórico de notas e painel do coordenador com o novo escopo; filtro **Curso** no relatório quando o coordenador tem mais de um curso.
- Professor: sem mudança de escopo (turmas que leciona, de qualquer curso); as telas mostram o curso da turma.
- Estudante: o painel mostra o nome do curso.
- Migração que preserva os dados existentes e seed com os 6 cursos do OPEN-036.

**Fora do escopo**
- Excluir curso, tirar disciplina da grade, apagar disciplina (sem RF).
- Troca de curso do estudante (OPEN-032).
- Turma compartilhada entre cursos (OPEN-031).
- Matriz curricular por semestre, pré-requisitos, vagas (sem RF).

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-10-22 por Arthur. Marca, cores e componentes: [`identidade-visual.md`](identidade-visual.md) (RNF-06). Protótipo: [`layout/prototipo.html`](layout/prototipo.html).

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Administrador — Cursos | [prototipo.html#admin-cursos](layout/prototipo.html#admin-cursos) | [x] | [x] | Arthur | 2026-10-22 |
| Administrador — Nova conta de estudante com curso | [prototipo.html#admin-contas-curso](layout/prototipo.html#admin-contas-curso) | [x] | [x] | Arthur | 2026-10-22 |
| Coordenador — Disciplinas por curso | [prototipo.html#coordenador-grade](layout/prototipo.html#coordenador-grade) | [x] | [x] | Arthur | 2026-10-22 |
| Coordenador — Turmas com curso | [prototipo.html#coordenador-turmas-curso](layout/prototipo.html#coordenador-turmas-curso) | [x] | [x] | Arthur | 2026-10-22 |

## 4. Dependências

SPEC-002 (estrutura acadêmica), SPEC-009 (escopo do relatório), SPEC-010 (administrador e contas).

## 5. Comportamento esperado

**Pré-condições:** administrador ou coordenador autenticado.

**Fluxo principal:**
1. Administrador cria o curso com nome e coordenador (conta ativa com perfil Coordenador).
2. Coordenador abre **Disciplinas**, escolhe o curso e cadastra disciplinas ou adiciona à grade uma disciplina já existente em outro curso.
3. Coordenador cadastra a turma escolhendo curso, disciplina da grade desse curso e professor.
4. Coordenador cadastra estudantes na turma (ficam no curso da turma) ou matricula estudantes do mesmo curso.
5. Relatório, histórico e painel do coordenador mostram só as turmas dos cursos que ele coordena.

**Fluxos alternativos:**
- Administrador troca o coordenador de um curso: a partir da próxima requisição o novo coordenador vê as turmas do curso e o anterior não.
- Administrador cria conta de Estudante em **Contas**: escolhe o curso.

**Exceções:**
- Nome de curso ausente ou repetido; coordenador sem perfil Coordenador ou desativado: operação recusada com o campo indicado.
- Turma com disciplina fora da grade do curso: recusada (RB-18).
- Matrícula de estudante de outro curso: recusada (RB-19).
- Coordenador acessando curso, turma ou grade de curso que não coordena: acesso negado (RB-04).
- Desativar o coordenador de um curso: impedido (RB-14).
- Estudante, professor ou coordenador abrindo **Cursos**: acesso negado.

**Pós-condições:** cada curso com 1 coordenador; cada turma em 1 curso; cada estudante em 1 curso.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-015-01 | Cada curso tem exatamente 1 coordenador, com perfil Coordenador e ativo no momento da escolha (RB-17). |
| INV-015-02 | Não existem dois cursos com o mesmo nome. |
| INV-015-03 | Cada turma pertence a exatamente 1 curso e a sua disciplina está na grade desse curso (RB-18). |
| INV-015-04 | Uma disciplina aparece no máximo uma vez na grade de cada curso e pode estar na grade de vários cursos (OPEN-031). |
| INV-015-05 | Todo estudante pertence a exatamente 1 curso; os outros perfis não têm curso (RB-19). |
| INV-015-06 | Só há matrícula de estudante em turma do seu curso (RB-19). |
| INV-015-07 | O coordenador só vê e altera turmas, grade e estudantes dos cursos que coordena, com o filtro dentro da própria consulta (RB-04, ADR-003). |
| INV-015-08 | O administrador gerencia cursos sem acessar dados acadêmicos (RB-13). |
| INV-015-09 | O coordenador de ao menos um curso não pode ser desativado (RB-14). |

## 7. Modelo de domínio envolvido

`Curso` (id, nome; coordenador). Grade `CursoDisciplina` (curso, disciplina; chave composta). `Turma` ganha o curso e perde o coordenador gravado. `Usuario` ganha o curso, preenchido só para Estudante. Ver [`modelo-dominio.md`](modelo-dominio.md).

## 8. Impacto arquitetural

- Migração: tabelas `Curso` e `CursoDisciplina`; `Turma.cursoId` obrigatório (FK, `Restrict`) no lugar de `Turma.coordenadorId`; `Usuario.cursoId` com CHECK (preenchido se e somente se o perfil for Estudante). A migração preenche os dados existentes: cada coordenador com turmas ganha um curso provisório com essas turmas e as disciplinas delas na grade, e cada estudante recebe o curso da sua primeira matrícula. O seed organiza os 6 cursos (OPEN-036).
- Escopo do coordenador reescrito em um só lugar (`src/server/dados`): `turma: { curso: { coordenadorId } }`, usado pelo relatório, histórico, painel e cadastros (ADR-003).
- Validações novas como funções puras em `src/domain` (disciplina na grade, curso do estudante igual ao da turma), com um teste por RB (DA-07).
- Recurso novo `cursos` só para o Administrador em `src/domain/autorizacao.ts`; o administrador continua fora dos recursos acadêmicos.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| Listar cursos | sessão do administrador | cursos com coordenador e totais | sem permissão |
| Cadastrar curso | nome, coordenador | curso criado | nome ausente ou repetido, coordenador inválido, sem permissão |
| Trocar coordenador | curso, coordenador | curso atualizado | coordenador inválido, curso inexistente, sem permissão |
| Cadastrar disciplina | curso, nome, carga horária | disciplina na grade do curso | dado inválido, curso fora do escopo |
| Adicionar disciplina à grade | curso, disciplina | disciplina na grade | já está na grade, curso fora do escopo |
| Cadastrar turma | curso, nome, período, disciplina, professor | turma criada | disciplina fora da grade, curso fora do escopo, dado inválido |
| Matricular estudante | turma, e-mail | matrícula criada | estudante de outro curso, turma fora do escopo |
| Criar conta de Estudante (admin) | nome, e-mail, senha, perfil, curso | conta criada | curso ausente ou inexistente, demais erros da SPEC-010 |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-03, RNF-05 | Escopo por curso na própria consulta; administrador sem dados acadêmicos |
| RNF-04, RNF-06 | Telas aprovadas no protótipo, desktop e celular |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-015-01 | Administrador e a coordenadora ativa Paula | Cria o curso "Engenharia Elétrica" com Paula | O curso aparece na lista com Paula como coordenadora |
| AC-015-02 | Já existe "Engenharia Elétrica" | Administrador cria outro curso com o mesmo nome, ou sem nome | Cadastro recusado, com o campo indicado |
| AC-015-03 | Um professor e um coordenador desativado | Administrador escolhe um deles como coordenador | Operação recusada |
| AC-015-04 | Paula coordena Eng. Elétrica | Administrador troca para Marina | Marina vê as turmas de Eng. Elétrica e Paula recebe acesso negado nelas |
| AC-015-05 | Marina coordena Eng. da Computação | Cadastra a disciplina "Arquitetura de Computadores" nesse curso | A disciplina aparece só na grade de Eng. da Computação |
| AC-015-06 | Cálculo I está na grade de Eng. da Computação | Paula adiciona Cálculo I à grade de Eng. Elétrica, e tenta adicionar de novo | A mesma disciplina fica nas duas grades; a segunda tentativa avisa e não duplica |
| AC-015-07 | Disciplina fora da grade de Eng. Elétrica | Paula cria turma de Eng. Elétrica com ela | Turma recusada |
| AC-015-08 | Marina coordena 2 cursos | Cria turma escolhendo Ciência da Computação | A turma fica nesse curso; o coordenador de outro curso não a vê |
| AC-015-09 | Turma de Publicidade e Propaganda | Marina abre a turma ou a grade desse curso | Acesso negado |
| AC-015-10 | Turma de Eng. da Computação | Marina cadastra um estudante novo nela | O estudante pertence a Eng. da Computação |
| AC-015-11 | Estudante de Publicidade e Propaganda | Marina tenta matriculá-lo numa turma de Eng. da Computação | Matrícula recusada |
| AC-015-12 | Administrador em Contas | Cria conta de Estudante sem curso; depois com curso | A primeira é recusada com o campo indicado; a segunda é criada no curso |
| AC-015-13 | Paula coordena Eng. Elétrica | Administrador tenta desativá-la | Desativação impedida, com a explicação |
| AC-015-14 | Administrador | Abre Cursos; tenta abrir o relatório | Vê só nome, coordenador e totais; o relatório continua negado |
| AC-015-15 | Marina coordena 2 cursos | Abre o relatório e o histórico de notas | Só turmas dos seus cursos; o relatório filtra por curso |
| AC-015-16 | Professor com turmas em 2 cursos | Abre as suas turmas | Vê as turmas dos 2 cursos, com o curso indicado |
| AC-015-17 | Estudante, professor ou coordenador | Abre Cursos | Acesso negado |

## 12. Casos de teste derivados

1. Regras puras: disciplina na grade (RB-18), curso do estudante igual ao da turma (RB-19), coordenador válido (RB-17).
2. Cadastro e troca de coordenador pelo administrador; nome único; desativação bloqueada.
3. Grade: criar e adicionar existente sem duplicar.
4. Escopo do coordenador por curso em turmas, relatório, histórico e painel; troca de coordenador muda o escopo.
5. Matrícula e cadastro de estudante com curso; conta de estudante pelo administrador exige curso.
6. Negação por perfil na tela e na API de cursos.

## 13. Questões em aberto

Nenhuma. OPEN-030 a OPEN-034 e OPEN-036 fechadas.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-016 — Dashboards por perfil

**Status:** `implementada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-016 |
| **Nome** | Dashboards por perfil |
| **Objetivo** | Todo perfil entra direto num dashboard com os números e gráficos que mais importam para ele; as demais funções ficam no menu lateral. |
| **Valor** | Em poucos segundos cada pessoa sabe o que precisa de atenção: o estudante, a própria situação; o professor, as turmas e os alunos em risco; o coordenador, os cursos; o administrador, as contas. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-10, RF-12, RF-13, RF-19, RF-21, RF-24, RF-25 |
| **RB** | RB-02, RB-03, RB-04, RB-08, RB-09, RB-12, RB-13 |
| **RNF** | RNF-01, RNF-03, RNF-04, RNF-05, RNF-06 |
| **UC / fluxo** | UC-16 Consultar o dashboard inicial |
| **Entidades** | `Usuario` (`criadaEm`, novo), leitura de `IndicadorAcademico`, `Turma`, `Curso`, `Atividade`, `Entrega`, `PlanoRecuperacao` |
| **ADRs** | ADR-001, ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-034, OPEN-035 |

## 3. Escopo

**Incluído**
- Depois do login (e em `/`), cada perfil abre o seu dashboard: Estudante `/estudante`, Professor `/professor`, Coordenador `/coordenador`, Administrador `/admin` (novo; antes abria em Contas). O item do menu passa a se chamar **Dashboard**.
- **Estudante:** curso no cabeçalho; cartões com média geral, frequência geral, turmas em Atenção ou Risco e atividades pendentes ou atrasadas; alertas (SPEC-006); plano de recuperação (SPEC-012); gráfico **média e frequência por disciplina** com as linhas de 5,0, 6,0 e 75%; **próximos prazos** (7 dias); cartões das turmas com a evolução das notas e atividades que pedem atenção (SPEC-007).
- **Professor:** cartões com turmas, estudantes, estudantes em Risco, entregas atrasadas e planos ativos; alertas (SPEC-006); **situação por turma**; **média e frequência por turma**; **próximos prazos** das atividades das suas turmas com entregas registradas; **planos de recuperação ativos** com progresso; atalhos para as turmas.
- **Coordenador:** filtro por curso (quando coordena mais de um); cartões com cursos, disciplinas, turmas, estudantes, estudantes em Risco e planos ativos; **situação por curso**; os gráficos e a tabela da SPEC-014 por turma.
- **Administrador:** cartões com contas ativas, desativadas, aguardando a troca da senha provisória e cursos; gráfico **contas por perfil**; tabela **cursos** (coordenador, disciplinas, turmas, estudantes); **contas criadas recentemente** (as 5 últimas); atalhos para Contas e Cursos. Nenhum dado acadêmico (RB-13).
- `Usuario.criadaEm` (data de criação da conta), preenchido para as contas existentes na migração.

**Fora do escopo**
- Dashboards configuráveis, exportar gráficos, filtros por período (sem RF).
- Notificações por e-mail ou push (OPEN-004).
- Gravar qualquer número do dashboard: tudo é calculado na leitura (OPEN-035).

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-10-22 por Arthur. Marca, cores e componentes: [`identidade-visual.md`](identidade-visual.md) (RNF-06). Protótipo: [`layout/prototipo.html`](layout/prototipo.html).

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Estudante — Dashboard | [prototipo.html#dash-estudante](layout/prototipo.html#dash-estudante) | [x] | [x] | Arthur | 2026-10-22 |
| Professor — Dashboard | [prototipo.html#dash-professor](layout/prototipo.html#dash-professor) | [x] | [x] | Arthur | 2026-10-22 |
| Coordenador — Dashboard | [prototipo.html#dash-coordenador](layout/prototipo.html#dash-coordenador) | [x] | [x] | Arthur | 2026-10-22 |
| Administrador — Dashboard | [prototipo.html#dash-admin](layout/prototipo.html#dash-admin) | [x] | [x] | Arthur | 2026-10-22 |

## 4. Dependências

SPEC-006, SPEC-007, SPEC-008, SPEC-009, SPEC-012, SPEC-014 e SPEC-015 (escopo por curso).

## 5. Comportamento esperado

**Pré-condições:** usuário autenticado, conta ativa e senha própria definida (RB-14, RB-15).

**Fluxo principal:**
1. Usuário entra no sistema.
2. Sistema redireciona para o dashboard do perfil.
3. Sistema calcula na hora, só com os dados do escopo do usuário, os cartões, gráficos e listas do perfil.
4. Usuário segue pelos atalhos ou pelo menu lateral.

**Fluxos alternativos:**
- Coordenador escolhe um curso no filtro: o dashboard mostra só as turmas desse curso.

**Exceções:**
- Sem dados no escopo: estado vazio com orientação (estudante sem turma, professor sem turma, coordenador sem curso).
- Filtro com curso que o coordenador não coordena: ignorado; mostra só os cursos dele.
- Perfil abrindo o dashboard de outro perfil: acesso negado.

**Pós-condições:** nenhuma alteração de dados (consulta).

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-016-01 | Cada dashboard só usa dados do escopo do perfil, filtrados na própria consulta (RB-02, RB-03, RB-04, ADR-003). |
| INV-016-02 | Os números por turma do professor e do coordenador são os mesmos do relatório (SPEC-009, INV-014-01). |
| INV-016-03 | Média geral do estudante = média simples das médias das turmas com nota; frequência geral = média simples das frequências registradas; sem nenhum valor, mostra "—" (OPEN-035). |
| INV-016-04 | Próximos prazos = atividades com prazo de hoje até 7 dias depois (horário de Brasília) ainda sem entrega do estudante (OPEN-035, OPEN-010). |
| INV-016-05 | O dashboard do administrador não contém nota, frequência, situação, plano nem relatório (RB-13). |
| INV-016-06 | Nada do dashboard é gravado; tudo é derivado na leitura (OPEN-035). |
| INV-016-07 | Situações sempre com cor, símbolo e rótulo (RNF-06). |

## 7. Modelo de domínio envolvido

Sem entidade nova. `Usuario` ganha `criadaEm`.

## 8. Impacto arquitetural

- Cálculos novos (média geral, frequência geral, próximos prazos, contagem de contas por perfil) como funções puras em `src/domain/dashboard.ts`, com um teste por invariante.
- Consultas por perfil em `src/server/academico/` reaproveitando `consultarPainel` (SPEC-007), `consultarAlertas` (SPEC-006), `gerarRelatorio`/`consolidarTurma` (SPEC-009) e `consultarPainelCoordenador` (SPEC-014).
- Gráficos em SVG gerados no servidor, como os da SPEC-007 e da SPEC-014 (sem biblioteca nova).
- Migração: coluna `Usuario.criadaEm` com padrão `now()`.
- Redirecionamento do login e de `/` para `/admin` no caso do administrador; recurso `painelAdministrador` em `src/domain/autorizacao.ts`.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| Consultar dashboard do estudante | sessão | cartões, alertas, planos, gráficos, prazos, turmas | sem permissão |
| Consultar dashboard do professor | sessão | cartões, alertas, gráficos por turma, prazos, planos | sem permissão |
| Consultar dashboard do coordenador | sessão, curso (opcional) | cartões, situação por curso, gráficos por turma, turmas que pedem atenção | sem permissão |
| Consultar dashboard do administrador | sessão | contagens de contas, cursos com totais, contas recentes | sem permissão |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-01 | Cada dashboard em até 3 s com os dados de demonstração |
| RNF-03, RNF-05 | Escopo por perfil na consulta; administrador sem dados acadêmicos |
| RNF-04, RNF-06 | Telas aprovadas no protótipo, desktop e celular, sem rolagem horizontal |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-016-01 | Uma conta de cada perfil | Entra no sistema | Cai direto no dashboard do próprio perfil |
| AC-016-02 | Estudante com médias 7,0 e 5,0 e uma turma ainda sem nota | Abre o dashboard | Média geral 6,0 |
| AC-016-03 | Atividades sem entrega com prazo em 3 dias e em 10 dias, e uma já entregue com prazo em 2 dias | Estudante abre o dashboard | Só a de 3 dias aparece em Próximos prazos |
| AC-016-04 | Dois estudantes | Um abre o dashboard | Não vê nenhum dado do outro |
| AC-016-05 | Professor com 2 turmas | Abre o dashboard | Cartões e gráficos por turma iguais ao relatório; planos ativos com progresso |
| AC-016-06 | Turma de outro professor | Professor abre o dashboard | A turma não aparece |
| AC-016-07 | Coordenador com 2 cursos | Filtra por um curso; depois tenta filtrar por curso de outro coordenador | Só as turmas do curso escolhido; no segundo caso, só os próprios cursos |
| AC-016-08 | Coordenador com 2 cursos | Abre o dashboard sem filtro | Vê a situação por curso dos 2 cursos |
| AC-016-09 | Administrador | Abre o dashboard | Contagens por perfil e ativas/desativadas iguais às da lista de contas; cursos com totais; nenhuma nota, frequência ou situação |
| AC-016-10 | Administrador acaba de criar uma conta | Abre o dashboard | A conta aparece primeiro em Contas criadas recentemente |
| AC-016-11 | Professor sem turmas e coordenador sem cursos | Abrem o dashboard | Estado vazio com orientação |
| AC-016-12 | Qualquer perfil | Abre o dashboard em 390 px de largura | Tudo legível, sem rolagem horizontal |

## 12. Casos de teste derivados

1. Funções puras: média geral, frequência geral, próximos prazos, contas por perfil.
2. Redirecionamento após login por perfil.
3. Escopo de cada dashboard e mesmos números do relatório.
4. Filtro por curso do coordenador.
5. Dashboard do administrador sem dados acadêmicos.

## 13. Questões em aberto

Nenhuma. OPEN-034 e OPEN-035 fechadas.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-017 — Período letivo

**Status:** `implementada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-017 |
| **Nome** | Período letivo |
| **Objetivo** | Organizar as turmas por semestre (2026/1, 2026/2) e permitir encerrar um semestre, tornando as turmas dele somente leitura. |
| **Valor** | O semestre fechado não muda mais por engano; relatórios e dashboards separam o semestre atual dos anteriores; o histórico escolar ganha base. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-26, RF-04 |
| **RB** | RB-14 (ajuste), RB-20 |
| **RNF** | RNF-03, RNF-04, RNF-05, RNF-06 |
| **UC / fluxo** | UC-17 Gerenciar períodos letivos |
| **Entidades** | `PeriodoLetivo` (nova), `Turma` (`periodo` passa a ser chave estrangeira para o nome do período) |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-040, OPEN-044 (dados de demonstração) |

## 3. Escopo

**Incluído**
- Tela **Períodos letivos** do administrador (`/admin/periodos`): lista com nome, status e número de turmas; **novo período** (nome AAAA/1 ou AAAA/2); **encerrar** e **reabrir**.
- Turma ligada a 1 período; a nova turma do coordenador escolhe entre os períodos **abertos**. A migração cria um período (Aberto) para cada texto de período já usado e liga as turmas.
- **Trava (RB-20):** em turma de período encerrado são recusados: avaliação, nota, chamada (SPEC-018), atividade, entrega (registrar e desfazer), plano de recuperação (criar, itens, encerrar), cadastro e matrícula de estudante, importação (SPEC-021) e troca de professor.
- Telas de lançamento do professor (Notas, Chamada, Atividades, planos) listam só turmas de períodos abertos. A tela Turmas do coordenador mostra todas, com a coluna Período e o selo **Encerrado**; o detalhe de turma encerrada não mostra os formulários.
- **Relatório** e **dashboard do coordenador**: filtro **Período** (padrão: períodos abertos; opções: cada período). Dashboards do estudante e do professor e os alertas: só turmas de períodos abertos.
- Ajuste do RB-14: o professor só fica impedido de ser desativado por turmas de períodos **abertos**.

**Fora do escopo**
- Datas de início e fim do período, calendário acadêmico, renomear ou apagar período (sem RF).
- Copiar turmas de um período para o outro.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-05 por Luiz. Protótipo: [`layout/prototipo.html`](layout/prototipo.html).

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Administrador — Períodos letivos | [prototipo.html#admin-periodos](layout/prototipo.html#admin-periodos) | [x] | [x] | Luiz | 2026-11-05 |
| Coordenador — Turmas com período | [prototipo.html#coord-turmas-periodo](layout/prototipo.html#coord-turmas-periodo) | [x] | [x] | Luiz | 2026-11-05 |

## 4. Dependências

SPEC-002, SPEC-009, SPEC-010, SPEC-015, SPEC-016.

## 5. Comportamento esperado

**Pré-condições:** administrador autenticado (cadastro, encerramento e reabertura); coordenador autenticado (turma).

**Fluxo principal (encerrar):**
1. Administrador abre Períodos letivos e escolhe **Encerrar** em 2026/1.
2. Sistema pede confirmação, muda o status para Encerrado, grava a data e a auditoria (SPEC-019).
3. A partir daí, toda escrita acadêmica nas turmas de 2026/1 é recusada com a mensagem do período encerrado.

**Fluxos alternativos:**
- Reabrir: status volta a Aberto; as escritas voltam a ser aceitas.
- Novo período: nome no formato AAAA/1 ou AAAA/2; nasce Aberto.

**Exceções:**
- Nome fora do formato ou repetido: recusado, com o campo indicado.
- Nova turma em período encerrado ou inexistente: recusada.
- Escrita em turma de período encerrado: 409 "O período 2026/1 está encerrado: a turma é somente leitura."
- Perfil que não é administrador nas rotas de período: acesso negado.

**Pós-condições:** status do período e auditoria gravados.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-017-01 | Toda turma pertence a exatamente 1 período letivo (FK obrigatória). |
| INV-017-02 | Nome de período é único e segue AAAA/1 ou AAAA/2. |
| INV-017-03 | Nenhuma escrita acadêmica é gravada em turma de período encerrado (RB-20), verificado no caso de uso antes da escrita. |
| INV-017-04 | Nova turma só em período aberto. |
| INV-017-05 | Dashboards do estudante e do professor e os alertas consideram só turmas de períodos abertos; relatório e dashboard do coordenador sem filtro também. |
| INV-017-06 | Só o administrador cadastra, encerra e reabre período; isso não dá a ele acesso a dado acadêmico (RB-13). |
| INV-017-07 | Professor com turma apenas em períodos encerrados pode ser desativado; com turma em período aberto, não (RB-14). |

## 7. Modelo de domínio envolvido

Nova entidade **PeriodoLetivo** (id, nome, status {Aberto, Encerrado}, criadoEm, encerradoEm). Um período tem de 0 a N turmas; cada turma pertence a exatamente 1 período.

## 8. Impacto arquitetural

- Regras puras em `src/domain/periodos.ts` (formato do nome, período aberto, mensagem da trava).
- Verificação da trava num único ponto (`garantirPeriodoAberto(turmaId, tx)` em `src/server/academico/periodos.ts`), chamado por todos os casos de uso de escrita listados.
- Migração: tabela `PeriodoLetivo`, um período Aberto para cada texto já usado e `Turma.periodo` como chave estrangeira para `PeriodoLetivo.nome` (o nome não muda; assim as consultas que já liam `periodo` continuam iguais).
- `filtroTurmasDoEscopo` ganha a opção de restringir a períodos abertos ou a um período.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| `GET /api/periodos` | sessão (admin ou coordenador) | períodos com status e número de turmas | sem permissão |
| `POST /api/periodos` | nome | período criado (Aberto) | campo inválido, nome repetido, sem permissão |
| `POST /api/periodos/:id/encerrar` | — | período Encerrado | não encontrado, sem permissão |
| `POST /api/periodos/:id/reabrir` | — | período Aberto | não encontrado, sem permissão |
| `POST /api/turmas` | `periodo` (nome de um período aberto) | turma criada | período encerrado ou inexistente |
| Escritas acadêmicas | (as de sempre) | — | 409 período encerrado |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-03, RNF-05 | Rotas de período só para o administrador; trava no servidor, não só na tela |
| RNF-04, RNF-06 | Telas do protótipo aprovadas, desktop e celular |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-017-01 | Administrador | Cria o período 2027/1 | Período Aberto na lista |
| AC-017-02 | Administrador | Cria "2027-1", "2027/3" ou um nome repetido | Recusado com o campo indicado |
| AC-017-03 | Período 2026/1 encerrado | Professor lança nota, registra chamada, cria atividade ou registra entrega numa turma dele | 409 com a mensagem do período encerrado; nada gravado |
| AC-017-04 | Período 2026/1 encerrado | Coordenador matricula estudante, troca o professor ou cria turma em 2026/1 | Recusado |
| AC-017-05 | Período encerrado e reaberto | Professor lança nota | Nota gravada |
| AC-017-06 | Turmas em 2026/1 (encerrado) e 2026/2 (aberto) | Estudante e professor abrem o dashboard; coordenador abre o relatório sem filtro | Só as turmas de 2026/2 |
| AC-017-07 | Coordenador | Filtra o relatório por 2026/1 | Só as turmas de 2026/1 dos cursos dele |
| AC-017-08 | Professor só com turmas de período encerrado | Administrador desativa a conta | Conta desativada |
| AC-017-09 | Coordenador ou professor | Tenta criar, encerrar ou reabrir período | Acesso negado |

## 12. Casos de teste derivados

1. Funções puras: formato do nome, mensagem da trava.
2. Cadastro, encerramento e reabertura pelo administrador; acesso negado aos demais.
3. Trava em cada escrita acadêmica (RB-20).
4. Filtros de período no relatório, nos dashboards e nos alertas.
5. Desativação de professor com turmas só em período encerrado (RB-14).

## 13. Questões em aberto

Nenhuma. OPEN-040 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-018 — Chamada por aula

**Status:** `implementada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-018 |
| **Nome** | Chamada por aula |
| **Objetivo** | O professor faz a chamada de cada aula e a frequência passa a ser calculada pelas presenças. |
| **Valor** | Frequência confiável e auditável, aula a aula, como num sistema acadêmico de verdade; o professor não precisa calcular percentual. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-07 (alterado), RF-27 |
| **RB** | RB-03, RB-05, RB-10, RB-20, RB-21 |
| **RNF** | RNF-01, RNF-03, RNF-04, RNF-06 |
| **UC / fluxo** | UC-08 Registrar frequência (reescrito como chamada) |
| **Entidades** | `Aula` e `Presenca` (novas), `Frequencia` (passa a ser derivada da chamada), `IndicadorAcademico` |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-041 |

## 3. Escopo

**Incluído**
- Tela **Chamada** do professor (substitui Frequência): escolhe a turma; vê as aulas registradas (data, presentes de quantos) e a frequência e situação de cada estudante; **nova chamada**: data (padrão: hoje) e a lista dos matriculados, todos marcados como presentes; o professor desmarca as faltas e salva.
- **Corrigir** a chamada de uma aula já registrada (mesma tela, com as marcações gravadas).
- Ao salvar: grava a aula e as presenças, recalcula a frequência de cada estudante da aula (RB-21) e o indicador (RB-10), tudo numa transação, e grava a auditoria (SPEC-019).
- Remoção do lançamento manual do percentual (`POST /api/frequencias`).

**Fora do escopo**
- Excluir aula, chamada por horário (mais de uma aula no mesmo dia), justificativa de falta, chamada feita pelo estudante (sem RF).

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-05 por Luiz.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Professor — Chamada | [prototipo.html#prof-chamada](layout/prototipo.html#prof-chamada) | [x] | [x] | Luiz | 2026-11-05 |

## 4. Dependências

SPEC-003, SPEC-005, SPEC-017.

## 5. Comportamento esperado

**Pré-condições:** professor autenticado, turma que leciona, período aberto.

**Fluxo principal:**
1. Professor abre Chamada e escolhe a turma.
2. Informa a data e marca as faltas.
3. Sistema grava a aula com uma presença por estudante matriculado, recalcula frequência e indicador de cada um e grava a auditoria.
4. Tela mostra a aula na lista e as frequências atualizadas.

**Fluxos alternativos:**
- Data de aula já registrada: a chamada é corrigida (substitui as presenças da aula).

**Exceções:**
- Data futura ou inválida: recusada.
- Lista diferente dos matriculados (faltando estudante ou com estudante de fora): recusada.
- Turma de outro professor: não encontrada. Período encerrado: 409 (RB-20).

**Pós-condições:** aula, presenças, frequências, indicadores e auditoria gravados juntos.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-018-01 | No máximo 1 aula por turma e data (índice único). |
| INV-018-02 | Uma presença por estudante e aula; só estudantes matriculados na turma. |
| INV-018-03 | Frequência = presenças ÷ aulas em que o estudante constou × 100 (RB-21); sem aula, não registrada. |
| INV-018-04 | Aula, presenças, frequência e indicador são gravados na mesma transação (RB-10). |
| INV-018-05 | Só o professor da turma registra ou corrige a chamada (RB-03). |
| INV-018-06 | Data da aula não pode ser futura (horário de Brasília). |

## 7. Modelo de domínio envolvido

Novas entidades **Aula** (id, data, registradaEm), de exatamente 1 turma, e **Presenca** (presente sim/não), de exatamente 1 aula e 1 estudante. `Frequencia` continua guardando o percentual vigente, agora calculado pela chamada.

## 8. Impacto arquitetural

- Cálculo puro em `src/domain/frequencia.ts` (`frequenciaPelaChamada`).
- Caso de uso `registrarChamada` em `src/server/academico/chamada.ts`, na mesma transação de `recalcularIndicador`.
- Migração: tabelas `Aula` e `Presenca`.
- O seed gera as aulas da demonstração com as presenças que dão as frequências dos estudantes.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| `GET /api/aulas?turmaId=` | sessão (professor da turma) | aulas com presentes/total; presenças de cada aula | não encontrada |
| `POST /api/aulas` | turmaId, data, presencas [{estudanteId, presente}] | aula gravada, frequências novas | data inválida, lista inválida, não encontrada, período encerrado |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-01 | Chamada de 30 estudantes gravada em até 3 s |
| RNF-03 | Escopo do professor dentro da query |
| RNF-04, RNF-06 | Tela aprovada, desktop e celular |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-018-01 | Turma com 3 estudantes | Professor registra a chamada com 1 falta | Aula gravada; frequência 100%, 100% e 0% |
| AC-018-02 | 4 aulas, estudante com 3 presenças | Consulta a turma | Frequência 75%, situação conforme RB-05 |
| AC-018-03 | Estudante com 4 presenças em 5 aulas (80%) | Professor corrige uma aula para falta | Frequência 60% e situação Risco |
| AC-018-04 | Estudante matriculado depois de 2 aulas | Professor registra a 3ª aula com presença | Frequência 100% (só a aula em que constou) |
| AC-018-05 | Professor | Registra chamada com data futura, faltando estudante ou com estudante de fora | Recusada, nada gravado |
| AC-018-06 | Turma de outro professor ou estudante | Tenta registrar chamada | Não encontrada / acesso negado |
| AC-018-07 | Qualquer chamada | É registrada | Indicador recalculado na mesma transação |

## 12. Casos de teste derivados

1. Função pura `frequenciaPelaChamada` (RB-21).
2. Registro, correção, data futura, lista inválida, escopo.
3. Recalcular indicador na mesma transação.

## 13. Questões em aberto

Nenhuma. OPEN-041 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-019 — Auditoria

**Status:** `implementada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-019 |
| **Nome** | Auditoria |
| **Objetivo** | Registrar quem fez cada alteração, quando, e de quanto para quanto, e mostrar esse registro a quem é responsável. |
| **Valor** | Transparência e segurança: toda mudança de nota, chamada, matrícula, conta ou curso pode ser explicada depois. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-28 |
| **RB** | RB-04, RB-13, RB-22 |
| **RNF** | RNF-02, RNF-03, RNF-05, RNF-06 |
| **UC / fluxo** | UC-18 Consultar auditoria |
| **Entidades** | `RegistroAuditoria` (nova) |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-039 |

## 3. Escopo

**Incluído**
- Registro gravado na mesma transação de toda escrita. **Administrativas:** conta criada, desativada e reativada (pelo administrador); curso criado; coordenação trocada; período criado, encerrado e reaberto. **Acadêmicas:** disciplina criada; disciplina adicionada à grade; turma criada; professor trocado; estudante cadastrado; estudante matriculado; importação; avaliação criada; nota lançada e alterada; chamada registrada e corrigida; atividade criada; entrega registrada e desfeita; plano criado e encerrado; item de plano adicionado e concluído.
- Cada registro: autor, data e hora, ação, descrição legível ("Nota de Carla Mendes em Prova 1 (ES-A): 5,0 → 6,5"), curso e turma envolvidos e os valores anteriores e novos.
- Tela **Auditoria** do administrador (`/admin/auditoria`, só administrativas) e do coordenador (`/coordenador/auditoria`, só acadêmicas dos cursos dele), mais recentes primeiro, com filtro por tipo de ação e páginas de 50.

**Fora do escopo**
- Registrar consultas, login e troca da própria senha; exportar a auditoria; auditoria para professor e estudante (sem RF).
- Senhas nunca entram no registro (nem em texto nem em hash).

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-05 por Luiz.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Coordenador — Auditoria | [prototipo.html#coord-auditoria](layout/prototipo.html#coord-auditoria) | [x] | [x] | Luiz | 2026-11-05 |
| Administrador — Auditoria | [prototipo.html#admin-auditoria](layout/prototipo.html#admin-auditoria) | [x] | [x] | Luiz | 2026-11-05 |

## 4. Dependências

SPEC-002 a SPEC-005, SPEC-008, SPEC-010, SPEC-015, SPEC-017, SPEC-018.

## 5. Comportamento esperado

**Pré-condições:** coordenador ou administrador autenticado.

**Fluxo principal:**
1. Usuário faz qualquer escrita; o caso de uso grava o registro na mesma transação.
2. Coordenador ou administrador abre Auditoria e vê os registros do seu escopo, mais recentes primeiro.
3. Filtra por tipo de ação e navega pelas páginas.

**Exceções:**
- Escrita que falha: nenhum registro (a transação inteira volta).
- Professor ou estudante na tela: acesso negado.

**Pós-condições:** nenhuma alteração na consulta.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-019-01 | Todo caso de uso de escrita grava exatamente 1 registro por ação, na mesma transação (RB-22). |
| INV-019-02 | Não há rota nem função de alteração ou exclusão de registro. |
| INV-019-03 | O coordenador só vê registros acadêmicos de cursos que coordena (filtro na query, ADR-003). |
| INV-019-04 | O administrador só vê registros administrativos; nenhum dado acadêmico (RB-13). |
| INV-019-05 | Nenhum registro contém senha ou hash de senha. |

## 7. Modelo de domínio envolvido

Nova entidade **RegistroAuditoria** (id, categoria {Administrativa, Acadêmica}, ação, descrição, antes, depois, registradoEm), com exatamente 1 autor (Usuario) e, quando acadêmica, o curso e, se houver, a turma.

## 8. Impacto arquitetural

- Ações, categorias e textos em `src/domain/auditoria.ts` (puro).
- `auditar(tx, ...)` em `src/server/dados/auditoria.ts`, chamado dentro das transações dos casos de uso.
- Migração: tabela `RegistroAuditoria` com índices por data e por curso.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| `GET /api/auditoria` | sessão, ação (opcional), página | registros do escopo, total de páginas | sem permissão |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-02, RNF-05 | Nenhuma senha no registro; escopo por perfil |
| RNF-03 | Filtro de escopo na query |
| RNF-04, RNF-06 | Tela aprovada, desktop e celular |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-019-01 | Professor altera uma nota de 5,0 para 6,5 | Coordenador do curso abre Auditoria | Registro com autor, data, "5,0 → 6,5" |
| AC-019-02 | Chamada, entrega, plano, matrícula e importação realizadas | Coordenador do curso abre Auditoria | Um registro para cada ação |
| AC-019-03 | Registros de dois cursos | Coordenador de um deles abre Auditoria | Só os do próprio curso |
| AC-019-04 | Administrador cria conta e encerra período | Abre Auditoria | Registros administrativos; nenhum acadêmico |
| AC-019-05 | Escrita recusada (ex.: nota 11) | — | Nenhum registro gravado |
| AC-019-06 | Conta criada com senha | Registro gravado | Não contém a senha nem o hash |
| AC-019-07 | Professor ou estudante | Abre Auditoria | Acesso negado |

## 12. Casos de teste derivados

1. Funções puras de descrição (valores com vírgula, ações).
2. Um registro por caso de uso de escrita; nada quando falha.
3. Escopo de coordenador e administrador; filtro e paginação.

## 13. Questões em aberto

Nenhuma. OPEN-039 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-020 — Boletim e histórico escolar

**Status:** `implementada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-020 |
| **Nome** | Boletim e histórico escolar |
| **Objetivo** | Emitir o boletim de um período e o histórico escolar completo do estudante, prontos para imprimir ou salvar em PDF. |
| **Valor** | O documento que estudante e coordenação esperam de um sistema acadêmico, com o resultado de cada disciplina. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-29 |
| **RB** | RB-02, RB-04, RB-09, RB-13, RB-24 |
| **RNF** | RNF-01, RNF-03, RNF-04, RNF-05, RNF-06 |
| **UC / fluxo** | UC-19 Emitir boletim e histórico |
| **Entidades** | leitura de `Usuario`, `Curso`, `PeriodoLetivo`, `Turma`, `Disciplina`, `Avaliacao`, `Nota`, `Frequencia`, `Aula`, `Presenca`, `IndicadorAcademico` |
| **ADRs** | ADR-001, ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-038, OPEN-044 |

## 3. Escopo

**Incluído**
- **Boletim** de um período (padrão: o período aberto mais recente em que o estudante tem turma): por turma, disciplina, turma, professor, carga horária, nota de cada avaliação, média, aulas e presenças, frequência, situação e resultado (RB-24).
- **Histórico escolar**: todas as turmas do estudante agrupadas por período (mais antigo primeiro): disciplina, carga horária, média, frequência e resultado; resumo com disciplinas aprovadas e carga horária aprovada.
- Cabeçalho: StudyTrack, nome e e-mail do estudante, curso, data e hora da emissão (Brasília). Botões **Baixar PDF** (impressão do navegador) e **Voltar**, que não aparecem no papel.
- Estudante: item de menu **Documentos** com os boletins de cada período e o histórico. Coordenador: links **Boletim** e **Histórico** em cada estudante do detalhe da turma.

**Fora do escopo**
- Assinatura digital, código de verificação, PDF gerado no servidor (OPEN-038), envio por e-mail.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-05 por Luiz.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Estudante — Documentos | [prototipo.html#est-documentos](layout/prototipo.html#est-documentos) | [x] | [x] | Luiz | 2026-11-05 |
| Boletim | [prototipo.html#doc-boletim](layout/prototipo.html#doc-boletim) | [x] | [x] | Luiz | 2026-11-05 |
| Histórico escolar | [prototipo.html#doc-historico](layout/prototipo.html#doc-historico) | [x] | [x] | Luiz | 2026-11-05 |

## 4. Dependências

SPEC-003, SPEC-004, SPEC-015, SPEC-017, SPEC-018.

## 5. Comportamento esperado

**Pré-condições:** estudante (os próprios documentos) ou coordenador (estudante de curso que coordena) autenticado.

**Fluxo principal:**
1. Usuário abre o boletim ou o histórico.
2. Sistema monta o documento só com as turmas do estudante, calculando o resultado de cada turma (RB-24).
3. Usuário clica em **Baixar PDF** e salva pelo navegador.

**Exceções:**
- Estudante pedindo documento de outro: recebe o próprio (o parâmetro é ignorado).
- Coordenador pedindo estudante de outro curso, ou estudante inexistente: não encontrado.
- Professor ou administrador: acesso negado.
- Estudante sem turma no período: documento com aviso "Nenhuma turma neste período".

**Pós-condições:** nenhuma alteração de dados.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-020-01 | O documento só contém turmas do estudante (RB-02, RB-04). |
| INV-020-02 | Resultado conforme RB-24: Aprovado, Reprovado por nota, por frequência ou por nota e frequência, Sem registro e Em curso. |
| INV-020-03 | Média, frequência e situação são as do indicador vigente (as mesmas do painel e do relatório). |
| INV-020-04 | Carga horária aprovada = soma das cargas das turmas com resultado Aprovado. |
| INV-020-05 | Professor e administrador não emitem (RB-13). |

## 7. Modelo de domínio envolvido

Sem entidade nova.

## 8. Impacto arquitetural

- `resultadoDaTurma` e o resumo do histórico em `src/domain/documentos.ts` (puro).
- Consulta em `src/server/academico/documentos.ts`.
- Páginas `/documentos/boletim` e `/documentos/historico` com CSS de impressão (A4), sem biblioteca nova.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| Página `/documentos/boletim` | estudante (coordenador), período (opcional) | documento do período | não encontrado, acesso negado |
| Página `/documentos/historico` | estudante (coordenador) | documento completo | não encontrado, acesso negado |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-01 | Documento em até 3 s |
| RNF-03, RNF-05 | Escopo na query; professor e administrador negados |
| RNF-04, RNF-06 | Legível no celular; impressão em A4 sem cortar colunas |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-020-01 | Período encerrado: média 7,0 e frequência 80% | Histórico | Aprovado |
| AC-020-02 | Período encerrado: média 5,5 e frequência 90%; média 7,0 e 70%; média 4,0 e 60% | Histórico | Reprovado por nota; por frequência; por nota e frequência |
| AC-020-03 | Período aberto | Boletim | Resultado "Em curso" |
| AC-020-04 | Período encerrado sem nota | Histórico | Sem registro |
| AC-020-05 | Estudante com turmas em 2026/1 e 2026/2 | Abre o histórico | Dois períodos, carga horária aprovada correta |
| AC-020-06 | Estudante | Pede o histórico de outro estudante | Recebe o próprio |
| AC-020-07 | Coordenador | Pede o histórico de estudante de outro curso | Não encontrado |
| AC-020-08 | Professor ou administrador | Abre um documento | Acesso negado |

## 12. Casos de teste derivados

1. `resultadoDaTurma` para todas as combinações (RB-24) e resumo do histórico.
2. Escopo do estudante e do coordenador; negação para professor e administrador.
3. Boletim com o período padrão e com período escolhido.

## 13. Questões em aberto

Nenhuma. OPEN-038 e OPEN-044 fechadas.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-021 — Importação de estudantes por planilha

**Status:** `implementada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-021 |
| **Nome** | Importação de estudantes por planilha |
| **Objetivo** | Cadastrar e matricular dezenas de estudantes de uma vez a partir de um CSV, com prévia e sem meio-termo. |
| **Valor** | Começo de semestre sem cadastro manual um a um; nenhum dado pela metade se a planilha tiver erro. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-30, RF-03 |
| **RB** | RB-04, RB-15, RB-19, RB-20, RB-22 |
| **RNF** | RNF-02, RNF-03, RNF-04, RNF-06 |
| **UC / fluxo** | UC-20 Importar estudantes |
| **Entidades** | `Usuario`, `Matricula`, `RegistroAuditoria` |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-042 |

## 3. Escopo

**Incluído**
- No detalhe da turma, cartão **Importar planilha (CSV)**: o coordenador escolhe o arquivo e vê a **prévia**: cada linha com nome, e-mail e o que acontecerá (conta nova, só matrícula, já matriculado) ou o erro.
- **Confirmar importação** só fica disponível sem erros; grava tudo numa transação: contas novas (Estudante, curso da turma, senha provisória aleatória, troca obrigatória), matrículas e um registro de auditoria.
- Depois de gravar: lista das senhas provisórias, mostrada uma vez, com **Baixar lista (CSV)**.
- Formato: primeira linha com `nome` e `email` (ou `e-mail`), separador `;` ou `,`, UTF-8 (com ou sem BOM), até 500 linhas de dados.

**Fora do escopo**
- Importar professores, notas ou turmas; arquivos Excel (.xlsx); enviar as senhas por e-mail.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-05 por Luiz.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Coordenador — Importar planilha (prévia com erros) | [prototipo.html#coord-importacao](layout/prototipo.html#coord-importacao) | [x] | [x] | Luiz | 2026-11-05 |
| Coordenador — Importação concluída | [prototipo.html#coord-importacao-ok](layout/prototipo.html#coord-importacao-ok) | [x] | [x] | Luiz | 2026-11-05 |

## 4. Dependências

SPEC-002, SPEC-011, SPEC-015, SPEC-017, SPEC-019.

## 5. Comportamento esperado

**Pré-condições:** coordenador autenticado; turma de curso que coordena, em período aberto.

**Fluxo principal:**
1. Coordenador escolhe o arquivo e pede a prévia.
2. Sistema valida cada linha e devolve a prévia, sem gravar.
3. Sem erros, o coordenador confirma; o sistema grava contas, matrículas e auditoria numa transação.
4. Sistema mostra as senhas provisórias das contas novas.

**Exceções:**
- Arquivo sem cabeçalho, vazio ou com mais de 500 linhas: recusado com explicação.
- Linha com erro: prévia mostra o erro; a confirmação é recusada (400) mesmo se enviada direto à API.
- Turma fora do escopo: não encontrada. Período encerrado: 409.

**Pós-condições:** todas as linhas gravadas ou nenhuma.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-021-01 | Importação é tudo ou nada (uma transação). |
| INV-021-02 | Prévia não grava nada. |
| INV-021-03 | E-mail repetido na planilha, inválido, de conta que não é Estudante, desativada ou de outro curso é erro (RB-19). |
| INV-021-04 | Conta nova nasce com senha provisória aleatória (mínimo 10 caracteres) e troca obrigatória (RB-15); só o hash é gravado (RNF-02). |
| INV-021-05 | Estudante já matriculado não gera erro nem matrícula duplicada. |

## 7. Modelo de domínio envolvido

Sem entidade nova.

## 8. Impacto arquitetural

- Leitura e validação do CSV em `src/domain/importacao.ts` (puro).
- Caso de uso `importarEstudantes` em `src/server/academico/importacao.ts`.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| `POST /api/turmas/:id/importacao` | `csv` (texto), `confirmar` (sim/não) | prévia; ou gravação com as senhas provisórias | arquivo inválido, linhas com erro, não encontrada, período encerrado |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-02 | Só o hash da senha gravado; senha mostrada uma vez |
| RNF-03 | Escopo do coordenador na query |
| RNF-04, RNF-06 | Tela aprovada, desktop e celular |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-021-01 | CSV com 2 e-mails novos e 1 estudante do curso | Prévia | 2 contas novas, 1 só matrícula; nada gravado |
| AC-021-02 | O mesmo CSV | Confirma | 2 contas com troca obrigatória e 3 matrículas; senhas mostradas |
| AC-021-03 | CSV com e-mail repetido, e-mail inválido e estudante de outro curso | Prévia | Cada erro na linha certa; confirmação recusada; nada gravado |
| AC-021-04 | CSV com estudante já matriculado | Confirma | Sem duplicar, sem erro |
| AC-021-05 | CSV sem cabeçalho ou com 501 linhas | Prévia | Recusado com explicação |
| AC-021-06 | Turma de outro coordenador ou de período encerrado | Importa | Não encontrada / 409 |
| AC-021-07 | CSV com separador vírgula e BOM | Prévia | Lido corretamente |

## 12. Casos de teste derivados

1. Leitura do CSV (separador, BOM, aspas, cabeçalho) e validação por linha.
2. Prévia sem gravação; confirmação tudo ou nada; senhas provisórias.
3. Escopo e período encerrado.

## 13. Questões em aberto

Nenhuma. OPEN-042 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-022 — Notificações

**Status:** `implementada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-022 |
| **Nome** | Notificações |
| **Objetivo** | Avisar o estudante e o professor, dentro do sistema, do que mudou e pede atenção. |
| **Valor** | Ninguém precisa ficar abrindo telas para descobrir que entrou em Risco, recebeu nota ou tem prazo chegando. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-31 |
| **RB** | RB-02, RB-03, RB-13, RB-23 |
| **RNF** | RNF-01, RNF-03, RNF-04, RNF-06 |
| **UC / fluxo** | UC-21 Consultar notificações |
| **Entidades** | `Notificacao` (nova) |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-004 (mantida), OPEN-043 |

## 3. Escopo

**Incluído**
- Gravadas na mesma transação do evento: **entrou em Risco** (situação muda de outra para Risco no recálculo do indicador: estudante e professor da turma); **nota lançada ou alterada** (estudante); **plano de recuperação criado** (estudante).
- **Prazo próximo:** quando o estudante entra no sistema, atividades de períodos abertos com prazo de hoje até 2 dias depois e sem entrega geram uma notificação cada (no máximo uma por atividade, RB-23).
- Menu lateral do estudante e do professor: item **Notificações** com o número de não lidas. Página **Notificações**: lista (mais recentes primeiro, não lidas destacadas), abrir uma notificação marca como lida e leva à tela relacionada; **Marcar todas como lidas**.

**Fora do escopo**
- E-mail, push, preferências de notificação, apagar notificação (sem RF).
- Notificações para coordenador e administrador.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-05 por Luiz.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Notificações (estudante) | [prototipo.html#notificacoes](layout/prototipo.html#notificacoes) | [x] | [x] | Luiz | 2026-11-05 |

## 4. Dependências

SPEC-003, SPEC-004, SPEC-005, SPEC-008, SPEC-017.

## 5. Comportamento esperado

**Pré-condições:** estudante ou professor autenticado.

**Fluxo principal:**
1. Evento acontece (nota, Risco, plano); a notificação é gravada na mesma transação.
2. Destinatário vê o contador no menu e abre Notificações.
3. Abre uma notificação: ela fica lida e o sistema leva à tela relacionada.

**Exceções:**
- Marcar como lida notificação de outro usuário: não encontrada.
- Coordenador ou administrador na página: acesso negado.

**Pós-condições:** leitura gravada.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-022-01 | Cada notificação tem exatamente 1 destinatário, o único que a vê e marca (RB-23). |
| INV-022-02 | "Entrou em Risco" só quando a situação anterior não era Risco. |
| INV-022-03 | No máximo uma notificação de prazo por estudante e atividade (índice único). |
| INV-022-04 | Notificação de evento é gravada na mesma transação do evento; se o evento falhar, não há notificação. |
| INV-022-05 | Coordenador e administrador não recebem notificações. |

## 7. Modelo de domínio envolvido

Nova entidade **Notificacao** (id, tipo {Risco, Nota, Plano, Prazo}, título, texto, link, chave, criadaEm, lidaEm), de exatamente 1 usuário destinatário.

## 8. Impacto arquitetural

- Textos e regra "entrou em Risco" em `src/domain/notificacoes.ts` (puro).
- Gravação em `src/server/dados/notificacoes.ts`, chamada dentro das transações de nota, plano e recálculo do indicador.
- Migração: tabela `Notificacao` com índice único na chave (nula para eventos sem deduplicação).

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| `GET /api/notificacoes` | sessão | notificações do usuário, total de não lidas | sem permissão |
| `POST /api/notificacoes/:id/lida` | — | lida | não encontrada |
| `POST /api/notificacoes/lidas` | — | todas lidas | sem permissão |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-01 | Contador no menu sem atrasar a página (consulta indexada) |
| RNF-03 | Filtro pelo destinatário na query |
| RNF-04, RNF-06 | Tela aprovada, desktop e celular |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-022-01 | Estudante Normal | Nota faz a situação ir para Risco | Estudante e professor da turma recebem "entrou em Risco" |
| AC-022-02 | Estudante já em Risco | Nova nota mantém Risco | Nenhuma nova notificação de Risco (só a de nota) |
| AC-022-03 | Professor | Lança ou altera a nota de um estudante | Estudante recebe a notificação de nota |
| AC-022-04 | Professor | Cria plano para o estudante | Estudante recebe a notificação de plano |
| AC-022-05 | Atividade com prazo amanhã sem entrega | Estudante entra duas vezes | Uma única notificação de prazo |
| AC-022-06 | Dois estudantes | Um consulta ou marca notificação do outro | Não vê; não encontrada |
| AC-022-07 | Estudante com 3 não lidas | Marca todas como lidas | Contador zera |
| AC-022-08 | Coordenador ou administrador | Abre Notificações | Acesso negado |

## 12. Casos de teste derivados

1. Funções puras: "entrou em Risco", textos.
2. Gravação por evento, deduplicação do prazo, escopo e leitura.

## 13. Questões em aberto

Nenhuma. OPEN-043 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-023 — Simulador de notas ("Quanto preciso tirar?")

**Status:** `implementada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-023 |
| **Nome** | Simulador de notas |
| **Objetivo** | Mostrar ao estudante e ao professor quanto o estudante precisa tirar nas avaliações que faltam para chegar a 6,0 e a 5,0, e deixar o estudante simular notas. |
| **Valor** | O estudante sabe exatamente o que precisa fazer; o professor usa o número para montar o plano de recuperação. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-32 |
| **RB** | RB-02, RB-03, RB-05, RB-06, RB-07, RB-25 |
| **RNF** | RNF-01, RNF-04, RNF-06 |
| **UC / fluxo** | UC-22 Simular notas |
| **Entidades** | leitura de `Avaliacao`, `Nota`, `IndicadorAcademico` |
| **ADRs** | ADR-001, ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-002, OPEN-045 |

## 3. Escopo

**Incluído**
- Painel do estudante: em cada turma de período aberto, "Para 6,0 você precisa de X nas avaliações que faltam" e o mesmo para 5,0, com os estados já garantida, não alcançável e sem avaliação restante; aviso de frequência abaixo de 75%.
- Simulação: o estudante digita notas hipotéticas nas avaliações sem nota e vê a média e a situação simuladas, calculadas no navegador com as mesmas funções do servidor. Nada é enviado nem gravado.
- Dashboard da turma do professor: coluna "Precisa (6,0)" para cada estudante.

**Fora do escopo**
- Simular frequência; gravar simulações; simular avaliações que ainda não foram cadastradas.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-06 por Luiz.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Estudante — Quanto preciso tirar? | [prototipo.html#est-simulador](layout/prototipo.html#est-simulador) | [x] | [x] | Luiz | 2026-11-06 |
| Professor — Dashboard da turma com "Precisa (6,0)" | [prototipo.html#prof-turma-simulador](layout/prototipo.html#prof-turma-simulador) | [x] | [x] | Luiz | 2026-11-06 |

## 4. Dependências

SPEC-003, SPEC-004, SPEC-007, SPEC-008, SPEC-017.

## 5. Comportamento esperado

**Fluxo principal:** o estudante abre o painel; o sistema calcula, por turma, a nota necessária para 6,0 e 5,0 (RB-25); o estudante digita notas hipotéticas e vê a média e a situação simuladas.

**Exceções:** turma sem avaliação restante: "Não há avaliação restante"; frequência abaixo de 75%: aviso de Risco pela frequência; turma de período encerrado: o simulador não aparece.

**Pós-condições:** nenhuma alteração de dados.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-023-01 | Nota necessária pela fórmula da RB-25, arredondada para cima com uma casa. |
| INV-023-02 | Média simulada = média ponderada da RB/OPEN-002 com as notas reais e as hipotéticas; situação simulada pela regra única (DA-02). |
| INV-023-03 | Nada do simulador é gravado. |
| INV-023-04 | O estudante só simula as próprias turmas; o professor só vê as turmas que leciona (RB-02, RB-03). |

## 7. Modelo de domínio envolvido

Sem entidade nova.

## 8. Impacto arquitetural

- `notaNecessaria` e `mediaSimulada` em `src/domain/simulador.ts` (puro, usado no servidor e no navegador).
- Pesos das avaliações incluídos nas consultas do painel e do dashboard da turma.

## 9. Contratos necessários

Sem rota nova: os números vêm no painel do estudante e no dashboard da turma.

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-04, RNF-06 | Tela aprovada, desktop e celular |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-023-01 | Prova 1 (peso 2) = 4,0; Lista (1) = 5,0; Prova 2 (peso 2) sem nota | Estudante abre o painel | Para 6,0 precisa de 8,5; para 5,0 precisa de 6,0 |
| AC-023-02 | Notas que já garantem 6,0 com zero nas restantes | Abre o painel | "Já garantida" |
| AC-023-03 | Meta exige mais que 10 | Abre o painel | "Não alcançável" |
| AC-023-04 | Todas as avaliações com nota | Abre o painel | "Não há avaliação restante" |
| AC-023-05 | Frequência 70% | Abre o painel | Aviso de Risco pela frequência |
| AC-023-06 | Estudante digita 9,0 na Prova 2 | Simula | Média e situação simuladas; nada gravado |
| AC-023-07 | Professor | Abre o dashboard da turma | Coluna "Precisa (6,0)" para cada estudante |

## 12. Casos de teste derivados

1. `notaNecessaria` e `mediaSimulada` (RB-25) em todos os estados.
2. Painel e dashboard da turma trazem os números; nada é gravado.

## 13. Questões em aberto

Nenhuma. OPEN-045 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-024 — Comparativo entre semestres

**Status:** `implementada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-024 |
| **Nome** | Comparativo entre semestres |
| **Objetivo** | Comparar os indicadores de um semestre com os anteriores, para o coordenador (cursos e disciplinas) e para o estudante (a própria trajetória). |
| **Valor** | A coordenação vê se o curso melhorou ou piorou; o estudante vê a própria evolução. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-33 |
| **RB** | RB-02, RB-04, RB-09, RB-24 |
| **RNF** | RNF-01, RNF-03, RNF-04, RNF-06 |
| **UC / fluxo** | UC-16 (dashboard), UC-19 (documentos) |
| **Entidades** | leitura de `PeriodoLetivo`, `Turma`, `IndicadorAcademico`, `Disciplina` |
| **ADRs** | ADR-001, ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-046 |

## 3. Escopo

**Incluído**
- Dashboard do coordenador: cartão "Comparativo entre semestres" com, por período (todos os períodos com turmas dos cursos dele, respeitando o filtro de curso), média, frequência média, % em Risco e, nos encerrados, % de aprovação; gráfico de barras lado a lado; tabela por disciplina (média de cada período).
- Documentos do estudante: gráfico com a média e a frequência de cada semestre cursado.

**Fora do escopo**
- Comparar cursos de outros coordenadores; exportar o comparativo.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-06 por Luiz.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Coordenador — Comparativo entre semestres | [prototipo.html#coord-comparativo](layout/prototipo.html#coord-comparativo) | [x] | [x] | Luiz | 2026-11-06 |
| Estudante — Documentos com a evolução por semestre | [prototipo.html#est-documentos-semestres](layout/prototipo.html#est-documentos-semestres) | [x] | [x] | Luiz | 2026-11-06 |

## 4. Dependências

SPEC-016, SPEC-017, SPEC-020.

## 5. Comportamento esperado

**Fluxo principal:** o coordenador abre o dashboard e vê o comparativo dos períodos; o estudante abre Documentos e vê o gráfico por semestre.

**Exceções:** um só período: o comparativo mostra só ele, com a orientação de que aparece a comparação quando houver mais de um.

**Pós-condições:** nenhuma alteração de dados.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-024-01 | Média do período = média simples das médias das matrículas com média; frequência = média simples das frequências registradas (como o relatório). |
| INV-024-02 | % em Risco = matrículas em Risco ÷ matrículas com indicador; % de aprovação só em período encerrado = Aprovados ÷ matrículas com resultado (sem "Sem registro") (RB-24). |
| INV-024-03 | O coordenador só vê turmas dos cursos que coordena (RB-04); o estudante, só as próprias (RB-02). |

## 7. Modelo de domínio envolvido

Sem entidade nova.

## 8. Impacto arquitetural

- `resumoPorPeriodo` em `src/domain/comparativo.ts` (puro).
- Consulta dos indicadores com o período em `src/server/academico/comparativo.ts`.
- Gráfico em SVG gerado no servidor, como os demais.

## 9. Contratos necessários

Sem rota nova: os números vêm no dashboard do coordenador e na página Documentos.

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-03 | Escopo na query |
| RNF-04, RNF-06 | Tela aprovada, desktop e celular |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-024-01 | Turmas em 2026/1 (encerrado) e 2026/2 | Coordenador abre o dashboard | Uma coluna por período com média, frequência, % em Risco e, em 2026/1, % de aprovação |
| AC-024-02 | Duas matrículas em 2026/1: uma aprovada e uma reprovada | — | % de aprovação 50% |
| AC-024-03 | Coordenador com curso filtrado | Abre o dashboard | Comparativo só daquele curso |
| AC-024-04 | Turma de outro coordenador | — | Não entra no comparativo |
| AC-024-05 | Estudante com turmas em dois períodos | Abre Documentos | Média e frequência de cada período |

## 12. Casos de teste derivados

1. `resumoPorPeriodo` (médias, % Risco, % aprovação só nos encerrados).
2. Escopo e filtro de curso; dados do estudante.

## 13. Questões em aberto

Nenhuma. OPEN-046 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-025 — Mural de comunicados

**Status:** `implementada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-025 |
| **Nome** | Mural de comunicados |
| **Objetivo** | Professor e coordenador publicam avisos para a turma ou para o curso, que chegam como notificação e ficam num mural. |
| **Valor** | A comunicação da turma fica dentro do sistema, junto das notas e da frequência, em vez de grupos paralelos. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-34 |
| **RB** | RB-02, RB-03, RB-04, RB-20, RB-22, RB-23, RB-26 |
| **RNF** | RNF-01, RNF-03, RNF-04, RNF-06 |
| **UC / fluxo** | UC-23 Publicar comunicado; UC-24 Consultar o mural |
| **Entidades** | `Comunicado` (nova), `Notificacao`, `RegistroAuditoria` |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-043, OPEN-047 |

## 3. Escopo

**Incluído**
- Página **Comunicados** (menu de Estudante, Professor e Coordenador): mural com os comunicados do alcance de quem está vendo, mais recentes primeiro (autor, alcance, data, título, texto).
- Professor: formulário "Novo comunicado" com a turma (só as que leciona, de período aberto), título e texto. Coordenador: alcance "uma turma" ou "todas as turmas de um curso", com a turma ou o curso.
- Ao publicar: grava o comunicado, uma notificação para cada estudante alcançado (tipo Comunicado) e, quando o autor é o coordenador, para os professores das turmas; auditoria.
- O autor apaga o próprio comunicado (com confirmação); a auditoria registra.

**Fora do escopo**
- Anexos, comentários, edição, agendamento, envio por e-mail.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-06 por Luiz.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Comunicados — mural do estudante | [prototipo.html#comunicados-estudante](layout/prototipo.html#comunicados-estudante) | [x] | [x] | Luiz | 2026-11-06 |
| Comunicados — publicar (coordenador) | [prototipo.html#comunicados-publicar](layout/prototipo.html#comunicados-publicar) | [x] | [x] | Luiz | 2026-11-06 |

## 4. Dependências

SPEC-002, SPEC-015, SPEC-017, SPEC-019, SPEC-022.

## 5. Comportamento esperado

**Fluxo principal:** o professor escolhe a turma, escreve título e texto e publica; os estudantes recebem a notificação e veem o comunicado no mural.

**Exceções:** título ou texto vazio ou longo demais: recusado com o campo; turma que não leciona ou curso que não coordena: acesso negado; turma de período encerrado: 409 (RB-20); curso sem turma de período aberto: recusado; apagar comunicado de outra pessoa: não encontrado.

**Pós-condições:** comunicado, notificações e auditoria gravados na mesma transação.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-025-01 | Todo comunicado tem exatamente um alcance: uma turma ou um curso (CHECK). |
| INV-025-02 | Só professor da turma ou coordenador do curso do alcance publica (RB-26). |
| INV-025-03 | Estudante vê só comunicados das próprias turmas e dos cursos delas (de período aberto); professor, os das turmas que leciona, dos cursos delas e os próprios; coordenador, os dos cursos que coordena. |
| INV-025-04 | Comunicado, notificações e auditoria na mesma transação. |
| INV-025-05 | Só o autor apaga (RB-26). |

## 7. Modelo de domínio envolvido

Nova entidade **Comunicado** (id, título, texto, criadoEm), com exatamente 1 autor e exatamente um alcance: 1 Turma ou 1 Curso. `Notificacao` ganha o tipo Comunicado.

## 8. Impacto arquitetural

- Validação e alcance em `src/domain/comunicados.ts` (puro).
- Caso de uso em `src/server/academico/comunicados.ts`, com auditoria e notificações na transação.
- Migração: tabela `Comunicado` com CHECK de alcance; valor novo no enum `TipoNotificacao`.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| `GET /api/comunicados` | sessão | comunicados do alcance | sem permissão |
| `POST /api/comunicados` | turmaId ou cursoId, título, texto | comunicado e número de notificados | campo inválido, acesso negado, período encerrado |
| `DELETE /api/comunicados/:id` | — | apagado | não encontrado |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-03 | Alcance filtrado na query |
| RNF-04, RNF-06 | Tela aprovada, desktop e celular |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-025-01 | Professor da turma com 3 estudantes | Publica | Comunicado no mural da turma e 3 notificações |
| AC-025-02 | Coordenador | Publica para todas as turmas de um curso | Estudantes e professores das turmas abertas do curso notificados; aparece no mural deles |
| AC-025-03 | Estudante de outra turma | Abre o mural | Não vê o comunicado |
| AC-025-04 | Professor de outra turma ou coordenador de outro curso | Tenta publicar | Acesso negado |
| AC-025-05 | Título vazio, texto vazio ou texto com mais de 2.000 caracteres | Publica | Recusado com o campo |
| AC-025-06 | Turma de período encerrado | Publica | 409 |
| AC-025-07 | Autor | Apaga | Some do mural; auditoria registra |
| AC-025-08 | Outro usuário | Tenta apagar | Não encontrado; continua no mural |
| AC-025-09 | Administrador | Abre Comunicados | Acesso negado |

## 12. Casos de teste derivados

1. Validação de título e texto; alcance.
2. Publicação, notificações, auditoria; escopo do mural; exclusão pelo autor.

## 13. Questões em aberto

Nenhuma. OPEN-047 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-026 — Correção de cadastros

**Status:** `implementada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-026 |
| **Nome** | Correção de cadastros (editar e excluir) |
| **Objetivo** | Permitir corrigir o que foi digitado errado e excluir o que foi criado por engano, sem apagar nada que já tenha registro acadêmico. |
| **Valor** | Hoje um nome errado, um peso errado ou uma chamada no dia errado não têm conserto; numa escola de verdade isso acontece toda semana. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-35 |
| **RB** | RB-03, RB-04, RB-10, RB-13, RB-20, RB-21, RB-22, RB-32 |
| **RNF** | RNF-02, RNF-03, RNF-04, RNF-06 |
| **UC / fluxo** | UC-25 Corrigir cadastro |
| **Entidades** | `Usuario`, `Disciplina`, `CursoDisciplina`, `Turma`, `Matricula`, `Avaliacao`, `Atividade`, `Aula`, `Presenca`, `RegistroAuditoria` |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-048 |

## 3. Escopo

**Incluído**
- Administrador: **Editar** nome e e-mail de uma conta (Contas).
- Coordenador (cursos que coordena): editar nome e carga horária da disciplina (só se todas as grades dela forem de cursos dele); **excluir** disciplina sem turma; editar o nome da turma; **excluir** turma sem matrícula, avaliação, aula ou atividade; **tirar estudante da turma** sem nota, presença, entrega nem plano.
- Professor (turmas que leciona): editar avaliação (nome, peso, data e tipo, SPEC-029) e **excluir** avaliação sem nota; editar atividade (descrição e prazo) e **excluir** atividade sem entrega; mudar a data de uma aula e **excluir** a aula (com as presenças).
- Editar o peso de uma avaliação, mudar a data ou excluir uma aula recalculam média, frequência e indicador na mesma transação (RB-10, RB-21).
- Toda edição e exclusão vai para a auditoria com o antes e o depois (RB-22); toda exclusão pede confirmação na tela.

**Fora do escopo**
- Trocar o perfil de uma conta e excluir conta (continua a desativação, RB-14).
- Excluir nota (o histórico de notas é imutável, RB-16), entrega já registrada (continua o "desfazer" da SPEC-005) ou plano.
- Excluir curso ou período.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-06 por Arthur.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Notas e avaliações — editar e excluir avaliação | [prototipo.html#correcao-avaliacao](layout/prototipo.html#correcao-avaliacao) | [x] | [x] | Arthur | 2026-11-06 |
| Turma — editar, tirar estudante e excluir | [prototipo.html#correcao-turma](layout/prototipo.html#correcao-turma) | [x] | [x] | Arthur | 2026-11-06 |
| Contas — editar conta | [prototipo.html#correcao-conta](layout/prototipo.html#correcao-conta) | [x] | [x] | Arthur | 2026-11-06 |

## 4. Dependências

SPEC-002, SPEC-004, SPEC-005, SPEC-010, SPEC-015, SPEC-017, SPEC-018, SPEC-019.

## 5. Comportamento esperado

**Fluxo principal:** quem tem o cadastro no escopo abre a tela, clica em Editar, muda os campos e salva; ou clica em Excluir e confirma.

**Exceções:** fora do escopo: não encontrado (404); período encerrado: 409 (RB-20); registro dependente: 409 com o motivo (RB-32); e-mail repetido ou campo inválido: 400 com o campo; disciplina compartilhada com curso de outro coordenador: 409.

**Pós-condições:** cadastro alterado ou excluído, recálculos feitos e auditoria gravada na mesma transação.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-026-01 | Nada com nota, presença, entrega ou plano é excluído (RB-32). |
| INV-026-02 | Mudar o peso de uma avaliação recalcula o indicador de todos os estudantes da turma na mesma transação. |
| INV-026-03 | Excluir ou mudar a data de uma aula recalcula a frequência e o indicador dos estudantes da aula na mesma transação; a data nova não pode ser futura nem ter já 4 aulas (RB-21). |
| INV-026-04 | Cada perfil só altera o que está no próprio escopo (ADR-003); o administrador não altera nada acadêmico (RB-13). |
| INV-026-05 | Toda alteração e exclusão gera auditoria com antes e depois (RB-22). |

## 7. Modelo de domínio envolvido

Sem entidade nova. Exclusões só de registros sem dependentes; a aula leva junto as presenças.

## 8. Impacto arquitetural

- Validações puras em `src/domain/correcoes.ts` (campos editáveis e motivo de recusa da exclusão).
- Casos de uso em `src/server/academico/correcoes.ts`, cada um com escopo na query, trava do período, recálculo e auditoria na transação.
- Sem migração.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| `PATCH /api/contas/:id` | nome, e-mail | conta | campo inválido, e-mail repetido, não encontrado |
| `PATCH` / `DELETE /api/disciplinas/:id` | nome, carga horária | disciplina / excluída | campo inválido, compartilhada, tem turma, não encontrado |
| `PATCH` / `DELETE /api/turmas/:id` | nome | turma / excluída | período encerrado, tem registros, não encontrado |
| `DELETE /api/turmas/:id/matriculas/:estudanteId` | — | matrícula excluída | tem registros, período encerrado, não encontrado |
| `PATCH` / `DELETE /api/avaliacoes/:id` | nome, peso, data, tipo | avaliação / excluída | campo inválido, tem nota, período encerrado, não encontrado |
| `PATCH` / `DELETE /api/atividades/:id` | descrição, prazo | atividade / excluída | campo inválido, tem entrega, período encerrado, não encontrado |
| `PATCH` / `DELETE /api/aulas/:id` | data | aula / excluída | data futura, 4 aulas na data, período encerrado, não encontrado |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-03 | Escopo na query; teste com outro professor e outro coordenador |
| RNF-04, RNF-06 | Telas aprovadas; confirmação antes de excluir |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-026-01 | Administrador | Edita o nome e o e-mail de uma conta | Conta alterada; auditoria com antes e depois |
| AC-026-02 | Administrador | Usa um e-mail que já existe | 400 com o campo e-mail |
| AC-026-03 | Professor da turma | Muda o peso de uma avaliação com notas | Média e situação dos estudantes recalculadas |
| AC-026-04 | Professor | Exclui avaliação com nota | 409 "a avaliação já tem notas" |
| AC-026-05 | Professor | Exclui avaliação sem nota | Excluída; auditoria |
| AC-026-06 | Professor | Exclui uma aula | Presenças excluídas; frequência e indicador recalculados |
| AC-026-07 | Professor | Muda a data da aula para o futuro | 400 |
| AC-026-08 | Coordenador | Tira da turma um estudante sem registros | Matrícula excluída |
| AC-026-09 | Coordenador | Tira da turma um estudante com nota ou presença | 409 com o motivo |
| AC-026-10 | Coordenador | Exclui disciplina com turma ou turma com matrícula | 409 com o motivo |
| AC-026-11 | Coordenador | Edita disciplina que também está em curso de outro coordenador | 409 |
| AC-026-12 | Professor de outra turma ou coordenador de outro curso | Tenta editar ou excluir | 404; nada muda |
| AC-026-13 | Turma de período encerrado | Qualquer edição ou exclusão | 409 (RB-20) |
| AC-026-14 | Professor | Edita e exclui atividade (sem entrega) | Alterada e excluída; com entrega, 409 |

## 12. Casos de teste derivados

1. Regras puras: campos editáveis, motivo de recusa da exclusão.
2. Integração: cada rota com escopo, trava, recálculo e auditoria.

## 13. Questões em aberto

Nenhuma. OPEN-048 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-027 — Redefinição de senha por pedido

**Status:** `implementada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-027 |
| **Nome** | Redefinição de senha por pedido ("Esqueci minha senha") |
| **Objetivo** | Quem esqueceu a senha pede a redefinição na tela de login; o administrador aprova e entrega uma senha provisória, trocada no primeiro acesso. |
| **Valor** | Hoje quem esquece a senha fica sem acesso para sempre, porque ninguém consegue redefini-la. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-36, RF-18 |
| **RB** | RB-13, RB-14, RB-15, RB-22, RB-27 |
| **RNF** | RNF-02, RNF-03, RNF-04, RNF-05, RNF-06 |
| **UC / fluxo** | UC-26 Pedir redefinição de senha |
| **Entidades** | `PedidoSenha` (nova), `Usuario`, `RegistroAuditoria` |
| **ADRs** | ADR-001, ADR-002, ADR-004 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-026, OPEN-049 |

## 3. Escopo

**Incluído**
- Link **Esqueci minha senha** no login, que abre uma página pública com o campo e-mail. A resposta é sempre: "Se o e-mail estiver cadastrado, o pedido foi enviado à secretaria. Procure a secretaria para receber a senha provisória."
- O pedido só é gravado para conta **ativa** existente e sem outro pedido pendente; e-mail desconhecido, conta desativada ou pedido repetido não gravam nada e recebem a mesma resposta.
- Página **Pedidos de senha** do administrador: pedidos pendentes (nome, e-mail, perfil, data do pedido) e os resolvidos nos últimos 30 dias; contador de pendentes no menu e no dashboard.
- **Aprovar**: gera senha provisória aleatória (12 caracteres, mesmo gerador da importação), grava o hash, marca `trocarSenha`, encerra o pedido e mostra a senha **uma única vez** com o botão Copiar. **Recusar**: encerra o pedido sem mudar a senha.
- Auditoria administrativa ("pedido de senha aprovado/recusado"), sem a senha.

**Fora do escopo**
- Envio por e-mail ou SMS; pergunta secreta; o próprio usuário escolher a senha sem a secretaria.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-06 por Arthur.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Esqueci minha senha | [prototipo.html#senha-esqueci](layout/prototipo.html#senha-esqueci) | [x] | [x] | Arthur | 2026-11-06 |
| Pedidos de senha (administrador) | [prototipo.html#senha-pedidos](layout/prototipo.html#senha-pedidos) | [x] | [x] | Arthur | 2026-11-06 |

## 4. Dependências

SPEC-001, SPEC-010, SPEC-011, SPEC-019.

## 5. Comportamento esperado

**Fluxo principal:** a pessoa pede pelo e-mail; a secretaria confere quem é (presencialmente ou por telefone), aprova e entrega a senha provisória; no primeiro acesso a pessoa define a senha nova (SPEC-011).

**Exceções:** e-mail em formato inválido: 400 com o campo; pedido já resolvido: 409; administrador aprovando o próprio pedido: 409; perfil diferente de administrador: 403.

**Pós-condições:** pedido Aprovado (senha provisória gravada e conta marcada) ou Recusado; auditoria na mesma transação.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-027-01 | A resposta do pedido é idêntica para conta existente, inexistente e desativada (RB-27). |
| INV-027-02 | No máximo um pedido pendente por conta (índice único parcial). |
| INV-027-03 | A senha provisória não é gravada em texto em lugar nenhum: nem no pedido nem na auditoria (RNF-02). |
| INV-027-04 | Depois da aprovação a conta só define a senha nova e sai (RB-15). |
| INV-027-05 | O administrador não aprova o próprio pedido. |

## 7. Modelo de domínio envolvido

Nova entidade **PedidoSenha** (id, status Pendente/Aprovado/Recusado, criadoEm, resolvidoEm), de 1 Usuario, resolvida por 1 Administrador.

## 8. Impacto arquitetural

- Regras puras em `src/domain/pedido-senha.ts`; caso de uso em `src/server/auth/pedidos-senha.ts`.
- Migração: tabela `PedidoSenha`, enum de status e índice único parcial (`WHERE status = 'Pendente'`).
- A página `/esqueci-senha` e `POST /api/auth/esqueci` são públicas, como o login.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| `POST /api/auth/esqueci` | e-mail | 202 com a mensagem padrão | e-mail inválido |
| `GET /api/pedidos-senha` | sessão | pendentes e resolvidos recentes | sem permissão |
| `POST /api/pedidos-senha/:id/aprovar` | — | senha provisória (uma vez) | já resolvido, próprio pedido, não encontrado |
| `POST /api/pedidos-senha/:id/recusar` | — | recusado | já resolvido, não encontrado |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-02 | Senha só em hash; teste confere que a auditoria e o pedido não têm a senha |
| RNF-05 | Mesma resposta para qualquer e-mail (não revela quem está cadastrado) |
| RNF-04, RNF-06 | Telas aprovadas |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-027-01 | Conta ativa | Pede a redefinição | Pedido pendente gravado; resposta padrão |
| AC-027-02 | E-mail desconhecido ou conta desativada | Pede | Nada gravado; a mesma resposta |
| AC-027-03 | Conta com pedido pendente | Pede de novo | Nenhum pedido novo; a mesma resposta |
| AC-027-04 | Administrador | Aprova | Senha provisória mostrada uma vez; a senha antiga deixa de funcionar; a provisória entra e é obrigada a definir senha nova |
| AC-027-05 | Administrador | Recusa | Pedido recusado; a senha antiga continua valendo |
| AC-027-06 | Pedido já resolvido | Aprova de novo | 409 |
| AC-027-07 | Administrador com pedido próprio | Aprova o próprio | 409 |
| AC-027-08 | Coordenador | Abre os pedidos | 403 |
| AC-027-09 | Aprovação | Consulta a auditoria | Registro sem a senha |

## 12. Casos de teste derivados

1. Regras puras do pedido (pode pedir, pode aprovar).
2. Integração: pedido público, aprovação, login com a provisória, recusa, auditoria.

## 13. Questões em aberto

Nenhuma. OPEN-049 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-028 — Várias aulas no mesmo dia

**Status:** `implementada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-028 |
| **Nome** | Várias aulas no mesmo dia (aula dupla) |
| **Objetivo** | A chamada de uma data registra de 1 a 4 aulas, cada uma com a própria presença. |
| **Valor** | Aulas seguidas são comuns; com uma aula só por dia a frequência sai errada. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-27 |
| **RB** | RB-10, RB-20, RB-21, RB-22, RB-31 |
| **RNF** | RNF-01, RNF-03, RNF-04, RNF-06 |
| **UC / fluxo** | UC-08 Registrar frequência |
| **Entidades** | `Aula` (número), `Presenca`, `Frequencia`, `IndicadorAcademico` |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-041, OPEN-050 |

## 3. Escopo

**Incluído**
- Na Chamada, o professor escolhe a data e a **quantidade de aulas (1 a 4)**; a tabela ganha uma coluna por aula ("1ª", "2ª"...). Marcar a 1ª aula copia a marcação para as outras; cada coluna pode ser mudada.
- Aulas já registradas na data aparecem para correção; dá para acrescentar aulas até 4.
- Falta abonada (SPEC-032) aparece como "Abonada" e não pode ser marcada.
- Lista de aulas da turma com data, número e presentes, com Editar data e Excluir (SPEC-026).

**Fora do escopo**
- Horário de cada aula e grade horária; justificativa pelo professor.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-06 por Arthur.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Chamada com 2 aulas e falta abonada | [prototipo.html#chamada-aulas](layout/prototipo.html#chamada-aulas) | [x] | [x] | Arthur | 2026-11-06 |

## 4. Dependências

SPEC-017, SPEC-018, SPEC-019.

## 5. Comportamento esperado

**Fluxo principal:** o professor escolhe turma, data e "2 aulas", marca as faltas e salva; frequência e indicador são recalculados.

**Exceções:** data futura: 400; mais de 4 aulas na data: 400; turma de outro professor: 404; período encerrado: 409.

**Pós-condições:** aulas e presenças gravadas; frequência e indicador recalculados; auditoria.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-028-01 | No máximo 4 aulas por turma e data, numeradas de 1 a 4 sem repetir (índice único). |
| INV-028-02 | Frequência = (presenças + faltas abonadas) ÷ aulas em que o estudante constou × 100 (RB-21). |
| INV-028-03 | Aulas, presenças, frequência, indicador e auditoria na mesma transação. |

## 7. Modelo de domínio envolvido

`Aula` ganha `numero` (1 a 4); o índice único passa de (turma, data) para (turma, data, número). Aulas existentes ficam com número 1.

## 8. Impacto arquitetural

- `frequenciaPelaChamada` passa a receber as faltas abonadas (`src/domain/frequencia.ts`).
- Caso de uso da chamada (`src/server/academico/chamada.ts`) grava várias aulas; migração com a coluna e o índice novo.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| `POST /api/aulas` | turmaId, data, aulas: lista (1 a 4) de presenças por estudante | aulas gravadas | data futura, mais de 4, período encerrado, não encontrado |
| `GET /api/aulas?turmaId=` | — | aulas da turma com número e presenças | não encontrado |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-01 | Chamada de 4 aulas com 40 estudantes em menos de 3 s |
| RNF-04, RNF-06 | Tela aprovada, celular inclusive |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-028-01 | Turma com 3 estudantes | Registra 2 aulas na data, um estudante falta só na 2ª | Esse estudante fica com 50% naquela data; os outros com 100% |
| AC-028-02 | Data com 2 aulas | Acrescenta mais 2 | 4 aulas na data |
| AC-028-03 | Data com 4 aulas | Tenta a 5ª | 400 |
| AC-028-04 | Aula já registrada | Corrige a presença | Frequência recalculada |
| AC-028-05 | Aulas antigas (antes da Spec) | Abre a chamada | Aparecem como 1ª aula da data |

## 12. Casos de teste derivados

1. Frequência com várias aulas e com abono (unitário).
2. Integração: registro, acréscimo, limite, correção.

## 13. Questões em aberto

Nenhuma. OPEN-050 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-029 — Prova substitutiva e exame final

**Status:** `implementada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-029 |
| **Nome** | Prova substitutiva e exame final |
| **Objetivo** | A avaliação ganha tipo; a substitutiva troca a menor prova e o exame final dá a nota final de quem ficou abaixo de 6,0. |
| **Valor** | Recuperação de nota é regra em quase toda instituição; sem ela o resultado do histórico sai errado. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-37, RF-05, RF-29, RF-32 |
| **RB** | RB-05, RB-06, RB-07, RB-09, RB-10, RB-24, RB-25, RB-28, RB-29 |
| **RNF** | RNF-03, RNF-04, RNF-06 |
| **UC / fluxo** | UC-03 Registrar nota; UC-19 Emitir boletim e histórico |
| **Entidades** | `Avaliacao` (tipo), `Nota`, `IndicadorAcademico` |
| **ADRs** | ADR-001, ADR-002 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-002, OPEN-044, OPEN-051 |

## 3. Escopo

**Incluído**
- Cadastro e edição de avaliação com **tipo**: Prova, Trabalho, Substitutiva ou Exame final (no máximo uma Substitutiva e um Exame por turma). Substitutiva e Exame não pedem peso (o campo some).
- **Média** (`calcularMedia`, OPEN-002 + RB-28): média ponderada das provas e trabalhos com nota; com nota na substitutiva, a menor prova (sem nota = 0) é trocada pela substitutiva quando isso aumenta a média. A situação Normal/Atenção/Risco usa essa média (DA-02).
- **Exame final** (RB-29): o lançamento só lista estudantes elegíveis (média < 6,0 e frequência ≥ 75%) e recusa os demais; nota final = (média + exame) ÷ 2.
- Painel do estudante e dashboard da turma: "Substitutiva" e "Exame" aparecem nas notas; com exame, "Nota final".
- Boletim e histórico: coluna Exame e resultado **Aprovado no exame** ou Reprovado pela nota final (RB-24).
- Simulador: Substitutiva e Exame não contam como avaliação restante (RB-25).
- Migração: avaliações existentes viram Prova quando o nome começa com "Prova", senão Trabalho.

**Fora do escopo**
- Mudar a média 6,0 e a frequência de 75% (continuam fixas, decisão de 2026-11-06); mais de uma substitutiva; exame que mude a situação Normal/Atenção/Risco.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-06 por Arthur.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Avaliações com tipo e lançamento do exame | [prototipo.html#avaliacao-tipos](layout/prototipo.html#avaliacao-tipos) | [x] | [x] | Arthur | 2026-11-06 |
| Boletim com exame e dados da instituição | [prototipo.html#boletim-exame](layout/prototipo.html#boletim-exame) | [x] | [x] | Arthur | 2026-11-06 |

## 4. Dependências

SPEC-003, SPEC-004, SPEC-020, SPEC-023, SPEC-026.

## 5. Comportamento esperado

**Fluxo principal:** o professor cadastra "Substitutiva" e lança as notas; as médias são recalculadas. No fim do semestre cadastra "Exame final" e lança a nota só de quem ficou abaixo de 6,0 com frequência suficiente.

**Exceções:** segunda substitutiva ou segundo exame: 409; nota de exame de estudante não elegível: 400 com o motivo; período encerrado: 409.

**Pós-condições:** notas gravadas, indicador recalculado (a substitutiva muda a média; o exame não muda a situação), histórico de notas e auditoria.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-029-01 | A substitutiva só troca uma prova, e só quando aumenta a média (RB-28). |
| INV-029-02 | A nota de exame só existe para estudante elegível no momento do lançamento (RB-29). |
| INV-029-03 | Nota final = (média + exame) ÷ 2; aprovação no exame com nota final ≥ 5,0 e frequência ≥ 75%. |
| INV-029-04 | A classificação Normal/Atenção/Risco continua só em `situacao-academica.ts` e não usa o exame (DA-02). |
| INV-029-05 | No máximo uma Substitutiva e um Exame por turma (índice único parcial). |

## 7. Modelo de domínio envolvido

`Avaliacao` ganha `tipo` {Prova, Trabalho, Substitutiva, Exame}.

## 8. Impacto arquitetural

- `calcularMedia` (`src/domain/situacao-academica.ts`) recebe o tipo de cada avaliação; nova `notaFinalComExame` e `elegivelAoExame` no mesmo arquivo.
- `resultadoDaTurma` (`src/domain/documentos.ts`) passa a considerar o exame.
- Migração: enum, coluna com backfill e índices únicos parciais por turma para Substitutiva e Exame.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| `POST /api/turmas/:id/avaliacoes` | nome, tipo, peso (Prova e Trabalho), data | avaliação | campo inválido, segunda substitutiva/exame, período encerrado |
| `POST /api/notas` | avaliação, estudante, valor | nota | estudante não elegível ao exame, demais erros da SPEC-004 |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-03 | Mesmo escopo da SPEC-004 |
| RNF-04, RNF-06 | Telas aprovadas |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-029-01 | P1 (peso 2) = 3,0, P2 (peso 2) = 7,0, Trabalho (peso 1) = 8,0 | Lança Substitutiva = 9,0 | Média passa de 5,6 para 8,0 (a P1 é trocada) |
| AC-029-02 | Estudante sem a P2 | Lança Substitutiva | A P2 (zero) é trocada |
| AC-029-03 | Substitutiva menor que todas as provas | Lança | Média não muda |
| AC-029-04 | Média 4,0 e frequência 80% | Lança exame 7,0 | Nota final 5,5; resultado no encerramento: Aprovado no exame |
| AC-029-05 | Média 6,5 ou frequência 70% | Lança exame | 400 "estudante não está em exame" |
| AC-029-06 | Turma já com substitutiva | Cadastra outra | 409 |
| AC-029-07 | Exame lançado | Consulta a situação | Situação continua a da média (não muda com o exame) |
| AC-029-08 | Avaliações sem nota: Prova 2 e Substitutiva | Abre o simulador | Só a Prova 2 conta como restante |

## 12. Casos de teste derivados

1. `calcularMedia` com substitutiva (troca, zero, sem ganho); elegibilidade e nota final (unitário).
2. Integração: cadastro com tipo, unicidade, lançamento do exame, boletim.

## 13. Questões em aberto

Nenhuma. OPEN-051 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-030 — Virada de semestre

**Status:** `implementada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-030 |
| **Nome** | Virada de semestre (copiar turmas para o período novo) |
| **Objetivo** | A secretaria copia as turmas de um período para o período novo de uma vez, com a opção de levar os estudantes. |
| **Valor** | Hoje cada turma é recriada à mão a cada semestre. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-38, RF-26 |
| **RB** | RB-13, RB-14, RB-18, RB-19, RB-20, RB-22, RB-30 |
| **RNF** | RNF-01, RNF-04, RNF-06 |
| **UC / fluxo** | UC-27 Virar o semestre |
| **Entidades** | `Turma`, `Matricula`, `PeriodoLetivo`, `RegistroAuditoria` |
| **ADRs** | ADR-001, ADR-002 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-040, OPEN-052 |

## 3. Escopo

**Incluído**
- Página **Virada de semestre** do administrador: período de origem (qualquer) e período de destino (aberto); lista das turmas de origem agrupadas por curso, com professor, número de estudantes e o que vai acontecer ("será copiada", "já existe no destino", "professor desativado").
- Marcar ou desmarcar turmas e, por turma, "levar os estudantes" (só os Ativos no curso).
- Confirmar cria tudo numa transação e mostra o resumo (turmas criadas, matrículas, puladas com o motivo); auditoria por turma criada.

**Fora do escopo**
- Copiar avaliações, atividades, notas ou chamadas; mudar professor ou nome na hora da cópia (fica para a edição, SPEC-026); rematrícula por matriz curricular.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-06 por Arthur.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Virada de semestre | [prototipo.html#virada-semestre](layout/prototipo.html#virada-semestre) | [x] | [x] | Arthur | 2026-11-06 |

## 4. Dependências

SPEC-015, SPEC-017, SPEC-019, SPEC-031.

## 5. Comportamento esperado

**Fluxo principal:** a secretaria cria o período 2027/1, abre a Virada, escolhe 2026/2 → 2027/1, revisa e confirma.

**Exceções:** destino encerrado ou igual à origem: 400; nenhuma turma marcada: 400; perfil diferente de administrador: 403.

**Pós-condições:** turmas e matrículas criadas no destino; auditoria.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-030-01 | Só se copia para período aberto (RB-20). |
| INV-030-02 | A cópia mantém disciplina e curso; a disciplina continua na grade do curso (RB-18). |
| INV-030-03 | Turma com mesmo nome e disciplina no curso de destino não é duplicada. |
| INV-030-04 | Só estudantes Ativos no curso são levados (RB-30). |
| INV-030-05 | Tudo ou nada: uma transação. |

## 7. Modelo de domínio envolvido

Sem entidade nova.

## 8. Impacto arquitetural

- Plano da cópia em `src/domain/virada.ts` (puro: o que copiar, o que pular e por quê); caso de uso em `src/server/academico/virada.ts`.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| `GET /api/virada?origem=&destino=` | — | prévia por turma | período inválido |
| `POST /api/virada` | origem, destino, turmas (id, levarEstudantes) | resumo | período inválido, nenhuma turma, sem permissão |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-01 | Virada de 15 turmas e 70 estudantes em menos de 3 s |
| RNF-04, RNF-06 | Tela aprovada |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-030-01 | 3 turmas em 2026/2 e 2027/1 aberto | Copia as 3 sem estudantes | 3 turmas em 2027/1 com o mesmo professor, disciplina e curso |
| AC-030-02 | Turma com 10 estudantes, 1 trancado | Copia levando os estudantes | 9 matrículas na turma nova |
| AC-030-03 | Turma já copiada | Copia de novo | Pulada: "já existe no destino" |
| AC-030-04 | Professor desativado | Prévia | "professor desativado"; não é copiada |
| AC-030-05 | Destino encerrado | Confirma | 400 |
| AC-030-06 | Coordenador | Abre a virada | 403 |

## 12. Casos de teste derivados

1. Plano da cópia (unitário).
2. Integração: cópia, estudantes, duplicada, transação.

## 13. Questões em aberto

Nenhuma. OPEN-052 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-031 — Situação do estudante no curso

**Status:** `implementada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-031 |
| **Nome** | Situação do estudante no curso (trancamento, transferência, cancelamento, conclusão e troca de curso) |
| **Objetivo** | A secretaria registra a situação do estudante no curso, e matrículas trancadas ou canceladas saem das listas de trabalho sem sumir do histórico. |
| **Valor** | Aluno que tranca ou sai continuaria aparecendo na chamada, nas notas e nos alertas como se estivesse cursando. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-39 |
| **RB** | RB-13, RB-19, RB-20, RB-22, RB-24, RB-30 |
| **RNF** | RNF-03, RNF-04, RNF-05, RNF-06 |
| **UC / fluxo** | UC-28 Alterar situação do estudante |
| **Entidades** | `FichaEstudante` (situação), `Matricula` (situação), `Usuario` (curso) |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-032, OPEN-053 |

## 3. Escopo

**Incluído**
- Na ficha do estudante (SPEC-033), bloco **Situação no curso**: situação atual, desde quando e motivo; ação **Alterar situação** (Ativo, Trancado, Transferido, Cancelado, Concluído) com data e motivo obrigatório.
- Trancar: matrículas em turmas de período aberto viram **Trancada**; transferir ou cancelar: **Cancelada**. Concluir e reativar não mexem nas matrículas.
- Matrícula trancada ou cancelada sai da chamada, do lançamento de notas e entregas, dos planos, dos dashboards, dos alertas e dos relatórios; o boletim e o histórico mostram "Trancada" ou "Cancelada" (RB-24).
- Estudante não Ativo não é matriculado nem importado (RB-30); o painel dele mostra a situação.
- **Trocar curso** (só Ativo sem matrícula cursando em período aberto, RB-19).
- Auditoria acadêmica com o curso.

**Fora do escopo**
- Reativar matrícula trancada automaticamente; prazos e taxas de trancamento; documento de transferência.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-06 por Arthur.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Ficha do estudante — situação, abonos e documentos | [prototipo.html#estudante-secretaria](layout/prototipo.html#estudante-secretaria) | [x] | [x] | Arthur | 2026-11-06 |

## 4. Dependências

SPEC-015, SPEC-017, SPEC-019, SPEC-020, SPEC-033.

## 5. Comportamento esperado

**Fluxo principal:** o estudante pede trancamento na secretaria; a secretaria abre a ficha, escolhe Trancado, informa data e motivo e confirma.

**Exceções:** motivo vazio ou data futura: 400; mesma situação atual: 400; troca de curso com matrícula cursando: 409; perfil diferente de administrador: 403.

**Pós-condições:** situação gravada, matrículas abertas ajustadas e auditoria na mesma transação.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-031-01 | Matrícula de período encerrado nunca muda de situação. |
| INV-031-02 | Matrícula não Cursando não aparece em nenhuma lista de trabalho nem nos números dos dashboards (RB-30). |
| INV-031-03 | Só estudante Ativo recebe matrícula nova (RB-30). |
| INV-031-04 | O histórico continua completo depois da troca de curso. |

## 7. Modelo de domínio envolvido

`FichaEstudante` ganha `situacaoCurso`, `situacaoDesde`, `situacaoMotivo`; `Matricula` ganha `situacao` {Cursando, Trancada, Cancelada}.

## 8. Impacto arquitetural

- Regras puras em `src/domain/situacao-curso.ts` (transições e efeito nas matrículas).
- Filtro único `MATRICULA_CURSANDO` em `src/server/dados/` usado por todas as consultas de trabalho (chamada, notas, entregas, planos, dashboards, alertas, relatórios, comunicados, importação).
- Migração: enum e coluna em `Matricula` (padrão Cursando). **Ajustado na implementação (2026-11-06):** `IndicadorAcademico` e `Frequencia` ganharam chave estrangeira para a `Matricula` (migração `nivel_1_vinculos_matricula`), para os dashboards filtrarem a matrícula cursando na própria query.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| `PUT /api/estudantes/:id/situacao` | situação, data, motivo | ficha | campo inválido, sem permissão, não encontrado |
| `PUT /api/estudantes/:id/curso` | cursoId | estudante | matrícula cursando, curso inexistente |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-03 | Só o administrador altera; filtro de matrícula na query |
| RNF-04, RNF-06 | Tela aprovada |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-031-01 | Estudante com 3 turmas em 2026/2 e 2 em 2026/1 | Trancado | As 3 de 2026/2 ficam Trancadas; as de 2026/1 não mudam |
| AC-031-02 | Matrícula trancada | Professor abre a chamada e as notas | O estudante não aparece |
| AC-031-03 | Matrícula trancada | Coordenador abre o dashboard e o relatório | Não conta nos números |
| AC-031-04 | Estudante trancado | Coordenador tenta matricular | 409 |
| AC-031-05 | Estudante cancelado | Abre o histórico | Turma com resultado "Cancelada" |
| AC-031-06 | Estudante Ativo sem turma aberta | Troca de curso | Curso novo; histórico mantido |
| AC-031-07 | Estudante com matrícula cursando | Troca de curso | 409 |
| AC-031-08 | Coordenador | Tenta alterar a situação | 403 |

## 12. Casos de teste derivados

1. Transições e efeito nas matrículas (unitário).
2. Integração: trancar, listas de trabalho, matrícula recusada, troca de curso.

## 13. Questões em aberto

Nenhuma. OPEN-053 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-032 — Abono de faltas

**Status:** `implementada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-032 |
| **Nome** | Abono de faltas |
| **Objetivo** | A secretaria registra um abono por um intervalo de datas e as faltas desse período passam a contar como presença. |
| **Valor** | Atestados e regimes especiais (exercícios domiciliares, licença-maternidade, serviço militar) mudam a frequência e hoje não têm onde ser registrados. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-40 |
| **RB** | RB-10, RB-13, RB-20, RB-21, RB-22, RB-31 |
| **RNF** | RNF-03, RNF-04, RNF-05, RNF-06 |
| **UC / fluxo** | UC-29 Registrar abono de faltas |
| **Entidades** | `Abono` (nova), `Presenca`, `Frequencia`, `IndicadorAcademico` |
| **ADRs** | ADR-001, ADR-002 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-041, OPEN-054 |

## 3. Escopo

**Incluído**
- Na ficha do estudante, bloco **Abonos de faltas**: lista (período, motivo, faltas abonadas, quem registrou) e **Novo abono** (data inicial, data final, motivo, observação). A secretaria vê quantas faltas serão abonadas antes de salvar.
- Excluir um abono (com confirmação) devolve as faltas.
- Frequência e indicador recalculados nas turmas de período aberto com aula no intervalo; turmas de período encerrado não mudam (RB-20).
- Na chamada, a falta abonada aparece como "Abonada" para o professor; no painel do estudante, a frequência já vem com o abono.
- Auditoria acadêmica por turma afetada.

**Fora do escopo**
- Anexar o atestado; pedido de abono feito pelo estudante; compensação de ausência com atividades.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-06 por Arthur.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Ficha do estudante — abonos | [prototipo.html#estudante-secretaria](layout/prototipo.html#estudante-secretaria) | [x] | [x] | Arthur | 2026-11-06 |
| Chamada com falta abonada | [prototipo.html#chamada-aulas](layout/prototipo.html#chamada-aulas) | [x] | [x] | Arthur | 2026-11-06 |

## 4. Dependências

SPEC-017, SPEC-018, SPEC-019, SPEC-028, SPEC-033.

## 5. Comportamento esperado

**Fluxo principal:** o estudante entrega o atestado na secretaria; a secretaria abre a ficha, registra o abono de 03/11 a 07/11 por atestado médico e salva.

**Exceções:** data final antes da inicial ou intervalo maior que 180 dias: 400; motivo inválido: 400; perfil diferente de administrador: 403.

**Pós-condições:** abono gravado; frequência e indicador recalculados; auditoria na mesma transação.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-032-01 | Falta abonada conta como presença; presença continua presença (RB-31). |
| INV-032-02 | Abonos sobrepostos não contam a mesma falta duas vezes. |
| INV-032-03 | Só turmas de período aberto são recalculadas. |
| INV-032-04 | Abono, recálculo e auditoria na mesma transação. |

## 7. Modelo de domínio envolvido

Nova entidade **Abono** (id, início, fim, motivo, observação, criadoEm), de 1 estudante, registrada por 1 administrador.

## 8. Impacto arquitetural

- `frequenciaPelaChamada` recebe as datas abonadas (`src/domain/frequencia.ts`); `faltaAbonada(data, abonos)` puro.
- Caso de uso em `src/server/academico/abonos.ts`; migração com a tabela e o enum de motivo.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| `GET /api/estudantes/:id/abonos` | — | abonos | não encontrado |
| `POST /api/estudantes/:id/abonos` | início, fim, motivo, observação | abono e faltas abonadas | intervalo inválido, motivo inválido |
| `DELETE /api/abonos/:id` | — | excluído | não encontrado |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-03, RNF-05 | Só o administrador registra; o professor vê só "Abonada" |
| RNF-04, RNF-06 | Telas aprovadas |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-032-01 | 10 aulas, 4 faltas, 2 delas entre 03/11 e 07/11 | Abono de 03/11 a 07/11 | Frequência de 60% para 80%; indicador recalculado |
| AC-032-02 | Abono registrado | Excluído | Frequência volta a 60% |
| AC-032-03 | Dois abonos sobrepostos | Registrados | A mesma falta conta uma vez |
| AC-032-04 | Fim antes do início ou mais de 180 dias | Salva | 400 |
| AC-032-05 | Falta abonada | Professor abre a chamada | Aparece "Abonada" |
| AC-032-06 | Turma de período encerrado no intervalo | Abono | Frequência dela não muda |
| AC-032-07 | Coordenador ou professor | Tenta registrar | 403 |

## 12. Casos de teste derivados

1. Frequência com abono, sobreposição e limites (unitário).
2. Integração: registrar, excluir, período encerrado, chamada.

## 13. Questões em aberto

Nenhuma. OPEN-054 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-033 — Ficha do estudante e dados da instituição

**Status:** `implementada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-033 |
| **Nome** | Ficha do estudante e dados da instituição |
| **Objetivo** | Todo estudante ganha número de matrícula e dados pessoais; a instituição ganha nome, CNPJ, endereço e logotipo, que saem nos documentos. |
| **Valor** | Escola identifica o aluno pela matrícula e emite documento com os próprios dados, não com "StudyTrack". |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-41, RF-42, RF-29 |
| **RB** | RB-02, RB-03, RB-04, RB-13, RB-22, RB-33 |
| **RNF** | RNF-02, RNF-03, RNF-04, RNF-05, RNF-06 |
| **UC / fluxo** | UC-30 Manter ficha do estudante; UC-31 Manter dados da instituição |
| **Entidades** | `FichaEstudante` (nova), `Instituicao` (nova), `Usuario` |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-055 |

## 3. Escopo

**Incluído**
- **Número de matrícula**: ano de criação da conta + sequência de 4 dígitos (ex.: 20260042), gerado para todo estudante novo (tela, coordenação, importação, seed) e para os existentes na migração, em ordem de criação. Aparece nas listas, no lançamento de notas, na chamada e nos documentos.
- **Ficha** (página do estudante na secretaria): CPF (validado, único), data de nascimento, telefone, responsável (nome e telefone), todos opcionais; editada pelo administrador.
- Leitura da ficha: coordenador do curso (na turma e na lista de estudantes) e o próprio estudante ("Meus dados" em Documentos). O professor vê só nome e matrícula (RB-33).
- **Dados da instituição** (administrador): nome, CNPJ (validado), endereço, cidade/UF, telefone, e-mail, responsável pela secretaria e logotipo (PNG ou JPG até 200 KB). Sem dados gravados, os documentos continuam com "StudyTrack".
- Boletim e histórico: cabeçalho com logotipo, nome, CNPJ e endereço; número de matrícula do estudante; rodapé com a linha de assinatura do responsável pela secretaria.
- Auditoria administrativa (instituição) e acadêmica (ficha, com o curso), sem o CPF completo (só os 3 últimos dígitos).

**Fora do escopo**
- Endereço do estudante, documentos digitalizados, foto; vários campi; o estudante editar a própria ficha.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-06 por Arthur.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Ficha do estudante | [prototipo.html#estudante-secretaria](layout/prototipo.html#estudante-secretaria) | [x] | [x] | Arthur | 2026-11-06 |
| Dados da instituição | [prototipo.html#instituicao](layout/prototipo.html#instituicao) | [x] | [x] | Arthur | 2026-11-06 |
| Boletim com os dados da instituição | [prototipo.html#boletim-exame](layout/prototipo.html#boletim-exame) | [x] | [x] | Arthur | 2026-11-06 |

## 4. Dependências

SPEC-002, SPEC-010, SPEC-015, SPEC-019, SPEC-020, SPEC-021.

## 5. Comportamento esperado

**Fluxo principal:** a secretaria abre o estudante, completa CPF, nascimento e responsável e salva; preenche uma vez os dados da instituição; os documentos passam a sair com eles.

**Exceções:** CPF inválido ou de outro estudante: 400 com o campo; data de nascimento futura: 400; logotipo de outro formato ou maior que 200 KB: 400; perfil sem permissão: 403; estudante de outro curso para o coordenador: 404.

**Pós-condições:** ficha ou instituição gravadas com auditoria.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-033-01 | Todo estudante tem exatamente uma ficha e um número de matrícula único que não muda. |
| INV-033-02 | CPF único entre estudantes (índice único parcial). |
| INV-033-03 | Professor nunca recebe CPF, nascimento, telefone ou responsável (RB-33). |
| INV-033-04 | Existe no máximo um registro de instituição. |

## 7. Modelo de domínio envolvido

Novas entidades **FichaEstudante** (1:1 com o estudante) e **Instituicao** (registro único).

## 8. Impacto arquitetural

- Validações puras em `src/domain/ficha.ts` (CPF, CNPJ, número de matrícula, logotipo).
- Casos de uso em `src/server/academico/fichas.ts` e `src/server/academico/instituicao.ts`; toda criação de estudante cria a ficha na mesma transação.
- Migração: tabelas, backfill das fichas dos estudantes existentes e sequência por ano. **Ajustado na implementação (2026-11-06):** a ficha nasce por um gatilho do banco na inserção do estudante (mesma regra de `numeroDeMatricula`), para valer em todo caminho de cadastro.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| `GET` / `PUT /api/estudantes/:id/ficha` | CPF, nascimento, telefone, responsável | ficha | campo inválido, CPF repetido, não encontrado |
| `GET` / `PUT /api/instituicao` | nome, CNPJ, endereço, contato, responsável, logotipo | instituição | campo inválido, logotipo inválido, sem permissão |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-05 | Professor recebe só nome e matrícula; teste da resposta |
| RNF-04, RNF-06 | Telas aprovadas; documento impresso com cabeçalho |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-033-01 | Estudante novo criado em 2026 | Cadastrado | Recebe 2026NNNN, um a mais que o último de 2026 |
| AC-033-02 | Ficha | Salva CPF inválido ou de outro estudante | 400 com o campo CPF |
| AC-033-03 | Coordenador do curso | Abre a ficha | Vê os dados, sem editar |
| AC-033-04 | Professor | Consulta estudante da turma | Só nome e matrícula |
| AC-033-05 | Estudante | Abre "Meus dados" | Vê a própria ficha |
| AC-033-06 | Instituição preenchida | Emite o boletim | Cabeçalho com logotipo, nome, CNPJ e endereço; assinatura da secretaria |
| AC-033-07 | Logotipo de 500 KB | Salva | 400 |
| AC-033-08 | Estudantes existentes | Migração | Todos com ficha e matrícula, sem repetir |

## 12. Casos de teste derivados

1. CPF, CNPJ, número de matrícula, logotipo (unitário).
2. Integração: ficha, privacidade por perfil, instituição nos documentos.

## 13. Questões em aberto

Nenhuma. OPEN-055 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-034 — Busca e paginação

**Status:** `implementada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-034 |
| **Nome** | Busca e paginação |
| **Objetivo** | As listas que crescem com o número de alunos ganham busca por nome, e-mail ou matrícula e páginas de 25 itens. |
| **Valor** | Com milhares de contas, uma lista sem busca nem página fica lenta e inútil. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-43, RF-16, RF-20, RF-31 |
| **RB** | RB-02, RB-03, RB-04, RB-13, RB-23 |
| **RNF** | RNF-01, RNF-03, RNF-04, RNF-06 |
| **UC / fluxo** | UC-11 Gerenciar contas; UC-13 Consultar histórico de notas; UC-21 Consultar notificações; UC-30 Manter ficha do estudante |
| **Entidades** | leitura de `Usuario`, `FichaEstudante`, `HistoricoNota`, `Notificacao` |
| **ADRs** | ADR-001, ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-056 |

## 3. Escopo

**Incluído**
- Componente único de **busca** (campo com "Buscar por nome, e-mail ou matrícula") e **paginação** ("1–25 de 312", Anterior/Próxima), com a busca e a página no endereço (`?q=&pagina=`).
- Listas: **Contas** (administrador, junto com o filtro de perfil), **Estudantes** (administrador: todos; coordenador: os dos cursos dele), **Histórico de notas** e **Notificações**.
- A busca ignora maiúsculas e acentos e aceita parte do nome.

**Fora do escopo**
- Busca global no menu; ordenação por coluna; exportar a lista.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-06 por Arthur.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Estudantes com busca e paginação | [prototipo.html#estudantes-lista](layout/prototipo.html#estudantes-lista) | [x] | [x] | Arthur | 2026-11-06 |

## 4. Dependências

SPEC-010, SPEC-013, SPEC-022, SPEC-033.

## 5. Comportamento esperado

**Fluxo principal:** a secretaria digita "joão" e vê as contas e estudantes que batem, 25 por página.

**Exceções:** página fora do intervalo: mostra a última; busca sem resultado: "Nenhum resultado para …".

**Pós-condições:** nada é gravado.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-034-01 | Busca e página dentro da mesma query que filtra o escopo (ADR-003). |
| INV-034-02 | Página de no máximo 25 itens; o total vem da mesma condição. |

## 7. Modelo de domínio envolvido

Sem entidade nova. **Ajustado na implementação (2026-11-06):** a busca sem acento compara `translate(lower(nome))` na própria consulta, sem coluna nova (a coluna `nomeBusca` prevista não foi criada); o resultado para quem usa é o mesmo.

## 8. Impacto arquitetural

- `paginar` e `normalizarBusca` puros em `src/domain/paginacao.ts`; componente `Paginacao` e `CampoBusca` em `src/components`.
- Sem migração: a busca fica em `src/server/dados/busca.ts` (nome sem acento por `translate`, e-mail e número de matrícula).

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| `GET /api/contas` | perfil, q, pagina | itens, total, página | sem permissão |
| `GET /api/estudantes` | q, pagina, cursoId | itens, total, página | sem permissão |
| `GET /api/historico-notas` | filtros atuais, pagina | itens, total, página | sem permissão |
| `GET /api/notificacoes` | pagina | itens, total, página | sem permissão |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-01 | Lista de 2.000 contas respondendo em menos de 3 s |
| RNF-04, RNF-06 | Tela aprovada |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-034-01 | 60 contas | Abre Contas | 25 na página 1; "1–25 de 60" |
| AC-034-02 | Conta "João Pereira" | Busca "joao" | Encontra |
| AC-034-03 | Estudante com matrícula 20260042 | Busca "0042" | Encontra |
| AC-034-04 | Coordenador | Busca um estudante de outro curso | Não aparece |
| AC-034-05 | Página 9 de 3 | Abre | Mostra a página 3 |

## 12. Casos de teste derivados

1. `paginar` e `normalizarBusca` (unitário).
2. Integração: cada lista com busca, página e escopo.

## 13. Questões em aberto

Nenhuma. OPEN-056 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-035 — Secretaria acadêmica no perfil Administrador

**Status:** `implementada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-035 |
| **Nome** | Secretaria acadêmica no perfil Administrador |
| **Objetivo** | O administrador vira a secretaria: ganha as telas de estudantes, pedidos de senha, virada de semestre, instituição e emissão de documentos, sem abrir os dados acadêmicos de trabalho. |
| **Valor** | O sistema passa a ter quem faz o papel da secretaria sem criar um quinto perfil. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-29, RF-02, RF-25 |
| **RB** | RB-01, RB-13, RB-22 |
| **RNF** | RNF-03, RNF-04, RNF-05, RNF-06 |
| **UC / fluxo** | UC-19 Emitir boletim e histórico; UC-18 Consultar auditoria |
| **Entidades** | leitura de `Usuario`, `FichaEstudante`, `RegistroAuditoria`, `PedidoSenha` |
| **ADRs** | ADR-001, ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-025, OPEN-034, OPEN-057 |

## 3. Escopo

**Incluído**
- Menu do administrador: Dashboard, Contas, **Estudantes**, **Pedidos de senha** (com contador), Cursos, Períodos letivos, **Virada de semestre**, **Instituição**, Auditoria.
- Página **Estudantes** (lista com busca, SPEC-034) e a **ficha** de cada estudante: dados (SPEC-033), situação no curso (SPEC-031), abonos (SPEC-032) e **Emitir boletim / histórico** (SPEC-020).
- Recurso `documentos` passa a incluir o Administrador para qualquer estudante.
- Dashboard do administrador ganha "Pedidos de senha pendentes" e "Estudantes por situação no curso" (contagens, sem nota).
- Auditoria do administrador: registros administrativos e os acadêmicos feitos por administradores.
- Os recursos de trabalho acadêmico (lançamentos, dashboards acadêmicos, relatórios, alertas, planos, histórico de notas) continuam negados ao administrador (RB-13).

**Fora do escopo**
- Perfil novo; o administrador lançar ou corrigir nota, chamada ou atividade.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-06 por Arthur.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Dashboard da secretaria (administrador) | [prototipo.html#dashboard-secretaria](layout/prototipo.html#dashboard-secretaria) | [x] | [x] | Arthur | 2026-11-06 |
| Estudantes (lista) | [prototipo.html#estudantes-lista](layout/prototipo.html#estudantes-lista) | [x] | [x] | Arthur | 2026-11-06 |
| Ficha do estudante | [prototipo.html#estudante-secretaria](layout/prototipo.html#estudante-secretaria) | [x] | [x] | Arthur | 2026-11-06 |

## 4. Dependências

SPEC-010, SPEC-016, SPEC-019, SPEC-020, SPEC-027, SPEC-030 a SPEC-034.

## 5. Comportamento esperado

**Fluxo principal:** a secretaria entra, vê os pedidos pendentes no dashboard, busca o estudante, abre a ficha e emite o histórico.

**Exceções:** administrador em página de trabalho acadêmico (lançar notas, relatórios, dashboard de turma): acesso negado (RB-13).

**Pós-condições:** nada novo é gravado por esta Spec além do que as Specs 027 e 030 a 033 gravam.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-035-01 | O administrador emite documentos de qualquer estudante; continua negado nos recursos de trabalho acadêmico (RB-13). |
| INV-035-02 | O administrador vê na auditoria os registros administrativos e os acadêmicos de autoria de administradores, nunca os de professores e coordenadores. |
| INV-035-03 | Os números do dashboard da secretaria são contagens de contas, pedidos e situações no curso, sem nota nem frequência. |

## 7. Modelo de domínio envolvido

Sem entidade nova.

## 8. Impacto arquitetural

- `src/domain/autorizacao.ts`: recursos novos `secretaria` e `pedidosSenha` (Administrador) e `documentos` com Administrador; `fichaEstudante` (Administrador, Coordenador, Estudante).
- Menu e dashboard do administrador; filtro da auditoria do administrador.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| `GET /documentos/boletim?estudanteId=&periodo=` | — | boletim | estudante inexistente |
| `GET /documentos/historico?estudanteId=` | — | histórico | estudante inexistente |
| `GET /api/auditoria` | filtros, página | registros do escopo | sem permissão |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-03, RNF-05 | Teste de cada recurso acadêmico negado ao administrador; documentos permitidos |
| RNF-04, RNF-06 | Telas aprovadas |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-035-01 | Administrador | Emite o histórico de qualquer estudante | Documento completo |
| AC-035-02 | Administrador | Abre lançamento de notas, relatórios, dashboard da turma ou histórico de notas | Acesso negado |
| AC-035-03 | Administrador | Abre a auditoria | Vê os registros administrativos e os acadêmicos que ele (ou outro administrador) fez; não vê lançamento de nota |
| AC-035-04 | 2 pedidos pendentes | Abre o dashboard | "Pedidos de senha: 2" com link |
| AC-035-05 | Estudantes com situações diferentes | Abre o dashboard | Contagem por situação no curso |

## 12. Casos de teste derivados

1. Mapa de autorização (unitário): recursos novos e negação dos acadêmicos.
2. Integração: documentos pelo administrador, auditoria filtrada, dashboard.

## 13. Questões em aberto

Nenhuma. OPEN-057 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-036 — Requerimentos online

**Status:** `aprovada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-036 |
| **Nome** | Requerimentos online |
| **Objetivo** | O estudante abre pedidos formais (revisão de prova, segunda chamada, declaração, trancamento, outro) que chegam a quem resolve, com protocolo, prazo e resposta. |
| **Valor** | Substitui o papel e o e-mail da secretaria por um fluxo com prazo e histórico. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-44 |
| **RB** | RB-02, RB-03, RB-13, RB-22, RB-23, RB-34 |
| **RNF** | RNF-03, RNF-04, RNF-05, RNF-06 |
| **UC / fluxo** | UC-32 Abrir requerimento; UC-33 Responder requerimento |
| **Entidades** | `Requerimento` (nova), `Notificacao` (tipo Requerimento), `RegistroAuditoria` |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-058, OPEN-062 |

## 3. Escopo

**Incluído**
- Página **Requerimentos** do estudante: lista dos próprios (protocolo, tipo, status, prazo) e **Novo requerimento** (tipo; turma cursando para revisão e segunda chamada, avaliação opcional; descrição até 1.000 caracteres).
- Protocolo `AAAA-NNNNNN` (sequência do ano); prazo de 5 dias úteis sem sábados, domingos e feriados/recessos do calendário (SPEC-040).
- Página **Requerimentos** do professor (os das turmas que leciona, de revisão e segunda chamada) e da secretaria (declaração, trancamento e outro): pendentes primeiro, atrasados em destaque; **Em análise**, **Deferir** e **Indeferir** com resposta (obrigatória ao indeferir).
- Coordenação: os requerimentos do curso, só leitura.
- Notificação ao estudante a cada mudança de status; auditoria acadêmica com o curso.
- **Declaração de matrícula** deferida: o estudante abre uma página pronta para imprimir com os dados da instituição, curso, situação e turmas cursando (sem código de verificação, item 28 fora do escopo).

**Fora do escopo**
- Anexos; taxa; trancamento automático (a secretaria registra na ficha, SPEC-031); reabrir requerimento decidido.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-08 por Arthur.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Requerimentos do estudante | [prototipo.html#requerimentos-estudante](layout/prototipo.html#requerimentos-estudante) | [x] | [x] | Arthur | 2026-11-08 |
| Responder requerimentos (professor/secretaria) | [prototipo.html#requerimentos-responder](layout/prototipo.html#requerimentos-responder) | [x] | [x] | Arthur | 2026-11-08 |

## 4. Dependências

SPEC-019, SPEC-022, SPEC-031, SPEC-033, SPEC-035, SPEC-040.

## 5. Comportamento esperado

**Fluxo principal:** o estudante pede revisão da Prova 1; o professor analisa e defere com a resposta; o estudante é notificado.

**Exceções:** tipo inválido, descrição vazia ou turma que não cursa: 400; responder requerimento de outro: 404; indeferir sem resposta: 400; requerimento já decidido: 409.

**Pós-condições:** requerimento e auditoria gravados na mesma transação; notificação ao estudante.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-036-01 | Protocolo único; prazo = 5 dias úteis depois da abertura (RB-34). |
| INV-036-02 | Só o responsável (professor da turma ou secretaria) muda o status. |
| INV-036-03 | Estudante vê só os próprios; coordenador só os do curso, sem responder. |
| INV-036-04 | Deferido e indeferido são finais. |

## 7. Modelo de domínio envolvido

Nova entidade **Requerimento**; `TipoNotificacao` ganha Requerimento.

## 8. Impacto arquitetural

- Regras puras em `src/domain/requerimentos.ts` (destino, dias úteis, transições, protocolo).
- Casos de uso em `src/server/academico/requerimentos.ts`; migração com tabela, enums e índice do protocolo.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| `GET /api/requerimentos` | sessão | requerimentos do escopo | sem permissão |
| `POST /api/requerimentos` | tipo, turmaId?, avaliacaoId?, descrição | requerimento com protocolo e prazo | campo inválido |
| `PATCH /api/requerimentos/:id` | status (EmAnalise, Deferido, Indeferido), resposta | requerimento | não responsável, já decidido, resposta faltando |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-03, RNF-05 | Escopo na query; estudante não vê requerimento de outro |
| RNF-04, RNF-06 | Telas aprovadas |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-036-01 | Estudante cursando a turma | Pede revisão de prova | Protocolo, prazo de 5 dias úteis, destino professor da turma; aparece para o professor |
| AC-036-02 | Pedido aberto numa sexta, feriado na terça seguinte | Calcula o prazo | O prazo pula sábado, domingo e o feriado |
| AC-036-03 | Professor da turma | Defere com resposta | Status Deferido; estudante notificado; auditoria |
| AC-036-04 | Secretaria | Indefere sem resposta | 400 |
| AC-036-05 | Outro professor | Tenta responder | 404 |
| AC-036-06 | Requerimento deferido | Muda de novo | 409 |
| AC-036-07 | Declaração de matrícula deferida | Estudante abre a declaração | Documento com instituição, curso e turmas cursando |
| AC-036-08 | Estudante de outra turma | Pede segunda chamada nela | 400 |
| AC-036-09 | Coordenador | Abre os requerimentos | Vê os do curso, sem os botões de resposta |

## 12. Casos de teste derivados

1. Destino, dias úteis, transições, protocolo (unitário).
2. Abertura, resposta, escopo, notificação e declaração (integração).

## 13. Questões em aberto

Nenhuma. OPEN-058 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-037 — Matriz curricular e integralização

**Status:** `aprovada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-037 |
| **Nome** | Matriz curricular e integralização |
| **Objetivo** | A grade do curso vira matriz (semestre, obrigatória/optativa, pré-requisitos) e o estudante vê quanto já concluiu. |
| **Valor** | É o "mapa do curso": mostra o caminho até a formatura e alimenta a rematrícula e a conclusão. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-45, RF-23 |
| **RB** | RB-04, RB-18, RB-22, RB-24, RB-35, RB-41 |
| **RNF** | RNF-03, RNF-04, RNF-06 |
| **UC / fluxo** | UC-34 Montar matriz curricular |
| **Entidades** | `CursoDisciplina` (semestre, obrigatoria), `PreRequisito` (nova) |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-033, OPEN-059 |

## 3. Escopo

**Incluído**
- Em **Disciplinas** do coordenador, aba **Matriz**: por disciplina da grade, semestre sugerido (1 a 10 ou sem semestre), obrigatória ou optativa, e pré-requisitos (escolhidos entre as disciplinas da mesma matriz).
- Página **Meu curso** do estudante: matriz por semestre com a situação de cada disciplina (Aprovada, Aproveitada, Cursando, Reprovada, Pendente, Bloqueada por pré-requisito), horas obrigatórias concluídas e o percentual de integralização (RB-35).
- Na ficha do estudante (secretaria e coordenação), o mesmo resumo de integralização.

**Fora do escopo**
- Versões de matriz por ano de ingresso; equivalências entre disciplinas; créditos.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-08 por Arthur.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Matriz do curso (coordenador) | [prototipo.html#matriz-coordenador](layout/prototipo.html#matriz-coordenador) | [x] | [x] | Arthur | 2026-11-08 |
| Meu curso (estudante) | [prototipo.html#meu-curso](layout/prototipo.html#meu-curso) | [x] | [x] | Arthur | 2026-11-08 |

## 4. Dependências

SPEC-015, SPEC-019, SPEC-020, SPEC-029, SPEC-033.

## 5. Comportamento esperado

**Fluxo principal:** o coordenador marca Cálculo I no 1º semestre, obrigatória, e Cálculo II com pré-requisito Cálculo I; o estudante vê Cálculo II bloqueada até ser aprovado em Cálculo I.

**Exceções:** semestre fora de 1 a 10: 400; pré-requisito fora da matriz, a própria disciplina ou ciclo: 400 (RB-41); disciplina de curso de outro coordenador: 404.

**Pós-condições:** matriz gravada com auditoria; integralização calculada na leitura (nada é gravado).

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-037-01 | Integralização = horas obrigatórias aprovadas ou aproveitadas ÷ horas obrigatórias × 100 (RB-35). |
| INV-037-02 | Pré-requisito é da mesma matriz e não forma ciclo (RB-41). |
| INV-037-03 | A integralização usa o resultado da regra única do histórico (RB-24). |

## 7. Modelo de domínio envolvido

`CursoDisciplina` ganha `semestre` e `obrigatoria`; nova entidade **PreRequisito** (curso, disciplina, requisito).

## 8. Impacto arquitetural

- `src/domain/matriz.ts` (situação por disciplina, integralização, detecção de ciclo).
- Casos de uso em `src/server/academico/matriz.ts`; migração com colunas e tabela.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| `PUT /api/cursos/:id/matriz/:disciplinaId` | semestre, obrigatoria, preRequisitos[] | linha da matriz | campo inválido, ciclo, fora do escopo |
| `GET /api/estudantes/:id/curso` | — | matriz com situação e integralização | não encontrado |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-03 | Escopo do coordenador na query |
| RNF-04, RNF-06 | Telas aprovadas |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-037-01 | Disciplina da grade | Coordenador define semestre 2, obrigatória, pré-requisito X | Gravado; auditoria |
| AC-037-02 | A exige B | Coordenador põe A como pré-requisito de B | 400 (ciclo) |
| AC-037-03 | Matriz com 300 h obrigatórias; estudante aprovado em 120 h e com 60 h aproveitadas | Abre Meu curso | 60% |
| AC-037-04 | Pré-requisito não aprovado | Estudante abre Meu curso | Disciplina aparece Bloqueada, com o que falta |
| AC-037-05 | Optativa aprovada | Calcula | Não entra na integralização |
| AC-037-06 | Coordenador de outro curso | Tenta editar a matriz | 404 |

## 12. Casos de teste derivados

1. Situação por disciplina, integralização e ciclo (unitário).
2. Edição da matriz e consulta do curso (integração).

## 13. Questões em aberto

Nenhuma. OPEN-059 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-038 — Rematrícula pelo estudante

**Status:** `aprovada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-038 |
| **Nome** | Rematrícula pelo estudante |
| **Objetivo** | O estudante escolhe as próprias turmas do período, dentro da janela da secretaria, com vagas, pré-requisitos e sem choque de horário. |
| **Valor** | Tira da coordenação a matrícula turma a turma e mostra na hora por que uma turma não pode ser escolhida. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-46 |
| **RB** | RB-19, RB-20, RB-22, RB-30, RB-32, RB-36, RB-39, RB-41 |
| **RNF** | RNF-01, RNF-03, RNF-04, RNF-06 |
| **UC / fluxo** | UC-35 Rematricular-se |
| **Entidades** | `PeriodoLetivo` (janela), `Turma` (vagas), `Matricula`, `HorarioTurma` |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-060 |

## 3. Escopo

**Incluído**
- Em **Períodos letivos**, a secretaria define a janela de rematrícula (início e fim) de cada período aberto.
- Na turma, o coordenador define as **vagas** (vazio = sem limite; não passa da menor capacidade das salas, RB-39).
- Página **Rematrícula** do estudante: períodos com janela aberta hoje; turmas do curso com disciplina, semestre sugerido, horários, vagas restantes e, quando não pode, o motivo (sem vaga, pré-requisito pendente, já aprovado, choque com outra turma, já matriculado). Botões **Matricular** e **Cancelar** (só na janela e sem registros, RB-32).
- Vaga conferida na transação, com bloqueio da turma; auditoria acadêmica.

**Fora do escopo**
- Lista de espera; aprovação da coordenação; quebra de pré-requisito.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-08 por Arthur.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Rematrícula (estudante) | [prototipo.html#rematricula](layout/prototipo.html#rematricula) | [x] | [x] | Arthur | 2026-11-08 |

## 4. Dependências

SPEC-017, SPEC-026, SPEC-031, SPEC-037, SPEC-041.

## 5. Comportamento esperado

**Fluxo principal:** com a janela aberta, o estudante vê Banco de Dados com 3 vagas e se matricula; a turma passa a 2 vagas.

**Exceções:** fora da janela: 409; sem vaga, pré-requisito, já aprovado, choque: 409 com o motivo; turma de outro curso: 404; estudante não Ativo: 409.

**Pós-condições:** matrícula e auditoria gravadas na mesma transação.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-038-01 | Matrículas cursando de uma turma nunca passam das vagas (RB-36). |
| INV-038-02 | O estudante não fica com duas turmas em horário sobreposto no mesmo período. |
| INV-038-03 | Só turmas do curso do estudante e de período com janela aberta. |

## 7. Modelo de domínio envolvido

`PeriodoLetivo` ganha `rematriculaInicio` e `rematriculaFim`; `Turma` ganha `vagas`.

## 8. Impacto arquitetural

- `src/domain/rematricula.ts` (motivos de recusa, sobreposição de horários).
- Caso de uso em `src/server/academico/rematricula.ts` com `SELECT ... FOR UPDATE` na turma.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| `GET /api/rematricula` | sessão | períodos com janela e turmas com motivo | sem permissão |
| `POST /api/rematricula` | turmaId | matrícula | fora da janela, motivo de recusa |
| `DELETE /api/rematricula/:turmaId` | — | cancelada | fora da janela, tem registros |
| `PUT /api/periodos/:id/rematricula` | início, fim | período | datas inválidas, período encerrado |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-01 | Lista do período com 20 turmas em menos de 3 s |
| RNF-04, RNF-06 | Tela aprovada |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-038-01 | Janela aberta, turma com vaga | Estudante se matricula | Matrícula Cursando; vagas restantes −1 |
| AC-038-02 | Turma com 1 vaga, dois pedidos ao mesmo tempo | Ambos confirmam | Só um entra |
| AC-038-03 | Pré-requisito não aprovado | Tenta matricular | 409 "pré-requisito pendente: …" |
| AC-038-04 | Choque com outra turma dele | Tenta matricular | 409 "choque com …" |
| AC-038-05 | Fora da janela | Tenta matricular ou cancelar | 409 |
| AC-038-06 | Matrícula sem registros, na janela | Cancela | Matrícula excluída |
| AC-038-07 | Já aprovado na disciplina | Abre a lista | Turma marcada "já aprovado" |
| AC-038-08 | Secretaria | Define janela com fim antes do início | 400 |

## 12. Casos de teste derivados

1. Motivos de recusa e sobreposição (unitário).
2. Matrícula, concorrência, cancelamento e janela (integração).

## 13. Questões em aberto

Nenhuma. OPEN-060 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-039 — Diário de classe

**Status:** `aprovada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-039 |
| **Nome** | Diário de classe (conteúdo, fechamento e homologação) |
| **Objetivo** | O professor registra o conteúdo de cada aula e fecha o diário completo; a coordenação homologa, devolve ou reabre. |
| **Valor** | Dá o "carimbo" oficial de que a turma terminou, e congela notas e frequência depois disso. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-47, RF-27 |
| **RB** | RB-03, RB-04, RB-20, RB-22, RB-23, RB-29, RB-37 |
| **RNF** | RNF-03, RNF-04, RNF-06 |
| **UC / fluxo** | UC-36 Fechar e homologar diário |
| **Entidades** | `Aula` (conteúdo), `Turma` (diário), `Notificacao` (tipo Diario) |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-061 |

## 3. Escopo

**Incluído**
- Campo **Conteúdo da aula** na chamada (até 500 caracteres), gravado nas aulas da data; lista de aulas mostra o conteúdo.
- No dashboard da turma do professor, cartão **Diário**: status, o que falta para fechar e o botão **Fechar diário**.
- Página **Diários** da coordenação: diários fechados para homologar e homologados; **Homologar**, **Devolver** (com observação, notifica o professor) e **Reabrir**.
- Diário fechado ou homologado: a turma fica somente leitura (a trava do período passa a considerar o diário, RB-20/RB-37); telas mostram o aviso.
- Auditoria acadêmica de fechar, homologar, devolver e reabrir.

**Fora do escopo**
- Diário impresso e assinatura (item 30 fora do escopo); fechamento automático no encerramento do período.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-08 por Arthur.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Diário na turma do professor | [prototipo.html#diario-professor](layout/prototipo.html#diario-professor) | [x] | [x] | Arthur | 2026-11-08 |
| Diários para homologar (coordenação) | [prototipo.html#diario-homologar](layout/prototipo.html#diario-homologar) | [x] | [x] | Arthur | 2026-11-08 |

## 4. Dependências

SPEC-017, SPEC-018, SPEC-019, SPEC-022, SPEC-028, SPEC-029.

## 5. Comportamento esperado

**Fluxo principal:** com todas as notas lançadas, o professor fecha o diário; a coordenadora homologa; a turma fica somente leitura.

**Exceções:** nota faltando: 409 com a lista; fechar diário já fechado: 409; homologar diário aberto: 409; devolver sem observação: 400; outro professor ou coordenador de outro curso: 404.

**Pós-condições:** estado do diário e auditoria gravados na mesma transação; notificação na devolução.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-039-01 | Só fecha completo (RB-37). |
| INV-039-02 | Fechado ou homologado, nenhuma escrita acadêmica na turma. |
| INV-039-03 | Transições: Aberto → Fechado (professor); Fechado → Homologado ou Aberto (coordenação); Homologado → Aberto (coordenação). |

## 7. Modelo de domínio envolvido

`Aula` ganha `conteudo`; `Turma` ganha `diario`, `diarioFechadoEm`, `diarioHomologadoEm`, `diarioObservacao`.

## 8. Impacto arquitetural

- `src/domain/diario.ts` (pendências para fechar e transições).
- `travaDoPeriodo` passa a recusar também turma com diário fechado ou homologado.
- Casos de uso em `src/server/academico/diario.ts`.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| `POST /api/turmas/:id/diario` | ação: fechar, homologar, devolver, reabrir; observação | estado do diário | pendências, transição inválida, fora do escopo |
| `GET /api/diarios` | sessão (coordenador) | diários dos cursos | sem permissão |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-03 | Professor da turma e coordenador do curso, na query |
| RNF-04, RNF-06 | Telas aprovadas |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-039-01 | Turma com nota faltando | Professor fecha | 409 com o que falta |
| AC-039-02 | Turma completa | Professor fecha | Diário Fechado; nota e chamada recusadas (409) |
| AC-039-03 | Diário fechado | Coordenador homologa | Homologado; auditoria |
| AC-039-04 | Diário fechado | Coordenador devolve com observação | Aberto; professor notificado |
| AC-039-05 | Diário homologado | Coordenador reabre | Aberto; lançamentos voltam a ser aceitos |
| AC-039-06 | Chamada com conteúdo | Registra | Conteúdo gravado nas aulas da data |
| AC-039-07 | Estudante em exame sem nota de exame | Fecha | 409 |

## 12. Casos de teste derivados

1. Pendências e transições (unitário).
2. Fechar, travar, homologar, devolver, reabrir (integração).

## 13. Questões em aberto

Nenhuma. OPEN-061 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-040 — Calendário acadêmico

**Status:** `aprovada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-040 |
| **Nome** | Calendário acadêmico |
| **Objetivo** | A secretaria publica as datas do período e todos veem o mês com os eventos e os próprios prazos; a chamada respeita feriados. |
| **Valor** | Um lugar só para saber quando há aula, prova e feriado. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-48, RF-27 |
| **RB** | RB-02, RB-03, RB-13, RB-22, RB-38 |
| **RNF** | RNF-03, RNF-04, RNF-06 |
| **UC / fluxo** | UC-37 Manter calendário acadêmico |
| **Entidades** | `EventoCalendario` (nova) |
| **ADRs** | ADR-001, ADR-002 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-062 |

## 3. Escopo

**Incluído**
- Secretaria: página **Calendário** com o mês e o formulário de evento (período, tipo, título, início, fim); editar e excluir.
- Todos os perfis: página **Calendário** com o mês (navegar entre meses) e os eventos; estudante e professor veem também os prazos das atividades e as avaliações das próprias turmas de período aberto; a **grade da semana** (SPEC-041) fica na mesma página.
- Chamada recusa data em feriado ou recesso do período da turma, e fora do intervalo início/fim das aulas quando ele existe (RB-38).

**Fora do escopo**
- Exportar para Google Agenda/ICS; eventos por curso.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-08 por Arthur.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Calendário do mês e grade da semana | [prototipo.html#calendario](layout/prototipo.html#calendario) | [x] | [x] | Arthur | 2026-11-08 |
| Calendário da secretaria | [prototipo.html#calendario-secretaria](layout/prototipo.html#calendario-secretaria) | [x] | [x] | Arthur | 2026-11-08 |

## 4. Dependências

SPEC-017, SPEC-018, SPEC-019, SPEC-028.

## 5. Comportamento esperado

**Fluxo principal:** a secretaria cadastra o feriado de 20/11; o professor tenta fazer chamada em 20/11 e o sistema recusa.

**Exceções:** fim antes do início, tipo inválido ou período inexistente: 400; perfil sem permissão: 403.

**Pós-condições:** evento e auditoria gravados.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-040-01 | Chamada nunca em feriado ou recesso do período (RB-38). |
| INV-040-02 | Cada perfil vê só os prazos das próprias turmas. |

## 7. Modelo de domínio envolvido

Nova entidade **EventoCalendario** (período, tipo, título, início, fim).

## 8. Impacto arquitetural

- `src/domain/calendario.ts` (dia letivo, montagem do mês, dias úteis usados pela SPEC-036).
- Casos de uso em `src/server/academico/calendario.ts`; a chamada consulta os eventos do período da turma.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| `GET /api/calendario?mes=AAAA-MM` | sessão | eventos e prazos do mês | — |
| `POST /api/calendario` | período, tipo, título, início, fim | evento | campo inválido |
| `PATCH` / `DELETE /api/calendario/:id` | campos | evento / excluído | não encontrado |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-03 | Prazos filtrados pelas turmas do usuário |
| RNF-04, RNF-06 | Telas aprovadas, celular inclusive |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-040-01 | Feriado em 20/11 | Professor registra chamada em 20/11 | 400 "feriado" |
| AC-040-02 | Período com aulas de 11/08 a 12/12 | Chamada em 15/12 | 400 |
| AC-040-03 | Secretaria | Cadastra evento com fim antes do início | 400 |
| AC-040-04 | Estudante | Abre o mês | Eventos e os prazos das próprias atividades, não os de outras turmas |
| AC-040-05 | Professor ou coordenador | Tenta cadastrar evento | 403 |

## 12. Casos de teste derivados

1. Dia letivo, dias úteis e mês (unitário).
2. Cadastro, consulta por perfil e bloqueio da chamada (integração).

## 13. Questões em aberto

Nenhuma. OPEN-062 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-041 — Grade horária e salas

**Status:** `aprovada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-041 |
| **Nome** | Grade horária e salas |
| **Objetivo** | Cada turma ganha horários e sala, sem choque de sala ou professor; estudante e professor veem a grade da semana. |
| **Valor** | Mostra onde e quando é cada aula e evita sala ou professor em dois lugares ao mesmo tempo. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-49 |
| **RB** | RB-04, RB-13, RB-20, RB-22, RB-39 |
| **RNF** | RNF-03, RNF-04, RNF-06 |
| **UC / fluxo** | UC-38 Montar grade horária |
| **Entidades** | `Sala`, `HorarioTurma` (novas), `Turma` (vagas) |
| **ADRs** | ADR-001, ADR-002, ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-063 |

## 3. Escopo

**Incluído**
- Secretaria: página **Salas** (nome, capacidade; editar; excluir só sem horário).
- Coordenador, na turma: **Horários** (dia, início, fim, sala; incluir e excluir) e **Vagas** (SPEC-038).
- Choque de sala e de professor no mesmo período e dia; vagas ≤ menor capacidade das salas da turma (RB-39).
- **Grade da semana** de estudante e professor (na página Calendário, SPEC-040); horários também na rematrícula.

**Fora do escopo**
- Geração automática de horários; reserva avulsa de sala.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-08 por Arthur.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Horários e vagas da turma (coordenação) | [prototipo.html#turma-horarios](layout/prototipo.html#turma-horarios) | [x] | [x] | Arthur | 2026-11-08 |
| Salas (secretaria) | [prototipo.html#salas](layout/prototipo.html#salas) | [x] | [x] | Arthur | 2026-11-08 |

## 4. Dependências

SPEC-015, SPEC-017, SPEC-019, SPEC-026.

## 5. Comportamento esperado

**Fluxo principal:** o coordenador põe a Turma BD-A na segunda, 19:00–20:40, Sala 101; outra turma na mesma sala e horário é recusada.

**Exceções:** fim não depois do início, dia fora de 1 a 6, sala inexistente: 400; choque de sala ou professor: 409 com a turma que choca; vagas acima da capacidade: 409; turma fora do escopo: 404; período encerrado: 409.

**Pós-condições:** horário e auditoria gravados.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-041-01 | Sem sobreposição de sala nem de professor no mesmo período e dia (RB-39). |
| INV-041-02 | Vagas ≤ menor capacidade das salas da turma. |
| INV-041-03 | Nome de sala único. |

## 7. Modelo de domínio envolvido

Novas entidades **Sala** e **HorarioTurma**.

## 8. Impacto arquitetural

- `src/domain/horarios.ts` (sobreposição, validação de hora, grade da semana).
- Casos de uso em `src/server/academico/horarios.ts`.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| `GET` / `POST /api/salas`, `PATCH` / `DELETE /api/salas/:id` | nome, capacidade | sala | campo inválido, nome repetido, sala em uso |
| `POST /api/turmas/:id/horarios`, `DELETE /api/horarios/:id` | dia, início, fim, salaId | horário | choque, capacidade, campo inválido |
| `GET /api/grade` | sessão | grade da semana | — |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-03 | Coordenador do curso na query |
| RNF-04, RNF-06 | Telas aprovadas |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-041-01 | Sala 101 ocupada segunda 19:00–20:40 | Outra turma na Sala 101 segunda 20:00–21:00 | 409 choque de sala |
| AC-041-02 | Professor com aula segunda 19:00–20:40 | Outra turma dele segunda 19:30 em outra sala | 409 choque de professor |
| AC-041-03 | Sala de 30 lugares | Vagas da turma = 40 | 409 |
| AC-041-04 | Estudante com 2 turmas com horário | Abre a grade | Os horários da semana, com sala |
| AC-041-05 | Horário 20:00–19:00 | Salva | 400 |
| AC-041-06 | Sala com horário | Secretaria exclui | 409 |

## 12. Casos de teste derivados

1. Sobreposição, validação e grade (unitário).
2. Salas, horários, choques e vagas (integração).

## 13. Questões em aberto

Nenhuma. OPEN-063 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-042 — Aproveitamento de estudos e conclusão de curso

**Status:** `aprovada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-042 |
| **Nome** | Aproveitamento de estudos e conclusão de curso |
| **Objetivo** | A secretaria dispensa disciplinas cursadas fora e só conclui o curso com 100% de integralização; o histórico final mostra a conclusão. |
| **Valor** | Fecha o ciclo do estudante: entra, cursa, aproveita o que já fez e se forma. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-50, RF-51, RF-29 |
| **RB** | RB-13, RB-22, RB-24, RB-30, RB-35, RB-40 |
| **RNF** | RNF-03, RNF-04, RNF-05, RNF-06 |
| **UC / fluxo** | UC-39 Registrar aproveitamento e concluir curso |
| **Entidades** | `Aproveitamento` (nova), `FichaEstudante` |
| **ADRs** | ADR-001, ADR-002 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-053, OPEN-064 |

## 3. Escopo

**Incluído**
- Na ficha do estudante, bloco **Aproveitamento de estudos**: lista e **Novo aproveitamento** (disciplina da matriz do curso, instituição e disciplina de origem, nota 0–10 opcional, carga horária); excluir.
- Bloco **Integralização** na ficha (SPEC-037), com as obrigatórias que faltam.
- Mudar a situação para **Concluído** só com 100% (RB-40).
- Histórico escolar: seção **Aproveitamento de estudos** e "Curso concluído em DD/MM/AAAA" quando Concluído; a carga aprovada inclui o aproveitamento.

**Fora do escopo**
- Diploma; colação de grau com ata.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-08 por Arthur.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Ficha — aproveitamento e integralização | [prototipo.html#aproveitamento](layout/prototipo.html#aproveitamento) | [x] | [x] | Arthur | 2026-11-08 |
| Histórico final com conclusão | [prototipo.html#historico-final](layout/prototipo.html#historico-final) | [x] | [x] | Arthur | 2026-11-08 |

## 4. Dependências

SPEC-020, SPEC-031, SPEC-033, SPEC-035, SPEC-037.

## 5. Comportamento esperado

**Fluxo principal:** a secretaria registra o aproveitamento de Cálculo I; a integralização chega a 100%; ela marca Concluído; o histórico mostra a conclusão.

**Exceções:** disciplina fora da matriz ou já aprovada/aproveitada: 409; carga ≤ 0 ou nota fora de 0–10: 400; Concluído com menos de 100%: 400 com as que faltam.

**Pós-condições:** aproveitamento ou situação e auditoria gravados na mesma transação.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-042-01 | No máximo um aproveitamento por estudante e disciplina. |
| INV-042-02 | Concluído só com integralização de 100% (RB-40). |

## 7. Modelo de domínio envolvido

Nova entidade **Aproveitamento**.

## 8. Impacto arquitetural

- Integralização de `src/domain/matriz.ts`; `mudarSituacao` confere RB-40.
- Histórico (`consultarHistorico`) inclui aproveitamentos e a conclusão.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| `POST /api/estudantes/:id/aproveitamentos` | disciplinaId, instituição, disciplina de origem, nota, carga | aproveitamento | campo inválido, fora da matriz, repetido |
| `DELETE /api/aproveitamentos/:id` | — | excluído | não encontrado |
| `PUT /api/estudantes/:id/situacao` | Concluido | ficha | integralização < 100% |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-03, RNF-05 | Só a secretaria registra |
| RNF-04, RNF-06 | Telas aprovadas |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-042-01 | Disciplina da matriz | Secretaria registra aproveitamento | Gravado; integralização sobe; auditoria |
| AC-042-02 | Disciplina já aprovada | Registra aproveitamento | 409 |
| AC-042-03 | Integralização 80% | Marca Concluído | 400 com as que faltam |
| AC-042-04 | Integralização 100% | Marca Concluído | Concluído; histórico com a data |
| AC-042-05 | Aproveitamento | Abre o histórico | Seção com origem, nota e carga |

## 12. Casos de teste derivados

1. Integralização com aproveitamento (unitário).
2. Registro, exclusão, conclusão e histórico (integração).

## 13. Questões em aberto

Nenhuma. OPEN-064 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).

---

# SPEC-043 — Exportação de apoio ao Censo

**Status:** `aprovada`

## 1. Identificação

| Campo | Conteúdo |
|---|---|
| **ID** | SPEC-043 |
| **Nome** | Exportação de apoio ao Censo Escolar |
| **Objetivo** | A secretaria baixa um CSV com os dados que o Censo pede dos estudantes e das turmas de um período. |
| **Valor** | Mostra como o sistema alimentaria a obrigação anual com o INEP, sem prometer o layout oficial. |

## 2. Rastreabilidade

| Artefato | Referências |
|---|---|
| **RF** | RF-52 |
| **RB** | RB-13, RB-22, RB-24, RB-33 |
| **RNF** | RNF-02, RNF-03, RNF-05, RNF-06 |
| **UC / fluxo** | UC-40 Exportar dados de apoio ao Censo |
| **Entidades** | leitura de `Usuario`, `FichaEstudante`, `Turma`, `Matricula`, `IndicadorAcademico`; `RegistroAuditoria` |
| **ADRs** | ADR-001, ADR-003 |
| **Issues** | — |
| **OPEN relacionados** | OPEN-065 |

## 3. Escopo

**Incluído**
- Página **Exportação do Censo** da secretaria: escolha do período, prévia (número de estudantes e de linhas), aviso "arquivo de apoio, não é o layout oficial do Educacenso/INEP" e **Baixar CSV**.
- Uma linha por matrícula do período: matrícula, nome, CPF, nascimento, curso, situação no curso, período, disciplina, turma, carga horária, frequência e resultado (RB-24). Separador `;`, vírgula decimal, UTF-8 com BOM.
- Auditoria administrativa da exportação (período e número de linhas, sem dados pessoais).

**Fora do escopo**
- Layout oficial; envio ao INEP; dados de docentes e escola.

## Telas e evidência de layout

**Gate (OPEN-020):** Layout `aprovado` em 2026-11-08 por Arthur.

| Tela | Evidência | Desktop | Smartphone | Aprovado por | Data |
|---|---|---|---|---|---|
| Exportação do Censo | [prototipo.html#exportacao-censo](layout/prototipo.html#exportacao-censo) | [x] | [x] | Arthur | 2026-11-08 |

## 4. Dependências

SPEC-020, SPEC-031, SPEC-033, SPEC-035.

## 5. Comportamento esperado

**Fluxo principal:** a secretaria escolhe 2026/1 e baixa o CSV.

**Exceções:** período inexistente: 400; outro perfil: 403.

**Pós-condições:** auditoria gravada; nada mais muda.

## 6. Regras e invariantes

| ID | Invariante |
|---|---|
| INV-043-01 | Só a secretaria exporta (RB-13). |
| INV-043-02 | A auditoria da exportação não guarda dados pessoais. |

## 7. Modelo de domínio envolvido

Sem entidade nova.

## 8. Impacto arquitetural

- `src/domain/censo.ts` (linhas e CSV); caso de uso em `src/server/academico/censo.ts`.

## 9. Contratos necessários

| Operação | Entrada | Saída de sucesso | Erros |
|---|---|---|---|
| `GET /api/censo?periodo=` | — | CSV | período inválido, sem permissão |

## 10. RNFs aplicáveis

| RNF | Como verificar |
|---|---|
| RNF-05 | Só a secretaria; auditoria sem dados pessoais |
| RNF-06 | Tela aprovada |

## 11. Critérios de aceitação

| ID | Dado | Quando | Então |
|---|---|---|---|
| AC-043-01 | Período com 12 matrículas | Exporta | CSV com cabeçalho e 12 linhas |
| AC-043-02 | Estudante sem CPF | Exporta | Coluna CPF vazia |
| AC-043-03 | Coordenador | Tenta exportar | 403 |
| AC-043-04 | Exportação | Consulta a auditoria | Registro com período e número de linhas, sem nomes |

## 12. Casos de teste derivados

1. Linhas e CSV (unitário).
2. Exportação, permissão e auditoria (integração).

## 13. Questões em aberto

Nenhuma. OPEN-065 fechada.

## 14. Definition of Done

Padrão da SPEC-001 (seção 14).
