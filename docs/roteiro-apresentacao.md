# Roteiro de apresentação — StudyTrack

Demonstração de cerca de 15 minutos: primeiro o processo (SDD), depois o sistema rodando com os dados
de demonstração do seed, e por fim a evidência de qualidade.

## Antes de começar

O jeito mais simples: dois cliques em `Iniciar StudyTrack.bat` (opção 2, modo apresentação). Logins em `CONTAS-DE-TESTE.txt`. Pelo terminal:

```bash
npm run seed
```

```bash
npm run dev
```

Abra http://localhost:3000. Todas as contas usam a senha `StudyTrack@2026` (README, "Contas de teste").
Para trocar de perfil, use **Sair** no menu lateral.

## 1. Processo (2 min)

| Mostrar | Onde |
|---|---|
| Requisitos em EARS e regras de negócio | `docs/StudyTrack_RF.md`, `docs/StudyTrack_RB.md` |
| Mapa e texto das Specs, com status e registro de aprovação humana | `docs/specs.md` (seção "Registro de aprovação humana") |
| Decisões que o agente não tomou sozinho | `docs/decisoes-em-aberto.md` (OPEN-001 a OPEN-047) |
| Layout aprovado antes do código (OPEN-020) | `docs/layout/prototipo.html` |
| Rastreabilidade RF → RB → UC → Spec → teste → verificação | `docs/rastreabilidade.md` |

## 2. Estudante (3 min) — SPEC-006, SPEC-007 e SPEC-016

Entrar como `elisa.rocha@studytrack.test`: cai direto no **Dashboard** (SPEC-016).
- Curso no topo (Engenharia da Computação), cartões com média geral, frequência geral, situação nas turmas e atividades.
- Alerta de Risco no topo do painel (média 4 na Turma MS-A) e Atenção na Turma ER-B.
- Gráfico de média e frequência por disciplina e **Próximos prazos** (7 dias).
- Média, frequência e situação por turma, com gráfico de evolução das notas.
- **Minhas atividades**: a lista vencida aparece como ■ Atrasada; o trabalho final, ○ Pendente.
- Opcional: abrir `/coordenador/area` para mostrar a tela de **Acesso negado** (RNF-03).

## 2b. Estudante com plano (1 min) — SPEC-012

Entrar como `carla.mendes@studytrack.test`: o painel mostra "Seu plano de recuperação" com 50% e os itens marcados pelo professor.

## 3. Professor (5 min) — SPEC-004, SPEC-005 e SPEC-008

Entrar como `professor@studytrack.test`.
1. **Dashboard**: cartões (turmas em 2 cursos, estudantes, em Risco, atrasadas, planos ativos), alertas com Risco antes de Atenção, gráficos por turma, próximos prazos e planos ativos com progresso (SPEC-016).
2. **Abrir turma →** na Turma MS-A: contadores ● 3 · ▲ 2 · ■ 3 · Sem dados 1.
3. Carla Mendes está em Risco pela frequência (70%) mesmo com média 6,2 (RB-05). **Ver plano (50%)**: marcar um item e ver o progresso subir para 75% (RB-12).
4. Voltar e clicar em **Criar plano** na Elisa Rocha; criar sem itens para mostrar a validação, depois com itens.
5. **Notas e avaliações**: lançar nota 8 para Bruno Costa na Prova 1 (alterar a nota existente) e voltar à turma: a situação dele muda na hora (RB-10).
6. **Frequência**: baixar a frequência de Diego Lima para 70% e mostrar que ele passa a Risco.

## 4. Coordenador (4 min) — SPEC-002, SPEC-009, SPEC-014, SPEC-015 e SPEC-016

