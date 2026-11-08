# Mapa ordenado de Specs — StudyTrack
> Nota (2026-10-02): este mapa reflete a baseline de 2026-09-25. As SPEC-010 a SPEC-025, incluídas depois, estão resumidas no fim deste arquivo. Desde então o OPEN-006 foi fechado (ADR-004), o OPEN-007 foi fechado (visão do produto reescrita) e o UC-05 foi criado. Novas questões (OPEN-008 a OPEN-012) surgiram ao escrever as Specs completas. Ver `decisoes-em-aberto.md` e `specs.md`.

## Escopo deste documento

Este documento contém somente o mapa ordenado de Specs, conforme o prompt de Spec-Driven
Development. Ele foi derivado da baseline documental existente em `docs/`; não define contratos
de API, modelo físico adicional, tecnologias além das decisões já registradas, nem implementação.

## Leitura da baseline

### Comportamentos principais

- autenticar usuários e autorizar funcionalidades e dados por perfil e escopo;
- cadastrar a estrutura acadêmica e seus vínculos;
- registrar notas, frequência, atividades e entregas;
- calcular média, indicador e situação acadêmica;
- sinalizar atividades atrasadas e situações de Atenção/Risco;
- consultar dashboards de estudante e professor;
- criar e acompanhar planos de recuperação;
- gerar relatórios consolidados para usuários autorizados.

### Dependências de alto nível

1. Autenticação e autorização são pré-requisitos para qualquer operação protegida.
2. Estrutura acadêmica e vínculos são pré-requisitos para registrar dados acadêmicos.
3. O cálculo de situação precisa estar definido antes das escritas que atualizam o indicador e
	 antes dos dashboards e planos de recuperação.
4. Notas, frequência, atividades e entregas alimentam o indicador e os dashboards.
5. Dashboards, alertas, planos e relatórios dependem dos dados persistidos e do escopo autorizado.

### Restrições transversais

- RNF-01, RNF-03, RNF-04 e RNF-05 aplicam-se às Specs que expõem telas ou consultas.
- RNF-02 aplica-se à autenticação e ao armazenamento de usuários.
- DA-01 exige filtro de escopo na própria consulta e negação por padrão.
- DA-02 exige classificação como função pura na camada de domínio, síncrona nas alterações e sem
	duplicação em controller ou trigger.
- DA-03/ADR-001 exigem arquitetura em camadas e monólito modular.
- DA-04/ADR-002 exige PostgreSQL, chaves estrangeiras e constraints de integridade.
- DA-05 exige indicador persistido e consulta de dashboard compatível com o desempenho definido.
- DA-07 exige regra de negócio isolada e teste automatizado rastreável pelo identificador da RB.

### Lacunas e inconsistências identificadas

- Os documentos não definem quais perfis podem executar os cadastros de estudante, disciplina,
	turma e atividade, nem registrar frequência.
- A faixa válida de nota, a fórmula da média e o tratamento de avaliações sem nota não estão
	definidos.
- A baseline menciona entrega e conclusão de atividade, mas não define um fluxo de registro da
	entrega pelo estudante.
- O canal, momento e persistência dos alertas não estão definidos.
- O formato, filtros e escopo detalhado dos relatórios não estão definidos; o UC-05 é citado no
	diagrama, mas não há documento individual correspondente.
- A arquitetura cita sessão/JWT como alternativa de autenticação, sem decisão entre as opções.
- A visão do produto menciona metas, prioridades e tarefas genéricas, mas os RFs e o modelo de
	domínio aprovados não as especificam como capacidades do sistema acadêmico.

Essas lacunas não foram resolvidas neste mapa. Elas devem ser decididas antes da elaboração da
Spec que necessitar de cada contrato.

## Mapa ordenado

### SPEC-001 — Autenticação, perfis e autorização por escopo

- **Objetivo:** permitir que Estudante, Professor e Coordenador iniciem sessão e acessem somente
	funcionalidades e dados autorizados.
