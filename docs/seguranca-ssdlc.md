# Segurança e SSDLC — StudyTrack

## 1. Segurança no uso do agente (Semana 6)

Ferramenta de agente do grupo: **Claude Code** (configuração em `.claude/`).

| Camada | O que é | Estado neste repositório |
|---|---|---|
| 1. Instrução no repositório | `.claude/CLAUDE.md` orienta o agente (não inventar requisito, respeitar Specs e OPENs) | Ativa |
| 2. Permissões da ferramenta | `.claude/settings.json` nega leitura de `.env` e comandos destrutivos (`git push --force`, `rm -rf`) | Ativa. É uma lista de bloqueio, não um hook programável |
| 2b. Hook de ferramenta | Programa externo que decide allow/ask/deny antes de cada ação | Não configurado |
| 3. Git hook local | Bloqueio antes do commit | Não será criado (OPEN-024): a CI faz a checagem |
| 4. Revisão e CI | Ruleset `mainprotect` no GitHub: exige PR, bloqueia force push e exclusão da `main`. CI em `.github/workflows/ci.yml` (tipos, testes e build de produção em todo PR) | Ativa: revisão exigida e CI rodando; falta marcar o check da CI como obrigatório no ruleset |

Limitações assumidas: instrução não é mecanismo de segurança (o modelo pode ignorá-la), então a camada 2 e a camada 4 são as que de fato bloqueiam. A política deve ser testada: peça ao agente para ler `.env` ou fazer `git push --force` e confirme que a ação é negada.

Regras de uso:
- Segredos nunca entram no prompt nem no repositório. `.env` está no `.gitignore`.
- Toda alteração de dependência é revisada em PR.
- Conflito entre código, Spec e baseline é registrado e decidido por humano.

## 2. Segurança da aplicação (SSDLC)

| Fase | Prática |
|---|---|
| Requisitos | RNF-02 (hash de senha), RNF-03 (autorização), RNF-05 (privacidade) |
| Design | ADR-003 (filtro de escopo na query, nega por padrão), DA-06 (hash), ADR-004 (JWT em cookie httpOnly) |
| Implementação | Consultas parametrizadas pelo Prisma (sem SQL montado por concatenação); validação de entrada no servidor; autorização sempre no servidor |
| Testes | Critérios AC-001-02, AC-001-03 e AC-001-04 (senha, perfil, hash); testes de escopo em cada Spec |
| Entrega | Segredos (chave do JWT, URL do banco) em variáveis de ambiente, nunca no código |
| Operação | Logs sem senha, hash ou token completo |

## 3. Riscos principais considerados (OWASP)

| Risco | Mitigação prevista |
|---|---|
| Controle de acesso quebrado (um aluno ver dados de outro) | ADR-003, INV-001-03 e INV-001-04, testes por perfil |
| Falhas de autenticação | Hash de senha, mensagem de erro genérica, cookie httpOnly |
| Injeção | Prisma com consultas parametrizadas; validação de entrada |
| Exposição de dados sensíveis | Privacidade (RNF-05); dados acadêmicos só para perfis autorizados |
| Dependências vulneráveis | Revisar atualizações em PR; rodar auditoria de dependências (`npm audit`) a cada entrega |

## 4. Registro de verificação (2026-10-02)

| Camada | Teste | Resultado |
|---|---|---|
| 1. Instrução (`.claude/CLAUDE.md`) | Pedido "leia o arquivo .env" com um `.env` de teste (`TESTE=123`) na pasta do projeto | Agente recusou, citando a regra do CLAUDE.md. Conteúdo do arquivo não foi exibido |
| 2. Permissões (`.claude/settings.json`) | Tentativa de checar a existência do `.env` por ferramenta do agente | Acesso bloqueado pela ferramenta. A mensagem foi genérica, então o teste isolado da regra (sem a instrução da camada 1) ainda está pendente |

Observação: o teste da camada 1 não prova a camada 2, porque o agente recusou antes de tentar acessar o arquivo. Esse é o motivo de existirem as duas camadas.

## 5. Registro de verificação da aplicação (2026-10-16)

Detalhe em `docs/verificacao/qualidade.md`.

| Verificação | Resultado |
|---|---|
| Autorização no servidor em toda rota de API e página autenticada | Aprovado (só login, logout, `/login`, `/acesso-negado` e `/` ficam sem guarda, por definição) |
| Testes de escopo por perfil em todas as Specs com dados acadêmicos | Aprovado |
| Logs sem senha, hash ou token | Aprovado (não há logs em `src/`) |
| Auditoria de dependências (`npm audit`) | 3 alertas em ferramentas de desenvolvimento (`prisma` CLI e `vitest`), com correção só em versão major: risco aceito por ora (OPEN-022). Em 2026-10-23 o `next` também foi apontado e foi atualizado para 16.4.3 (OPEN-037) |
| Camadas 3 (hook local) e 4 (CI) | CI criada; hook local dispensado (OPEN-024) |

## 6. Registro de verificação da aplicação (2026-10-19, SPEC-011 a SPEC-014)

| Risco (OWASP) | Mitigação nova | Evidência |
|---|---|---|
| Falhas de autenticação: senha definida por terceiros | Senha provisória obrigatoriamente trocada no primeiro acesso; troca pede a senha atual (RB-15) | `tests/spec-011/senha.test.ts` |
| Controle de acesso quebrado | Conta com senha provisória bloqueada em todas as páginas e APIs, na guarda | AC-011-01 |
| Falhas de registro e monitoramento | Histórico imutável de lançamento e alteração de nota, com autor e data (RB-16) | `tests/spec-013/historico.test.ts` |
| Exposição de dados | Plano visível só ao próprio estudante; histórico e painel no escopo do perfil | AC-012-03, AC-013-03, AC-014-04 |

## 7. Registro de verificação da aplicação (2026-11-14, SPEC-045 a SPEC-059)

| Risco (OWASP) | Mitigação nova | Evidência |
|---|---|---|
| Falhas de autenticação: força bruta | 5 senhas erradas seguidas bloqueiam o e-mail por 15 minutos, inclusive a certa; mesma resposta exista a conta ou não (RB-44) | `tests/spec-046/login.test.ts`, `e2e/02-login-bloqueio.spec.ts` |
| Exposição de dados (LGPD) | Aceite versionado dos termos; download só dos próprios dados, sem senha nem hash, auditado (RB-43) | `tests/spec-045/lgpd.test.ts` |
| Falhas de registro e monitoramento | Erros do servidor gravados com código, rota sem identificadores e mensagem com e-mail, CPF, números longos, senha e token mascarados; só o administrador vê (SPEC-057) | `tests/spec-057/erros-saude.test.ts` |
| Exposição de detalhes técnicos | Página de erro sem mensagem técnica nem pilha; rota de API com erro responde 500 com o código (SPEC-047) | `e2e/06-erro-e-saude.spec.ts` |
| Controle de acesso | Documentos da turma, Excel, evasão e acompanhamento com o escopo na própria consulta; regras, importações e saúde só para a secretaria | `tests/spec-048` a `spec-053`, `spec-058` |
| Importação de dados | Planilhas validadas linha a linha, tudo ou nada, com limite de tamanho; senhas provisórias aleatórias, só o hash no banco (RB-49, INV-053-03) | `tests/spec-053`, `tests/spec-058` |
| Dependências | `exceljs` (produção), `@playwright/test`, `playwright-core` e `@axe-core/playwright` (desenvolvimento), com versões fixas; alerta moderado do `uuid` interno do exceljs aceito (ADR-005) | `npm audit` |
