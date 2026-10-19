# Roteiro de apresentação — StudyTrack

Demonstração de cerca de 15 minutos: primeiro o processo (SDD), depois o sistema rodando com os dados
de demonstração do seed, e por fim a evidência de qualidade.

## Antes de começar

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
| Decisões que o agente não tomou sozinho | `docs/decisoes-em-aberto.md` (OPEN-001 a OPEN-024) |
| Layout aprovado antes do código (OPEN-020) | `docs/layout/prototipo.html` |
| Rastreabilidade RF → RB → UC → Spec → teste → verificação | `docs/rastreabilidade.md` |

## 2. Estudante (3 min) — SPEC-006 e SPEC-007

Entrar como `elisa.rocha@studytrack.test`.
- Alerta de Risco no topo do painel (média 4 na Turma de exemplo) e Atenção na Turma B.
- Média, frequência e situação por turma, com gráfico de evolução das notas.
- **Minhas atividades**: a lista vencida aparece como ■ Atrasada; o trabalho final, ○ Pendente.
- Opcional: abrir `/coordenador/area` para mostrar a tela de **Acesso negado** (RNF-03).

## 3. Professor (5 min) — SPEC-004, SPEC-005 e SPEC-008

Entrar como `professor@studytrack.test`.
1. **Início**: tabela "Alertas das minhas turmas" com Risco antes de Atenção.
2. **Abrir turma →** na Turma de exemplo: contadores ● 3 · ▲ 2 · ■ 3 · Sem dados 1.
3. Carla Mendes está em Risco pela frequência (70%) mesmo com média 6,2 (RB-05). **Ver plano (50%)**: marcar um item e ver o progresso subir para 75% (RB-12).
4. Voltar e clicar em **Criar plano** na Elisa Rocha; criar sem itens para mostrar a validação, depois com itens.
5. **Notas e avaliações**: lançar nota 8 para Bruno Costa na Prova 1 (alterar a nota existente) e voltar à turma: a situação dele muda na hora (RB-10).
6. **Frequência**: baixar a frequência de Diego Lima para 70% e mostrar que ele passa a Risco.

## 4. Coordenador (3 min) — SPEC-002 e SPEC-009

Entrar como `coordenador@studytrack.test`.
- **Turmas e estudantes**: cadastrar um estudante novo na Turma B (e tentar sem e-mail para ver a validação).
- **Relatórios**: resumo das duas turmas; filtrar por situação Risco; **Exportar CSV** e abrir no Excel.

## 4b. Administrador (2 min) — SPEC-010

Entrar como `admin@studytrack.test`.
- **Contas**: filtrar por perfil; criar uma conta de Professor e entrar com ela em outra janela anônima.
- Desativar um estudante e mostrar que ele não entra mais (mensagem genérica); reativar.
- Tentar desativar o Professor de Teste: recusado porque ele tem turmas. Como coordenador, trocar o professor da Turma B para Júlia Reis no detalhe da turma.
- Tentar abrir `/relatorios` como administrador: Acesso negado (o admin não vê dados acadêmicos).

## 5. Qualidade (2 min)

| Mostrar | Onde |
|---|---|
| 142 testes, um por AC, INV e RB, nomeados pelo identificador | `npm test`; `docs/verificacao/qualidade.md` |
| CI verde em todo PR, obrigatória na `main` | aba Actions do GitHub; `.github/workflows/ci.yml` |
| Verificação de cada Spec (testes + navegador, desktop e celular) | `docs/verificacao/` |
| Segurança: escopo na própria consulta, hash de senha, JWT em cookie httpOnly | `docs/seguranca-ssdlc.md`, ADR-003 e ADR-004 |

## Se algo der errado

- Dados alterados durante a demonstração: rodar `npm run seed` de novo devolve as notas e frequências dos estudantes de demonstração aos valores iniciais e recalcula a situação. Entregas e planos criados na apresentação continuam no banco.
- Página com erro depois de trocar de branch: parar e subir de novo o `npm run dev`.