- **Valor entregue:** entrada segura no sistema e proteção consistente dos dados acadêmicos.
- **RF relacionados:** RF-01, RF-02.
- **RB relacionadas:** RB-01, RB-02, RB-03, RB-04.
- **RNF aplicáveis:** RNF-02, RNF-03, RNF-05; RNF-04 para a tela de autenticação.
- **Caso de uso/fluxo:** UC-01; pré-condição transversal dos demais casos de uso.
- **Entidades:** Usuario e perfil; vínculos Usuario-Turma para escopo.
- **Drivers:** DA-01, DA-06, DA-07.
- **ADRs:** ADR-001, ADR-003.
- **Dependências:** nenhuma.
- **Justificativa da ordem:** estabelece sessão, identidade, perfil e escopo exigidos por toda
	operação posterior. A escolha entre sessão e JWT permanece em aberto.

### SPEC-002 — Estrutura acadêmica e vínculos de turma

- **Objetivo:** cadastrar estudantes, disciplinas e turmas e manter associações com professores,
	estudantes e coordenadores.
- **Valor entregue:** base acadêmica consistente para registrar e consultar o acompanhamento.
- **RF relacionados:** RF-03, RF-04.
- **RB relacionadas:** RB-01 e vínculos do modelo de domínio.
- **RNF aplicáveis:** RNF-03, RNF-05; RNF-04 para as telas de cadastro.
- **Caso de uso/fluxo:** fluxos de cadastro ainda não documentados.
- **Entidades:** Usuario, Disciplina, Turma e relacionamentos de matrícula, docência e
	responsabilidade.
- **Drivers:** DA-01, DA-04, DA-07.
- **ADRs:** ADR-001, ADR-002, ADR-003.
- **Dependências:** SPEC-001.
- **Justificativa da ordem:** cria as relações obrigatórias usadas por avaliações, frequência,
	atividades, indicadores e consultas. Permissões específicas de cadastro são `OPEN-001`.

### SPEC-003 — Cálculo da situação acadêmica e indicador persistido

- **Objetivo:** calcular média, frequência e a classificação Normal/Atenção/Risco conforme as
	regras de negócio, mantendo um indicador vigente por estudante e turma.
- **Valor entregue:** decisão acadêmica única, verificável e reutilizável por todas as
	funcionalidades de acompanhamento.
- **RF relacionados:** RF-06, RF-11.
- **RB relacionadas:** RB-05, RB-06, RB-07, RB-09, RB-10.
- **RNF aplicáveis:** RNF-03 e RNF-05 quando consultado; RNF-01 para leituras do indicador.
- **Caso de uso/fluxo:** UC-02; inclusão `Recalcular Indicador Acadêmico` do diagrama.
- **Entidades:** Nota, Frequencia, IndicadorAcademico, Turma e estudante.
- **Drivers:** DA-02, DA-03, DA-05, DA-07.
- **ADRs:** ADR-001, ADR-002.
- **Dependências:** SPEC-002.
- **Justificativa da ordem:** fixa o comportamento central antes de qualquer operação que altere
	notas, frequência ou atividades e antes dos dashboards e planos.

### SPEC-004 — Registro de avaliações, notas e médias

- **Objetivo:** permitir ao professor registrar ou alterar nota de estudante em avaliação e
	atualizar a média e o indicador correspondente.
- **Valor entregue:** lançamento confiável de desempenho por avaliação.
- **RF relacionados:** RF-05, RF-06, RF-11.
- **RB relacionadas:** RB-03, RB-05, RB-06, RB-07, RB-09, RB-10.
- **RNF aplicáveis:** RNF-03, RNF-05; RNF-04 na interface.
- **Caso de uso/fluxo:** UC-03, incluindo alteração de nota.
- **Entidades:** Usuario, Professor, Turma, Disciplina, Avaliacao, Nota e IndicadorAcademico.
- **Drivers:** DA-01, DA-02, DA-04, DA-07.
- **ADRs:** ADR-001, ADR-002, ADR-003.
- **Dependências:** SPEC-001, SPEC-002, SPEC-003.
- **Justificativa da ordem:** é a primeira escrita acadêmica documentada e exercita o cálculo
	central com o escopo do professor. Faixa e fórmula da nota/média são `OPEN-002`.

