# Verificação de acessibilidade — SPEC-056 (RNF-07, WCAG 2.1 AA)

**Data:** 2026-11-14
**Ferramenta:** axe-core 4.14 pelo `@axe-core/playwright`, regras `wcag2a`, `wcag2aa`, `wcag21a` e `wcag21aa`,
dentro dos testes de tela (`npm run e2e`, Chromium 1366 × 860)
**Resultado:** **nenhuma violação A/AA** nas 23 telas conferidas (INV-056-01); os 7 testes de tela passam.

## Telas conferidas

| Perfil | Telas |
|---|---|
| Público | Login; aceite dos termos (primeiro acesso) |
| Estudante | Dashboard, Meu curso, Requerimentos, Documentos, Meus dados, Ajuda |
| Professor | Dashboard, turma, Chamada, Notas e avaliações (com uma linha selecionada) |
| Coordenação | Dashboard, Evasão, Acompanhamento, turma, Relatórios |
| Secretaria | Dashboard, Contas, Configurações, Importar do sistema anterior, Saúde do sistema |

## O que o axe encontrou e foi corrigido

| Problema | Onde | Correção |
|---|---|---|
| Contraste do texto secundário (cor Mudo `#64748B`) abaixo de 4,5:1 sobre o fundo Névoa (4,44:1) e Traço (3,86:1) | rótulos, legendas e subtítulos em todo o sistema | cor Mudo escurecida para `#596779` (5,38:1 sobre Névoa, 4,68:1 sobre Traço, 5,77:1 sobre branco); `globals.css`, `identidade-visual.md` e protótipo atualizados |
| Nome acessível do logotipo diferente do texto visível (`label-content-name-mismatch`, WCAG 2.5.3) | link do logotipo no menu | `aria-label` "StudyTrack, voltar ao início" (contém o texto visível) |
| Link azul sobre a linha selecionada em azul-suave (4,24:1) | Notas, Chamada, Requerimentos, Entregas, Matriz e dashboard da turma | linha selecionada com o fundo Info (`#EFF6FF`, 4,75:1) e uma barra azul à esquerda |

## Teclado e leitor de tela (AC-056-02)

- **Pular para o conteúdo:** o primeiro Tab de qualquer tela autenticada mostra o link; Enter leva o foco ao conteúdo
  (`#conteudo`). Conferido no teste `e2e/07-acessibilidade.spec.ts`.
- **Foco visível:** contorno azul de 2 px em todo elemento focado pelo teclado (`:focus-visible`), céu no menu escuro.
- **Login só pelo teclado:** e-mail, senha e Enter; as mensagens de erro usam `role="alert"` e são lidas na hora
  (`e2e/02-login-bloqueio.spec.ts`).
- **Tour:** diálogo com `role="dialog"`, `aria-modal`, título e descrição ligados; Esc pula, setas avançam e voltam.
- **Menu:** `aria-current="page"` no item atual; regiões com nome (`Menu principal`, `Documentos da turma`).
- **Gráficos:** os SVG têm `role="img"` e `aria-label` com o que mostram.
- **Campos:** todo campo tem rótulo; nas Configurações a mensagem de erro fica ligada ao campo por `aria-describedby`.

## Fora do escopo

Nível AAA (SPEC-056, seção 3). Outros navegadores além do Chromium (SPEC-055).
