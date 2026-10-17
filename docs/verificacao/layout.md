# Verificação — Identidade visual e layout (RNF-06, OPEN-019, OPEN-020)

**Data:** 2026-10-16
**Escopo:** aplicação do layout aprovado ([`../layout/prototipo.html`](../layout/prototipo.html)) às telas das SPEC-001 a SPEC-004, como refatoração visual, e inclusão do **Sair** (OPEN-019).
**Comando:** `npm test` — 6 arquivos, **64 testes aprovados**, 0 falhas (inclui `tests/spec-001/logout.test.ts`).
**Outras checagens:** `tsc --noEmit` sem erros; `next build` concluído.

## O que mudou no código

| Parte | Arquivo |
|---|---|
| Tokens de cor e fonte da identidade | `src/app/globals.css` (`@theme`), fonte Inter local (`@fontsource-variable/inter`) |
| Logotipo e favicon | `src/components/marca.tsx`, `src/app/icon.svg` |
| Casca: menu lateral do perfil, usuário, Sair, menu ☰ no celular | `src/components/casca.tsx`, `src/components/navegacao-casca.tsx` |
| Peças de interface (cartão, cabeçalho, botões, campos, mensagens, estado vazio) | `src/components/ui.tsx`, `src/components/icones.tsx` |
| Sair | `POST /api/auth/logout` (`src/app/api/auth/logout/route.ts`) |
| Telas | login, acesso negado, página não encontrada, painéis de Estudante, Professor e Coordenador, notas do professor, disciplinas, turmas e detalhe da turma |

Nenhuma regra de negócio, rota de dados ou consulta mudou: as telas usam as mesmas funções e APIs das SPEC-001 a SPEC-004. A única tela com apresentação nova é a de notas, que passou a mostrar a **tabela de notas da avaliação** (dados que a tela já carregava) e a escolher o estudante clicando na linha.

## Verificação manual (agente, navegador)

| Item | Computador (1366×850) | Celular (375×812) |
|---|---|---|
| Login igual ao protótipo (painel marinho + formulário; só logo no celular) | Aprovado | Aprovado |
| Casca com menu do perfil, nome, perfil e Sair | Aprovado | Aprovado (menu abre pelo ☰) |
| Professor — turmas em cartões com atalho para notas | Aprovado | Aprovado |
| Professor — notas: turma e avaliação no topo, tabela de notas, lançar/alterar ao lado | Aprovado | — |
| Coordenador — início com contadores e atalhos | Aprovado | — |
| Coordenador — turmas em tabela + formulário de nova turma | Aprovado | — |
| Sair apaga a sessão: depois de sair, abrir `/professor` leva ao login | Aprovado | Aprovado |

**Revisão:** PR #42 aprovado por Luiz Eduardo e integrado em `development` em 2026-10-17.