### SPEC-005 — Frequência, atividades e entregas atrasadas

- **Objetivo:** registrar alterações de frequência e atividades, acompanhar entregas e classificar
	como atrasada a atividade sem entrega após o prazo.
- **Valor entregue:** acompanhamento de presença e prazos que alimenta a situação acadêmica.
- **RF relacionados:** RF-07, RF-08, RF-09, RF-11.
- **RB relacionadas:** RB-03, RB-05, RB-08, RB-09, RB-10.
- **RNF aplicáveis:** RNF-03, RNF-05; RNF-04 nas telas correspondentes.
- **Caso de uso/fluxo:** extensões de atividade atrasada do UC-02; fluxos de frequência e entrega
	ainda não documentados.
- **Entidades:** Usuario, Turma, Frequencia, Atividade, Entrega e IndicadorAcademico.
- **Drivers:** DA-01, DA-02, DA-04, DA-07.
- **ADRs:** ADR-001, ADR-002, ADR-003.
- **Dependências:** SPEC-001, SPEC-002, SPEC-003.
- **Justificativa da ordem:** completa as fontes de dados do indicador e do dashboard. O fluxo de
	registro de entrega e as permissões específicas são `OPEN-003` e `OPEN-001`.

### SPEC-006 — Alertas de atenção e risco

- **Objetivo:** apresentar alerta ao estudante e ao professor responsável quando o indicador
	atingir Atenção ou Risco.
- **Valor entregue:** sinalização acionável de dificuldades acadêmicas.
- **RF relacionados:** RF-12.
- **RB relacionadas:** RB-03, RB-04, RB-09, RB-10.
- **RNF aplicáveis:** RNF-03, RNF-05, RNF-01; RNF-04 na apresentação.
- **Caso de uso/fluxo:** inclusão `Emitir Alerta de Atenção/Risco`; extensão 1 do UC-02.
- **Entidades:** IndicadorAcademico, Usuario, Turma e vínculos de responsabilidade.
- **Drivers:** DA-01, DA-02, DA-05, DA-07.
- **ADRs:** ADR-001, ADR-003.
- **Dependências:** SPEC-001, SPEC-003, SPEC-004 e SPEC-005.
- **Justificativa da ordem:** depende da classificação atualizada por todas as fontes acadêmicas
	e habilita uma resposta visível nos dashboards. Canal e persistência são `OPEN-004`.

### SPEC-007 — Dashboard acadêmico do estudante

- **Objetivo:** consolidar notas, médias, frequência, atividades, evolução, situação e alertas
	das turmas do estudante autenticado.
- **Valor entregue:** visão individual atualizada para acompanhamento e priorização.
- **RF relacionados:** RF-09, RF-10, RF-11, RF-12.
- **RB relacionadas:** RB-02, RB-05, RB-06, RB-07, RB-08, RB-09, RB-10.
- **RNF aplicáveis:** RNF-01, RNF-03, RNF-04, RNF-05.
- **Caso de uso/fluxo:** UC-02, incluindo estudante sem turmas, alertas e atrasos.
- **Entidades:** Usuario, Turma, Disciplina, Avaliacao, Nota, Frequencia, Atividade, Entrega e
	IndicadorAcademico.
- **Drivers:** DA-01, DA-02, DA-05, DA-07.
- **ADRs:** ADR-001, ADR-002, ADR-003.
- **Dependências:** SPEC-001 a SPEC-006.
- **Justificativa da ordem:** é a primeira entrega consolidada ao usuário e exige todas as fontes
	e o filtro de escopo do estudante.

### SPEC-008 — Dashboard do professor e plano de recuperação

- **Objetivo:** permitir ao professor analisar estudantes de suas turmas e criar ou acompanhar
	plano de recuperação para estudantes em Risco.