Entrar como `coordenador@studytrack.test` (Marina Alves coordena Engenharia da Computação; cada curso tem o seu coordenador).
- **Dashboard**: totais, situação por turma, média e frequência por turma e turmas que pedem atenção, só do curso dela (SPEC-016). Para mostrar o filtro por curso, o administrador dá a ela um segundo curso em **Cursos** e o seletor **Curso** aparece no dashboard e no relatório.
- **Disciplinas**: a grade do curso; Cálculo I e Algoritmos aparecem com "Também em" outros cursos; adicionar à grade uma disciplina de outro curso (SPEC-015).
- **Turmas e estudantes**: coluna Curso; na nova turma, só aparecem as disciplinas da grade do curso.
- **Histórico de notas**: depois do passo 5 do professor, a alteração da nota do Bruno aparece com quem fez e quando (SPEC-013).
- **Turmas e estudantes**: cadastrar um estudante novo na Turma ER-B (e tentar sem e-mail para ver a validação).
- **Relatórios**: filtrar por situação Risco; **Exportar CSV** e abrir no Excel.

## 4b. Administrador (3 min) — SPEC-010, SPEC-015 e SPEC-016

Entrar como `admin@studytrack.test`.
- **Dashboard**: contas por perfil, ativas e desativadas, senhas provisórias, contas recentes e os 6 cursos com coordenação e totais — sem nenhuma nota ou situação (RB-13).
- **Cursos**: criar um curso escolhendo a coordenação; trocar a coordenação de um curso.
- **Contas**: filtrar por perfil; criar uma conta de Professor e entrar com ela em outra janela anônima. Ao escolher o perfil Estudante, aparece o campo **Curso** (obrigatório).
- Desativar um estudante e mostrar que ele não entra mais (mensagem genérica); reativar.
- Tentar desativar o professor Carlos Lima (recusado: tem turmas) e a coordenadora Paula Martins (recusado: coordena um curso). Como coordenador, trocar o professor da Turma ER-B para Júlia Reis no detalhe da turma.
- Tentar abrir `/relatorios` como administrador: Acesso negado (o admin não vê dados acadêmicos).
- A conta criada pelo admin, ao entrar, cai em **Defina sua senha** e só usa o sistema depois de trocar (SPEC-011).

## 4c. Recursos de sistema acadêmico (4 min) — SPEC-017 a SPEC-022

- **Professor (`professor@`) → Chamada**: escolher a turma, desmarcar uma falta e salvar; a frequência e a situação do estudante mudam na hora (SPEC-018). **Notificações** no menu, com o contador (SPEC-022).
- **Estudante (`carla.mendes@`) → Notificações**: entrou em Risco, nota lançada e plano criado. **Documentos → Abrir histórico escolar**: 2026/1 com Aprovado e Reprovado por frequência, 2026/2 Em curso; **Baixar PDF** (SPEC-020).
- **Coordenador (`coordenador@`) → Turmas e estudantes**: a Turma INT-ECO (2026/1) aparece como Encerrado e não aceita alterações; na Turma MS-A, **Importar planilha (CSV)** com **Baixar modelo** e a prévia (SPEC-021); links Boletim · Histórico de cada estudante. **Auditoria**: quem alterou o quê (SPEC-019). **Dashboard** e **Relatórios**: filtro Período (SPEC-017).
- **Administrador → Períodos letivos**: 2026/1 encerrado e 2026/2 aberto; encerrar e reabrir (com confirmação). **Auditoria**: ações de contas, cursos e períodos.

## 4d. Simulador, comparativo e comunicados (3 min) — SPEC-023 a SPEC-025

- **Estudante (`carla.mendes@`) → Dashboard**: em cada turma, **Quanto preciso tirar?** para 6,0 e 5,0; **Simular minhas notas**, digitar 9 na Prova 2 e ver a média e a situação simuladas (a frequência de 70% mantém o Risco). **Documentos**: gráfico da evolução por semestre. **Comunicados**: aviso do professor e da coordenação.
- **Professor (`professor@`) → Dashboard → Turma MS-A**: coluna **Precisa (6,0)** para cada estudante. **Comunicados**: publicar um aviso para a turma; a Carla recebe a notificação.
- **Coordenador (`coordenador@`) → Dashboard**: **Comparativo entre semestres** (2026/1 × 2026/2, com setas de tendência e média por disciplina). **Comunicados**: publicar para todas as turmas de Engenharia da Computação.

## 4e. Secretaria e uso real (4 min) — SPEC-026 a SPEC-035

