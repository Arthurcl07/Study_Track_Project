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

---

## Lista ordenada

| Ordem | ID | Nome | Dependências | Status |
|---|---|---|---|---|
| 1 | SPEC-001 | Autenticação, perfis e autorização por escopo | — | `aprovada` |
| 2 | SPEC-002 | Estrutura acadêmica e vínculos de turma | SPEC-001 | `especificada` |
| 3 | SPEC-003 | Cálculo da situação acadêmica e indicador persistido | SPEC-002 | `especificada` |
| 4 | SPEC-004 | Registro de avaliações, notas e médias | SPEC-001, SPEC-002, SPEC-003 | `especificada` |
| 5 | SPEC-005 | Frequência, atividades e entregas atrasadas | SPEC-001, SPEC-002, SPEC-003 | `especificada` |
| 6 | SPEC-006 | Alertas de atenção e risco | SPEC-001, SPEC-003, SPEC-004, SPEC-005 | `especificada` |
| 7 | SPEC-007 | Dashboard acadêmico do estudante | SPEC-001…SPEC-006 | `especificada` |
| 8 | SPEC-008 | Dashboard do professor e plano de recuperação | SPEC-001…SPEC-006 | `especificada` |
| 9 | SPEC-009 | Relatórios acadêmicos autorizados | SPEC-001…SPEC-008 | `especificada` |

Somente a SPEC-001 tem o texto completo abaixo; as demais seguem resumidas em `mapa-specs.md` até serem detalhadas.

---

# SPEC-001 — Autenticação, perfis e autorização por escopo

**Status:** `aprovada`

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
| **OPEN relacionados** | OPEN-006 (sessão vs JWT) |

## 3. Escopo

**Incluído**
- Cadastro e login de usuário com e-mail e senha.
- Atribuição de exatamente um perfil (Estudante, Professor ou Coordenador) a cada usuário.
- Bloqueio de acesso a funcionalidades não autorizadas ao perfil do usuário.
- Criação de sessão autenticada após login bem-sucedido.

**Fora do escopo**
- Recuperação de senha por e-mail (sem RF definido para isso).
- Login social / OAuth (não mencionado na baseline).
- Escolha do mecanismo de sessão (sessão de servidor vs JWT) — ver OPEN-006.

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

Mecanismo concreto de sessão (cookie de servidor vs JWT) não foi escolhido — ver OPEN-006.

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

- **OPEN-006:** decidir entre sessão de servidor (cookie) ou JWT como mecanismo de autenticação — nenhuma das duas foi escolhida na baseline (ADR-003/DA-01 citam ambas como alternativas). Precisa de decisão humana antes da implementação.

## 14. Definition of Done

Critérios AC-001-* implementados; INV-001-* preservados; testes da seção 12 aprovados; RNFs da seção 10 verificados; sem divergência conhecida em relação a esta Spec; qualquer divergência de baseline registrada e decidida por humano.