- **Valor entregue:** intervenção pedagógica baseada em indicadores e progresso de atividades.
- **RF relacionados:** RF-13, RF-14.
- **RB relacionadas:** RB-03, RB-09, RB-11, RB-12.
- **RNF aplicáveis:** RNF-01, RNF-03, RNF-04, RNF-05.
- **Caso de uso/fluxo:** dashboard do professor; UC-04, incluindo progresso.
- **Entidades:** Usuario, Turma, IndicadorAcademico, PlanoRecuperacao, Atividade e estudante.
- **Drivers:** DA-01, DA-02, DA-04, DA-05, DA-07.
- **ADRs:** ADR-001, ADR-002, ADR-003.
- **Dependências:** SPEC-001 a SPEC-006; SPEC-007 fornece o padrão de consulta consolidada.
- **Justificativa da ordem:** requer indicadores, escopo de professor e atividades estáveis; o
	plano só pode ser criado quando a situação for Risco e precisa respeitar sua integridade.

### SPEC-009 — Relatórios acadêmicos autorizados

- **Objetivo:** gerar informações consolidadas de desempenho, frequência e situação conforme o
	escopo do professor ou coordenador.
- **Valor entregue:** apoio à análise pedagógica e institucional sem exposição indevida de dados.
- **RF relacionados:** RF-15.
- **RB relacionadas:** RB-03, RB-04, RB-09, RB-10.
- **RNF aplicáveis:** RNF-01, RNF-03, RNF-04, RNF-05.
- **Caso de uso/fluxo:** UC-05 citado no diagrama, ainda não especificado individualmente.
- **Entidades:** Usuario, Turma, Disciplina, Nota, Frequencia, Atividade e IndicadorAcademico.
- **Drivers:** DA-01, DA-02, DA-04, DA-05, DA-07.
- **ADRs:** ADR-001, ADR-002, ADR-003.
- **Dependências:** SPEC-001 a SPEC-008.
- **Justificativa da ordem:** é uma leitura consolidada que depende de todos os dados e indicadores
	e possui escopos distintos para professor e coordenador. Formato, filtros e UC-05 são `OPEN-005`.

## Specs incluídas depois deste mapa (2026-10-17 a 2026-10-22)

Cada uma entrou por pedido de Arthur ou sugestão aprovada, com a decisão registrada em `decisoes-em-aberto.md` e o texto completo em `specs.md`.

### SPEC-010 — Administrador e gestão de contas

- **Objetivo:** criar, listar, desativar e reativar contas por um perfil Administrador, sem acesso a dados acadêmicos; trocar o professor da turma.
- **RF / RB:** RF-16, RF-17; RB-01, RB-13, RB-14.
- **Dependências:** SPEC-001, SPEC-002. **OPEN:** OPEN-025.

### SPEC-011 — Senha própria e troca no primeiro acesso

- **Objetivo:** conta criada pela tela usa senha provisória até o dono definir a própria; "Alterar minha senha" para todos.
- **RF / RB:** RF-18; RB-15. **Dependências:** SPEC-001, SPEC-010. **OPEN:** OPEN-026.

### SPEC-012 — Plano de recuperação visível ao estudante

- **Objetivo:** o estudante vê os próprios planos, itens e progresso, só leitura.
- **RF / RB:** RF-19; RB-02, RB-12. **Dependências:** SPEC-007, SPEC-008. **OPEN:** OPEN-027.

### SPEC-013 — Histórico de notas

- **Objetivo:** registrar cada lançamento e alteração de nota (autor, data, antes e depois), sem edição nem exclusão.
- **RF / RB:** RF-20; RB-03, RB-04, RB-16. **Dependências:** SPEC-004. **OPEN:** OPEN-028.

### SPEC-014 — Painel do coordenador

- **Objetivo:** visão comparativa das turmas do coordenador, com os mesmos números do relatório.
- **RF / RB:** RF-21; RB-04, RB-09. **Dependências:** SPEC-009. **OPEN:** OPEN-029.

### SPEC-015 — Cursos e coordenação por curso

