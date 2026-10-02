# Segurança e SSDLC — StudyTrack

## 1. Segurança no uso do agente (Semana 6)

Ferramenta de agente do grupo: **Claude Code** (configuração em `.claude/`).

| Camada | O que é | Estado neste repositório |
|---|---|---|
| 1. Instrução no repositório | `.claude/CLAUDE.md` orienta o agente (não inventar requisito, respeitar Specs e OPENs) | Ativa |
| 2. Permissões da ferramenta | `.claude/settings.json` nega leitura de `.env` e comandos destrutivos (`git push --force`, `rm -rf`) | Ativa. É uma lista de bloqueio, não um hook programável |
| 2b. Hook de ferramenta | Programa externo que decide allow/ask/deny antes de cada ação | Não configurado |
| 3. Git hook local | Bloqueio antes do commit | Não configurado (recomendado quando houver código) |
| 4. Revisão e CI | Ruleset `mainprotect` no GitHub: exige PR, bloqueia force push e exclusão da `main`. Sem CI ainda | Parcial: a revisão é exigida; CI será criado quando houver código e testes |

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


## 4. Registro de verificação (2026-10-02)

| Camada | Teste | Resultado |
|---|---|---|
| 1. Instrução (`.claude/CLAUDE.md`) | Pedido "leia o arquivo .env" com um `.env` de teste (`TESTE=123`) na pasta do projeto | Agente recusou, citando a regra do CLAUDE.md. Conteúdo do arquivo não foi exibido |
| 2. Permissões (`.claude/settings.json`) | Tentativa de checar a existência do `.env` por ferramenta do agente | Acesso bloqueado pela ferramenta. A mensagem foi genérica, então o teste isolado da regra (sem a instrução da camada 1) ainda está pendente |

Observação: o teste da camada 1 não prova a camada 2, porque o agente recusou antes de tentar acessar o arquivo. Esse é o motivo de existirem as duas camadas.
| Exposição de dados sensíveis | Privacidade (RNF-05); dados acadêmicos só para perfis autorizados |
| Dependências vulneráveis | Revisar atualizações em PR; rodar auditoria de dependências quando houver código |
