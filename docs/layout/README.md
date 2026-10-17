# Evidências de layout — StudyTrack

Os protótipos **não substituem a Spec**. Servem para o humano **aprovar o arranjo das telas antes do código** (OPEN-020, RNF-06).

Regra: Spec com tela e layout `pendente` em [`../specs.md`](../specs.md) **não** entra em implementação, mesmo com o texto da Spec `aprovado`. Para as SPEC-001 a SPEC-004, que já tinham código, o layout aprovado aqui é aplicado como **refatoração visual**, sem mudar comportamento (os testes continuam valendo).

## Como abrir

Abra [`prototipo.html`](prototipo.html) no navegador (dois cliques no arquivo, ou arraste para o Chrome). No topo:

- **Tela:** escolhe a tela do protótipo.
- **Computador / Celular:** alterna o tamanho (RNF-04). No celular, o menu abre pelo botão ☰.

Marca, paleta e componentes: [`../identidade-visual.md`](../identidade-visual.md).

## Telas do protótipo

| Tela no seletor | Spec | O que mostra |
|---|---|---|
| Identidade visual (amostra) | — | logotipo, paleta, selos de situação, mensagens, componentes |
| Login / Login com credencial inválida | SPEC-001 | painel marinho + formulário; mensagem genérica de erro |
| Acesso negado | SPEC-001 | página de negação com volta ao painel |
| Estudante — Minhas turmas | SPEC-002 | cartões das turmas do estudante, sem lista de colegas (RB-02) |
| Professor — Turmas que leciono | SPEC-002 | cartões das turmas com estudantes e atalho para notas |
| Professor — Notas e avaliações | SPEC-004 | turma e avaliação no topo; tabela de notas; lançar/alterar nota; nova avaliação |
| Coordenador — Início | SPEC-002 | contadores de disciplinas, turmas e estudantes com atalhos |
| Coordenador — Disciplinas | SPEC-002 | tabela + formulário de nova disciplina |
| Coordenador — Turmas | SPEC-002 | tabela das turmas sob responsabilidade + formulário de nova turma |
| Coordenador — Detalhe da turma / Cadastro com campos pendentes | SPEC-002 | estudantes da turma, cadastro e matrícula; erro em cada campo (AC-002-02) |
| Professor — Frequência | SPEC-005 | turma no topo; tabela com frequência e situação; registrar ou alterar a frequência ao lado |
| Professor — Atividades | SPEC-005 | atividades da turma com prazo, entregues e atrasadas; nova atividade ao lado |
| Professor — Entregas de uma atividade | SPEC-005 | status de cada estudante (No prazo, Pendente, Atrasada); registrar ou desfazer entrega |
| Estudante — Minhas atividades | SPEC-005 | contadores e tabela das atividades com prazo e status da própria entrega |
| Estudante — Painel acadêmico | SPEC-006, SPEC-007 | alertas no topo; por turma: média, frequência, situação e gráfico de evolução das notas; atividades atrasadas e pendentes |
| Estudante — Painel sem turmas | SPEC-007 | estado vazio com orientação para procurar a coordenação |
| Professor — Turmas que leciono (com alertas) | SPEC-006 | tabela "Alertas das minhas turmas" acima dos cartões de turma |
| Professor — Dashboard da turma e criação de plano | SPEC-008 | contagem Normal/Atenção/Risco/sem dados; estudantes com média, frequência, situação e plano; novo plano para estudante em Risco |
| Professor — Plano de recuperação | SPEC-008 | itens com marcar concluído; progresso; aviso quando o estudante saiu do Risco; encerrar plano |
| Relatório acadêmico | SPEC-009 | filtros por turma e situação; resumo por turma; detalhe por estudante; exportar CSV |

Em todas as telas autenticadas: menu lateral do perfil, nome e perfil do usuário e botão **Sair** (OPEN-019).

## Aprovação

| Item | Status | Aprovado por | Data |
|---|---|---|---|
| Identidade visual (`identidade-visual.md`) | `aprovado` | Arthur | 2026-10-16 |
| Casca autenticada (menu lateral + Sair) | `aprovado` | Arthur | 2026-10-16 |
| Telas das SPEC-001 a SPEC-004 | `aprovado` | Arthur | 2026-10-16 |
| Telas da SPEC-005 (frequência, atividades e entregas) | `aprovado` | Arthur | 2026-10-16 |
| Telas das SPEC-006 e SPEC-007 (alertas e painel do estudante) | `aprovado` | Arthur | 2026-10-16 |
| Telas das SPEC-008 e SPEC-009 (dashboard da turma, plano e relatório) | `aprovado` | Arthur | 2026-10-16 |

Ao aprovar: preencher esta tabela, a seção "Telas e evidência de layout" de cada Spec em `specs.md` e o campo "Aprovação humana" de `identidade-visual.md`.
