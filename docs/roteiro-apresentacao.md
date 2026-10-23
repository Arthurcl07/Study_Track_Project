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
| Decisões que o agente não tomou sozinho | `docs/decisoes-em-aberto.md` (OPEN-001 a OPEN-036) |
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

Entrar como `coordenador@studytrack.test` (Marina Alves coordena Engenharia da Computação e Ciência da Computação).
- **Dashboard**: totais, situação por curso, média e frequência por turma e turmas que pedem atenção; trocar o **Curso** no filtro e ver os números mudarem (SPEC-016).
- **Disciplinas**: a grade de cada curso; Cálculo I e Algoritmos aparecem com "Também em" outros cursos; adicionar à grade uma disciplina de outro curso (SPEC-015).
- **Turmas e estudantes**: coluna Curso; na nova turma, a lista de disciplinas muda conforme o curso escolhido.
- **Histórico de notas**: depois do passo 5 do professor, a alteração da nota do Bruno aparece com quem fez e quando (SPEC-013).
- **Turmas e estudantes**: cadastrar um estudante novo na Turma ER-B (e tentar sem e-mail para ver a validação).
- **Relatórios**: filtrar por curso e por situação Risco; **Exportar CSV** e abrir no Excel.

## 4b. Administrador (3 min) — SPEC-010, SPEC-015 e SPEC-016

Entrar como `admin@studytrack.test`.
- **Dashboard**: contas por perfil, ativas e desativadas, senhas provisórias, contas recentes e os 6 cursos com coordenação e totais — sem nenhuma nota ou situação (RB-13).
- **Cursos**: criar um curso escolhendo a coordenação; trocar a coordenação de um curso.
- **Contas**: filtrar por perfil; criar uma conta de Professor e entrar com ela em outra janela anônima. Ao escolher o perfil Estudante, aparece o campo **Curso** (obrigatório).
- Desativar um estudante e mostrar que ele não entra mais (mensagem genérica); reativar.
- Tentar desativar o professor Carlos Lima (recusado: tem turmas) e a coordenadora Paula Martins (recusado: coordena um curso). Como coordenador, trocar o professor da Turma ER-B para Júlia Reis no detalhe da turma.
- Tentar abrir `/relatorios` como administrador: Acesso negado (o admin não vê dados acadêmicos).
- A conta criada pelo admin, ao entrar, cai em **Defina sua senha** e só usa o sistema depois de trocar (SPEC-011).

## 5. Qualidade (2 min)

| Mostrar | Onde |
|---|---|
| 201 testes, um por AC, INV e RB, nomeados pelo identificador | `npm test`; `docs/verificacao/qualidade.md` |
| CI verde em todo PR, obrigatória na `main` | aba Actions do GitHub; `.github/workflows/ci.yml` |
| Verificação de cada Spec (testes + navegador, desktop e celular) | `docs/verificacao/` |
| Segurança: escopo na própria consulta, hash de senha, JWT em cookie httpOnly | `docs/seguranca-ssdlc.md`, ADR-003 e ADR-004 |

## Se algo der errado

- Dados alterados durante a demonstração: rodar `npm run seed` de novo devolve as notas e frequências dos estudantes de demonstração aos valores iniciais e recalcula a situação. Entregas e planos criados na apresentação continuam no banco.
- Página com erro depois de trocar de branch: parar e subir de novo o `npm run dev`.
