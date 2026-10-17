# Identidade visual — StudyTrack

Fonte normativa do logotipo, da paleta, da tipografia e dos componentes da interface. Rastreio: [RNF-06](StudyTrack_RNF.md) e [OPEN-020](decisoes-em-aberto.md). Amostra visual e protótipos das telas: [`layout/prototipo.html`](layout/prototipo.html).

Vale para todas as Specs com tela (SPEC-001 em diante). Não é ADR: trocar um tom de azul não muda o domínio nem a arquitetura.

**Aprovação humana:** `aprovada` em 2026-10-16 por Arthur, junto com os protótipos de [`layout/README.md`](layout/README.md).

## Ideia da marca

O StudyTrack acompanha a vida acadêmica do estudante ao longo do período. A marca é uma **linha de evolução que sobe**, com pontos de registro (notas, frequência) e um ponto final em destaque: a situação atual do estudante. Tom **acadêmico e sóbrio**: o sistema é usado por estudantes, professores e coordenação, e precisa transmitir confiança.

O nome escrito é **StudyTrack**: uma palavra, com **S** e **T** maiúsculos. Não escrever "Study Track", "STUDYTRACK" nem "Studytrack".

## Logotipo

| Peça | Uso | Arquivo |
|---|---|---|
| Marca (ícone) | favicon, menu recolhido, espaço estreito | [`identidade/marca.svg`](identidade/marca.svg) |
| Assinatura horizontal | fundo claro (login no celular, cabeçalhos claros) | [`identidade/logo-horizontal.svg`](identidade/logo-horizontal.svg) |
| Assinatura inversa | fundo marinho (menu lateral, painel do login no computador) | [`identidade/logo-horizontal-inverso.svg`](identidade/logo-horizontal-inverso.svg) |

A **marca** é um quadrado arredondado marinho com a linha de evolução em azul-claro; o último ponto é branco. A **assinatura** junta a marca ao nome: **Study** em marinho e **Track** em azul (na versão inversa, branco e azul-claro).

O que não fazer: distorcer, girar, aplicar sombra, trocar as cores da linha, colocar o ícone sobre foto. O perfil do usuário (Estudante, Professor, Coordenador) aparece na casca, nunca na marca.

## Cores

### Marca e superfícies

| Token | Hex | Uso |
|---|---|---|
| **Marinho** | `#0F2A4A` | menu lateral, painel do login, títulos fortes, fundo da marca |
| **Marinho-claro** | `#1E3A5F` | item ativo e hover no menu lateral |
| **Azul** | `#2563EB` | ação primária (botões, links), "Track" no nome |
| **Azul-escuro** | `#1D4ED8` | hover e pressionado do botão primário |
| **Azul-suave** | `#DBEAFE` | fundo de destaque leve, foco de campo |
| **Céu** | `#93C5FD` | detalhes sobre o marinho (nós da marca, texto secundário no menu) |
| **Névoa** | `#F5F7FB` | fundo das páginas |
| **Branco** | `#FFFFFF` | cartões, campos, tabelas |
| **Traço** | `#E2E8F0` | bordas e divisórias |
| **Texto** | `#0F172A` | texto principal |
| **Mudo** | `#64748B` | texto secundário, legendas, rótulos de tabela |

### Situação acadêmica (RB-09) — sempre cor **e** rótulo

| Situação | Texto | Fundo | Rótulo |
|---|---|---|---|
| Normal | `#15803D` | `#DCFCE7` | ● Normal |
| Atenção | `#B45309` | `#FEF3C7` | ▲ Atenção |
| Risco | `#B91C1C` | `#FEE2E2` | ■ Risco |

A cor nunca aparece sozinha: o selo sempre traz o símbolo e a palavra (RNF-06, acessibilidade para daltonismo). O âmbar e o vermelho são **reservados** para situação e para erro; não usar como cor de marca ou de botão comum.

### Mensagens do sistema

| Tipo | Texto | Fundo | Uso |
|---|---|---|---|
| Sucesso | `#15803D` | `#F0FDF4` | "Nota lançada", "Estudante cadastrado" |
| Erro | `#B91C1C` | `#FEF2F2` | credencial inválida, campo pendente, acesso negado |
| Informação | `#1D4ED8` | `#EFF6FF` | orientações ("Cadastre uma disciplina antes") |

Contraste: Texto sobre Branco/Névoa e Branco sobre Marinho/Azul atendem leitura de corpo de texto (WCAG AA).

## Tipografia

- Fonte da interface: **Inter** (pacote `@fontsource-variable/inter`, servida pela própria aplicação, sem depender de internet), com fallback `Segoe UI`, `system-ui`, `sans-serif`.
- Escala: título de página 24 px semibold; título de cartão 18 px semibold; corpo 16 px; legenda e rótulos de tabela 13–14 px.
- Números de nota, média e frequência usam algarismos tabulares (`tabular-nums`) para alinhar em tabelas.

## Formas e espaçamento

- Raio: cartões 16 px; botões e campos 10 px; selos e etiquetas 999 px (pílula).
- Sombra: só leve nos cartões (`0 1px 2px rgba(15, 23, 42, .06)`); nada de sombra em botão.
- Espaço base de 4 px; conteúdo com largura máxima de 1120 px; margem lateral de 16 px no celular.

## Componentes

| Componente | Regra |
|---|---|
| Botão primário | fundo Azul, texto Branco, hover Azul-escuro; um por formulário |
| Botão secundário | fundo Branco, borda Traço, texto Texto |
| Campo | fundo Branco, borda Traço, foco com borda Azul e anel Azul-suave; rótulo sempre visível acima; erro em vermelho logo abaixo do campo (AC-002-02) |
| Cartão | fundo Branco, borda Traço, raio 16 px, título do cartão no topo |
| Tabela | cabeçalho em Mudo, maiúsculas pequenas; linhas com divisória Traço; no celular vira lista de cartões |
| Selo de situação | pílula com símbolo e rótulo (tabela acima) |
| Estado vazio | ícone, frase curta e, quando houver, o próximo passo ("Cadastre uma disciplina antes") |
| Indicador (número) | rótulo em Mudo acima, número grande em Texto |

## Aplicação

| Superfície | Marca | Fundo |
|---|---|---|
| Login, computador | assinatura inversa no painel esquerdo | Marinho (esquerda) + Névoa (direita) |
| Login, celular | assinatura horizontal no topo | Névoa |
| Casca autenticada, computador | assinatura inversa no menu lateral | menu Marinho, conteúdo Névoa |
| Casca autenticada, celular | marca + nome na barra superior; menu abre por ☰ | barra Marinho, conteúdo Névoa |
| Acesso negado / página não encontrada | assinatura horizontal | Névoa |

A casca (OPEN-019, OPEN-020) tem: logotipo, itens de menu do perfil, nome e perfil do usuário e o botão **Sair**. Estudante, Professor e Coordenador usam a mesma identidade; só os itens de menu mudam.

## Fora de escopo

- Tema escuro completo.
- Ilustrações e fotos.
- Manual impresso e papelaria.
