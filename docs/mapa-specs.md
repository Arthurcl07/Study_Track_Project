# Mapa ordenado de Specs — StudyTrack

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