- **Objetivo:** cursos com um coordenador cada, disciplinas compartilhadas entre cursos, turma e estudante de um curso; o escopo do coordenador passa a ser o dos cursos que coordena.
- **RF / RB:** RF-22, RF-23; RB-04, RB-13, RB-14, RB-17, RB-18, RB-19.
- **Dependências:** SPEC-002, SPEC-009, SPEC-010. **OPEN:** OPEN-030 a OPEN-034, OPEN-036.

### SPEC-016 — Dashboards por perfil

- **Objetivo:** todo perfil abre no próprio dashboard, com os números e gráficos do seu escopo; o administrador só vê contas e cursos.
- **RF / RB:** RF-24, RF-25; RB-02, RB-03, RB-04, RB-09, RB-13.
- **Dependências:** SPEC-006 a SPEC-009, SPEC-012, SPEC-014, SPEC-015. **OPEN:** OPEN-034, OPEN-035.

### SPEC-017 — Período letivo

- **Objetivo:** turmas organizadas por semestre; o administrador encerra e reabre; turma de período encerrado é somente leitura.
- **RF / RB:** RF-26; RB-14 (ajuste), RB-20.
- **Dependências:** SPEC-002, SPEC-009, SPEC-010, SPEC-015, SPEC-016. **OPEN:** OPEN-040.

### SPEC-018 — Chamada por aula

- **Objetivo:** o professor faz a chamada de cada aula; a frequência é calculada pelas presenças.
- **RF / RB:** RF-07 (alterado), RF-27; RB-05, RB-10, RB-21.
- **Dependências:** SPEC-003, SPEC-005, SPEC-017. **OPEN:** OPEN-041.

### SPEC-019 — Auditoria

- **Objetivo:** toda escrita registrada (quem, quando, antes e depois); coordenador vê as acadêmicas dos seus cursos, administrador as administrativas.
- **RF / RB:** RF-28; RB-13, RB-22.
- **Dependências:** SPEC-002 a SPEC-005, SPEC-008, SPEC-010, SPEC-015, SPEC-017, SPEC-018. **OPEN:** OPEN-039.

### SPEC-020 — Boletim e histórico escolar

- **Objetivo:** documentos prontos para imprimir ou salvar em PDF, com o resultado de cada disciplina.
- **RF / RB:** RF-29; RB-02, RB-04, RB-24.
- **Dependências:** SPEC-003, SPEC-004, SPEC-015, SPEC-017, SPEC-018. **OPEN:** OPEN-038, OPEN-044.

### SPEC-021 — Importação de estudantes por planilha

- **Objetivo:** cadastrar e matricular estudantes por CSV, com prévia e tudo ou nada.
- **RF / RB:** RF-30; RB-15, RB-19, RB-20.
- **Dependências:** SPEC-002, SPEC-011, SPEC-015, SPEC-017, SPEC-019. **OPEN:** OPEN-042.

### SPEC-022 — Notificações

- **Objetivo:** sino com notificações gravadas de Risco, nota, plano e prazo para estudante e professor.
- **RF / RB:** RF-31; RB-23.
- **Dependências:** SPEC-003, SPEC-004, SPEC-005, SPEC-008, SPEC-017. **OPEN:** OPEN-043.

### SPEC-023 — Simulador de notas

- **Objetivo:** nota necessária nas avaliações restantes para 6,0 e 5,0, e simulação livre para o estudante; o professor vê por aluno.
- **RF / RB:** RF-32; RB-25. **Dependências:** SPEC-003, SPEC-004, SPEC-007, SPEC-008, SPEC-017. **OPEN:** OPEN-045.

### SPEC-024 — Comparativo entre semestres

- **Objetivo:** indicadores por período para o coordenador (total e por disciplina) e para o estudante.
- **RF / RB:** RF-33; RB-24. **Dependências:** SPEC-016, SPEC-017, SPEC-020. **OPEN:** OPEN-046.

### SPEC-025 — Mural de comunicados