- **Login → Esqueci minha senha**: informar `julia.reis@studytrack.test`; a resposta é sempre a mesma. **Administrador → Pedidos de senha**: aprovar o pedido da Júlia e mostrar a senha provisória (aparece uma vez); ela entra e é obrigada a criar outra (SPEC-027).
- **Administrador → Estudantes**: buscar "amanda" (sem acento, por nome, e-mail ou matrícula), abrir a ficha da Amanda Barbosa (Trancada); abrir a de outro estudante e registrar um **abono** (a prévia diz quantas faltas serão abonadas) (SPEC-031 a SPEC-034). **Boletim** do João em 2026/1: cabeçalho da instituição, matrícula, exame, nota final e "Aprovado no exame" (SPEC-029/033). **Instituição** e **Virada de semestre** (prévia 2026/1 → 2026/2) (SPEC-030/033).
- **Professor → Chamada → Turma SO-B**: a aula dupla do último dia (1ª e 2ª aula); corrigir, mudar a data ou excluir uma aula (SPEC-026/028). **Notas → Turma MS-A**: tipo de cada avaliação, a Substitutiva e Editar/Excluir (SPEC-026/029).
- **Coordenador → Turmas e estudantes**: matrícula e situação de cada estudante, "Tirar da turma" (recusado se já tem nota) e Editar turma; **Disciplinas**: editar e excluir (SPEC-026).

## 4f. Sistema acadêmico completo (5 min) — SPEC-036 a SPEC-043

- **Estudante (`estudante@`) → Meu curso**: integralização (20%) e a matriz por semestre — Aprovada, Cursando, Pendente e Bloqueada com o pré-requisito que falta (SPEC-037). **Rematrícula 2027/1**: vagas, "Falta pré-requisito" em Cálculo II; matricular em Inteligência Artificial e mostrar que Empreendedorismo passa a ter choque de horário; cancelar (SPEC-038). **Calendário**: feriados, semana de provas, prazos e a grade da semana com salas (SPEC-040/041). **Requerimentos**: abrir uma revisão de prova (protocolo e prazo de 5 dias úteis) e abrir a declaração de matrícula já deferida (SPEC-036).
- **Professor (`professor@`) → Requerimentos**: deferir a revisão de prova do João (ele recebe a notificação). **Chamada → Turma MS-A**: o conteúdo de cada aula; **Turma ER-B**: diário fechado, sem lançamento (SPEC-039).
- **Coordenador (`coordenador@`) → Diários**: homologar ou devolver o diário da Turma ER-B (devolver avisa o professor). **Disciplinas → Matriz**: tentar pôr Algoritmos como pré-requisito de Lógica (recusado: ciclo). **Turmas → Turma MS-A**: horários com sala e vagas; um horário que bate com outra turma na mesma sala é recusado (SPEC-037/039/041).
- **Administrador (`admin@`) → Estudantes → Henrique Dias**: integralização e o aproveitamento de Introdução à Computação; tentar marcar Concluído (recusado com o que falta); **Histórico** com a seção de aproveitamento (SPEC-042). **Calendário**, **Salas**, **Períodos letivos** (janela de rematrícula) e **Exportação do Censo** (prévia e CSV de apoio) (SPEC-040/041/043).
- A rematrícula de 2027/1 está aberta de 03/11 a 30/11/2026. Se a apresentação for depois, ajuste a janela em **Administrador → Períodos letivos**.

## 5. Qualidade (2 min)

| Mostrar | Onde |
|---|---|
| 395 testes, um por AC, INV e RB, nomeados pelo identificador | `npm test`; `docs/verificacao/qualidade.md` |
| CI verde em todo PR, obrigatória na `main` | aba Actions do GitHub; `.github/workflows/ci.yml` |
| Verificação de cada Spec (testes + navegador, desktop e celular) | `docs/verificacao/` |
| Segurança: escopo na própria consulta, hash de senha, JWT em cookie httpOnly | `docs/seguranca-ssdlc.md`, ADR-003 e ADR-004 |

## Se algo der errado

- Dados alterados durante a demonstração: rodar `npm run seed` de novo devolve as notas e frequências dos estudantes de demonstração aos valores iniciais e recalcula a situação. Entregas e planos criados na apresentação continuam no banco.
- Página com erro depois de trocar de branch: parar e subir de novo o `npm run dev`.
