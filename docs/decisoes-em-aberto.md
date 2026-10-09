# Decisões em aberto — StudyTrack

Registro humano das questões levantadas durante a modelagem, o mapa de Specs e a escrita das Specs. Nenhuma decisão aqui deve ser tomada silenciosamente pelo agente.

| ID | Questão | Origem | Status |
|---|---|---|---|
| OPEN-001 | Permissões exatas para cada operação de cadastro/registro (quem cadastra estudante, disciplina, turma, avaliação, atividade e registra frequência) | mapa-specs.md | fechada (2026-10-09; decisão delegada pelo grupo ao agente, aprovada por Arthur) — Coordenador cadastra disciplinas, turmas e estudantes e faz matrículas, só nas turmas sob sua responsabilidade (quem cria a turma passa a ser o coordenador responsável); Professor registra avaliações, notas, frequência e atividades só nas turmas que leciona (RF-05, RF-07, RF-08); contas de Professor e Coordenador continuam criadas por seed (não há RF de cadastro desses perfis) |
| OPEN-002 | Faixa válida de nota, fórmula da média, pesos e tratamento de dados incompletos | mapa-specs.md | fechada (2026-10-09; decisão delegada pelo grupo ao agente, aprovada por Arthur) — nota de 0 a 10; peso de avaliação maior que zero; média = média ponderada pelos pesos das avaliações da turma que já têm nota do estudante (avaliação ainda sem nota não entra); a classificação usa o valor exato, sem arredondar; sem nenhuma nota a média fica vazia e só a frequência classifica; sem registro de frequência só a média classifica; sem nota e sem frequência a situação é Normal; frequência de 0 a 100% |
| OPEN-003 | Ator, contrato e momento do registro de Entrega e da conclusão de atividade | mapa-specs.md | aberta |
| OPEN-004 | Canal, persistência, deduplicação e momento de exibição dos alertas | mapa-specs.md | aberta |
| OPEN-005 | Detalhar o UC-05 (relatórios): formato, filtros, granularidade | mapa-specs.md | parcial — UC-05 criado; formato e filtros ainda em aberto |
| OPEN-006 | Sessão de servidor vs JWT para autenticação | mapa-specs.md / SPEC-001 | fechada — decidido JWT em ADR-004 |
| OPEN-007 | Metas/prioridades/tarefas da visão do produto pertencem à baseline? | mapa-specs.md | fechada — visão reescrita para o escopo acadêmico |
| OPEN-008 | Framework de testes automatizados | estrategia-testes.md | fechada — Vitest (TypeScript sem configuração extra, serve para unitário e integração) |
| OPEN-009 | Dados obrigatórios do cadastro de estudante, disciplina e turma (campos, credencial inicial do estudante) | SPEC-002 | fechada (2026-10-09; decisão delegada pelo grupo ao agente, aprovada por Arthur) — Estudante: nome, e-mail (único), senha inicial com no mínimo 8 caracteres informada pelo coordenador e a turma de vínculo; e-mail já cadastrado é recusado; troca de senha fica fora do escopo (sem RF). Disciplina: nome e carga horária (inteiro maior que zero). Turma: nome, período, disciplina e professor responsável (usuário com perfil Professor) |
| OPEN-010 | Momento da marcação de entrega como Atrasada (rotina agendada vs derivada na leitura) | SPEC-005 | aberta |
| OPEN-011 | Definição de "evolução" e "histórico acadêmico" (RF-07, RF-10): o modelo guarda só frequência e indicador vigentes | SPEC-007 | aberta |
| OPEN-012 | Destino do plano de recuperação quando o estudante deixa de estar em Risco | SPEC-008 | aberta |
| OPEN-013 | Quem cria contas e com qual perfil na SPEC-001 (risco de autocadastro como Coordenador) | SPEC-001 | fechada — sem cadastro público; contas de teste por script de seed; cadastro por perfil autorizado na SPEC-002 (ver OPEN-001) |
| OPEN-014 | A SPEC-001 exige "cadastro ativo" como pré-condição do login, mas `Usuario` em `modelo-dominio.md` não tem atributo de ativo/inativo | SPEC-001 (implementação) | aberta — provisório (decisão humana, 2026-10-09): sem campo novo; todo usuário existente é tratado como ativo |
| OPEN-015 | Duração da sessão (expiração do JWT e do cookie) não definida na baseline | SPEC-001 (implementação) | aberta — provisório (decisão humana, 2026-10-09): 8 horas |