- **Objetivo:** professor e coordenador publicam avisos para a turma ou o curso, com notificação e mural.
- **RF / RB:** RF-34; RB-26. **Dependências:** SPEC-002, SPEC-015, SPEC-017, SPEC-019, SPEC-022. **OPEN:** OPEN-047.

### SPEC-026 — Correção de cadastros

- **Objetivo:** editar e excluir (sem registro dependente) contas, disciplinas, turmas, matrículas, avaliações, atividades e aulas.
- **RF / RB:** RF-35; RB-20, RB-21, RB-32. **Dependências:** SPEC-002, SPEC-004, SPEC-005, SPEC-010, SPEC-015, SPEC-017, SPEC-018, SPEC-019. **OPEN:** OPEN-048.

### SPEC-027 — Redefinição de senha por pedido

- **Objetivo:** "Esqueci minha senha" no login; o administrador aprova e entrega uma senha provisória.
- **RF / RB:** RF-36; RB-15, RB-27. **Dependências:** SPEC-001, SPEC-010, SPEC-011, SPEC-019. **OPEN:** OPEN-049.

### SPEC-028 — Várias aulas no mesmo dia

- **Objetivo:** chamada de 1 a 4 aulas por data, cada uma com a própria presença.
- **RF / RB:** RF-27; RB-21. **Dependências:** SPEC-017, SPEC-018, SPEC-019. **OPEN:** OPEN-050.

### SPEC-029 — Prova substitutiva e exame final

- **Objetivo:** tipo da avaliação; substitutiva troca a menor prova; exame final dá a nota final no resultado.
- **RF / RB:** RF-37; RB-24, RB-25, RB-28, RB-29. **Dependências:** SPEC-003, SPEC-004, SPEC-020, SPEC-023, SPEC-026. **OPEN:** OPEN-051.

### SPEC-030 — Virada de semestre

- **Objetivo:** copiar turmas (e, se pedido, estudantes ativos) para o período novo.
- **RF / RB:** RF-38; RB-18, RB-20, RB-30. **Dependências:** SPEC-015, SPEC-017, SPEC-019, SPEC-031. **OPEN:** OPEN-052.

### SPEC-031 — Situação do estudante no curso

- **Objetivo:** trancamento, transferência, cancelamento, conclusão e troca de curso, com matrículas trancadas/canceladas fora das listas de trabalho.
- **RF / RB:** RF-39; RB-19, RB-24, RB-30. **Dependências:** SPEC-015, SPEC-017, SPEC-019, SPEC-020, SPEC-033. **OPEN:** OPEN-053.

### SPEC-032 — Abono de faltas

- **Objetivo:** abono por intervalo de datas registrado pela secretaria; falta abonada conta como presença.
- **RF / RB:** RF-40; RB-21, RB-31. **Dependências:** SPEC-017, SPEC-018, SPEC-019, SPEC-028, SPEC-033. **OPEN:** OPEN-054.

### SPEC-033 — Ficha do estudante e dados da instituição

- **Objetivo:** número de matrícula e dados pessoais do estudante; dados e logotipo da instituição nos documentos.
- **RF / RB:** RF-41, RF-42; RB-33. **Dependências:** SPEC-002, SPEC-010, SPEC-015, SPEC-019, SPEC-020, SPEC-021. **OPEN:** OPEN-055.

### SPEC-034 — Busca e paginação

- **Objetivo:** busca por nome, e-mail ou matrícula e páginas de 25 itens nas listas grandes.
- **RF / RB:** RF-43. **Dependências:** SPEC-010, SPEC-013, SPEC-022, SPEC-033. **OPEN:** OPEN-056.

### SPEC-035 — Secretaria acadêmica no perfil Administrador

- **Objetivo:** o administrador vira a secretaria (estudantes, pedidos de senha, virada, instituição e documentos), sem os dados de trabalho acadêmico.
- **RF / RB:** RF-29; RB-01, RB-13. **Dependências:** SPEC-010, SPEC-016, SPEC-019, SPEC-020, SPEC-027, SPEC-030 a SPEC-034. **OPEN:** OPEN-057.

### SPEC-036 — Requerimentos online

- **Objetivo:** pedidos do estudante com protocolo, prazo de 5 dias úteis e resposta do professor ou da secretaria.
- **RF / RB:** RF-44; RB-34. **Dependências:** SPEC-019, SPEC-022, SPEC-031, SPEC-033, SPEC-035, SPEC-040. **OPEN:** OPEN-058.

### SPEC-037 — Matriz curricular e integralização

- **Objetivo:** semestre, obrigatória/optativa e pré-requisitos na grade; "Meu curso" com a integralização.
- **RF / RB:** RF-45; RB-35, RB-41. **Dependências:** SPEC-015, SPEC-019, SPEC-020, SPEC-029, SPEC-033. **OPEN:** OPEN-059.

### SPEC-038 — Rematrícula pelo estudante

- **Objetivo:** matrícula pelo próprio estudante na janela, com vagas, pré-requisitos e sem choque de horário.
- **RF / RB:** RF-46; RB-36. **Dependências:** SPEC-017, SPEC-026, SPEC-031, SPEC-037, SPEC-041. **OPEN:** OPEN-060.

### SPEC-039 — Diário de classe

- **Objetivo:** conteúdo das aulas, fechamento pelo professor e homologação pela coordenação, com a turma travada.
- **RF / RB:** RF-47; RB-37. **Dependências:** SPEC-017, SPEC-018, SPEC-019, SPEC-022, SPEC-028, SPEC-029. **OPEN:** OPEN-061.

### SPEC-040 — Calendário acadêmico

- **Objetivo:** eventos do período, calendário do mês para todos e chamada bloqueada em feriado.
- **RF / RB:** RF-48; RB-38. **Dependências:** SPEC-017, SPEC-018, SPEC-019, SPEC-028. **OPEN:** OPEN-062.

### SPEC-041 — Grade horária e salas

- **Objetivo:** salas, horários das turmas sem choque e grade da semana.
- **RF / RB:** RF-49; RB-39. **Dependências:** SPEC-015, SPEC-017, SPEC-019, SPEC-026. **OPEN:** OPEN-063.

### SPEC-042 — Aproveitamento de estudos e conclusão de curso

- **Objetivo:** aproveitamento na integralização e conclusão só com 100%, no histórico final.
- **RF / RB:** RF-50, RF-51; RB-35, RB-40. **Dependências:** SPEC-020, SPEC-031, SPEC-033, SPEC-035, SPEC-037. **OPEN:** OPEN-064.

### SPEC-043 — Exportação de apoio ao Censo

- **Objetivo:** CSV de apoio com estudantes e turmas do período (não é o layout oficial do INEP).
- **RF / RB:** RF-52. **Dependências:** SPEC-020, SPEC-031, SPEC-033, SPEC-035. **OPEN:** OPEN-065.

## Questões em aberto transversais

- **OPEN-001:** definir permissões exatas para cada operação de cadastro e registro.
- **OPEN-002:** definir faixa válida das notas, fórmula da média, pesos e dados incompletos.
- **OPEN-003:** definir ator, contrato e momento do registro de Entrega e da conclusão de atividade.
- **OPEN-004:** definir canal, persistência, deduplicação e momento de exibição dos alertas.
- **OPEN-005:** especificar o UC-05, formatos, filtros, granularidade e escopos dos relatórios.
- **OPEN-006:** decidir entre sessão e JWT, conforme a alternativa registrada em DA-01.
- **OPEN-007:** decidir se metas, prioridades e tarefas genéricas da visão do produto pertencem à
	baseline atual ou a uma evolução futura; elas não foram incluídas nas Specs acadêmicas acima.

## Critério para iniciar as Specs individuais

O mapa deve ser aprovado pela equipe humana antes da geração do conteúdo completo de qualquer
SPEC-XXX. A implementação não deve começar a partir deste índice isoladamente; conflitos entre
baseline, Spec aprovada e código devem ser registrados para decisão humana.
