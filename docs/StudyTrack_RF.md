# StudyTrack — Requisitos Funcionais (EARS)

## RF-01 — Autenticação
- WHEN o usuário submete e-mail e senha, o sistema SHALL validar as credenciais e, se corretas, iniciar a sessão.
- IF as credenciais forem inválidas, THEN o sistema SHALL negar o acesso e exibir mensagem de erro.

## RF-02 — Controle de acesso
- O sistema SHALL disponibilizar, para cada usuário autenticado, apenas as funcionalidades autorizadas ao seu perfil.
- IF um usuário tentar acessar uma funcionalidade sem permissão para seu perfil, THEN o sistema SHALL bloquear o acesso.

## RF-03 — Cadastro de estudantes
- WHEN um usuário autorizado cadastra um estudante com todos os dados obrigatórios, o sistema SHALL armazenar o cadastro e vincular o estudante à turma correspondente.
- IF houver dado obrigatório ausente, THEN o sistema SHALL impedir o cadastro e indicar o campo pendente.

## RF-04 — Cadastro de disciplinas e turmas
- WHEN um usuário autorizado cadastra uma disciplina ou turma, o sistema SHALL armazenar as informações e permitir a associação com professores e estudantes.

## RF-05 — Registro de notas
- WHEN um professor registra uma nota de um estudante em uma avaliação, o sistema SHALL associar a nota ao estudante, à disciplina e à avaliação correspondente.
- IF o valor da nota informado for inválido, THEN o sistema SHALL rejeitar o registro.

## RF-06 — Cálculo de média
- WHEN uma nota é registrada ou alterada, o sistema SHALL recalcular e atualizar a média do estudante na disciplina correspondente.

## RF-07 — Registro de frequência
- WHEN um professor registra ou altera a frequência de um estudante, o sistema SHALL atualizar o percentual de frequência e refletir a mudança no histórico acadêmico.

## RF-08 — Cadastro de atividades
- WHEN um professor cadastra uma atividade com descrição, prazo e disciplina vinculada, o sistema SHALL registrar a atividade.
- IF os dados da atividade estiverem incompletos, THEN o sistema SHALL impedir o cadastro.

## RF-09 — Controle de atividades atrasadas
- IF o prazo de uma atividade se encerrar sem registro de entrega do estudante, THEN o sistema SHALL classificar a atividade como atrasada para esse estudante e indicar a condição a ele e ao professor.

## RF-10 — Dashboard do estudante
- WHEN um estudante acessa seu dashboard, o sistema SHALL apresentar notas, médias, frequência, atividades, evolução e situação acadêmica atualizadas.

## RF-11 — Indicador acadêmico
- WHEN os dados acadêmicos de um estudante (nota, frequência ou atividade) são atualizados, o sistema SHALL recalcular o indicador de situação acadêmica e atualizar sua classificação.

## RF-12 — Alertas
- IF o indicador acadêmico de um estudante atingir situação de Atenção ou Risco, THEN o sistema SHALL apresentar um alerta ao estudante e ao professor responsável.

## RF-13 — Dashboard do professor
- WHEN um professor acessa uma turma, o sistema SHALL apresentar os indicadores de desempenho dos estudantes daquela turma, atualizados conforme os dados mais recentes.

## RF-14 — Plano de recuperação
- WHEN um professor seleciona um estudante em situação de Risco e cria um plano de recuperação, o sistema SHALL associar o plano ao estudante e ao professor responsável.

## RF-15 — Relatórios
- WHEN um professor ou coordenador solicita um relatório, o sistema SHALL gerar informações consolidadas de desempenho, frequência e situação acadêmica, respeitando a autorização do solicitante.

## RF-16 — Gestão de contas (incluído em 2026-10-17, OPEN-025)
- WHEN um administrador cadastra uma conta com nome, e-mail, senha inicial e perfil, o sistema SHALL criar a conta com exatamente esse perfil.
- WHEN um administrador consulta as contas, o sistema SHALL listar nome, e-mail, perfil e se a conta está ativa, com filtro por perfil.
- WHEN um administrador desativa uma conta, o sistema SHALL impedir novos acessos e encerrar o acesso em andamento dessa conta, sem apagar seus dados.
- IF houver dado obrigatório ausente ou e-mail já cadastrado, THEN o sistema SHALL impedir o cadastro e indicar o campo.

## RF-17 — Troca do professor da turma (incluído em 2026-10-17, OPEN-025)
- WHEN o coordenador responsável pela turma escolhe outro professor ativo para ela, o sistema SHALL tornar esse professor o responsável pela turma e pelos planos de recuperação ativos da turma.
- IF o usuário escolhido não tiver perfil Professor ou estiver desativado, THEN o sistema SHALL impedir a troca.

## RF-18 — Senha própria (incluído em 2026-10-19, OPEN-026)
- WHEN um usuário com conta criada pela tela entra pela primeira vez, o sistema SHALL exigir que ele defina uma senha nova antes de usar qualquer outra função.
- WHEN um usuário autenticado informa a senha atual e uma senha nova válida, o sistema SHALL substituir a senha.
- IF a senha atual estiver errada, a nova tiver menos de 8 caracteres, for igual à atual ou não coincidir com a confirmação, THEN o sistema SHALL impedir a troca e indicar o campo.

## RF-19 — Plano de recuperação visível ao estudante (incluído em 2026-10-19, OPEN-027)
- WHEN um estudante acessa o seu painel, o sistema SHALL mostrar os próprios planos de recuperação (ativo e encerrados), com os itens, quais estão concluídos e o progresso, sem permitir alteração.

## RF-20 — Histórico de notas (incluído em 2026-10-19, OPEN-028)
- WHEN uma nota é lançada ou alterada, o sistema SHALL registrar quem fez, quando, o valor anterior (se houver) e o valor novo.
- WHEN um coordenador ou professor consulta o histórico de notas, o sistema SHALL mostrar apenas os registros das turmas do seu escopo.

## RF-21 — Painel do coordenador (incluído em 2026-10-19, OPEN-029)
- WHEN um coordenador acessa o seu painel, o sistema SHALL apresentar, para as turmas sob sua responsabilidade, a distribuição das situações, a média e a frequência média de cada turma e as turmas com mais estudantes em Risco e mais entregas atrasadas.

## RF-22 — Cursos (incluído em 2026-10-22, OPEN-030, OPEN-034)
- WHEN um administrador cadastra um curso com nome e coordenador, o sistema SHALL criar o curso com esse coordenador.
- WHEN um administrador escolhe outro coordenador para um curso, o sistema SHALL tornar esse usuário o coordenador do curso.
- IF o nome estiver ausente, já existir curso com o mesmo nome, ou o usuário escolhido não tiver perfil Coordenador ou estiver desativado, THEN o sistema SHALL impedir a operação e indicar o campo.

## RF-23 — Grade do curso (incluído em 2026-10-22, OPEN-031, OPEN-033)
- WHEN um coordenador cadastra uma disciplina em um curso que coordena, o sistema SHALL criar a disciplina na grade desse curso.
- WHEN um coordenador adiciona uma disciplina já existente à grade de um curso que coordena, o sistema SHALL incluir a disciplina na grade sem duplicá-la.
- WHEN um coordenador cadastra uma turma, o sistema SHALL vinculá-la a exatamente 1 curso que ele coordena e a uma disciplina da grade desse curso.

## RF-24 — Dashboard inicial por perfil (incluído em 2026-10-22, OPEN-035)
- WHEN um usuário autenticado entra no sistema, o sistema SHALL abrir o dashboard do seu perfil, com os principais indicadores e gráficos do seu escopo, e manter as demais funções no menu lateral.

## RF-25 — Dashboard do administrador (incluído em 2026-10-22, OPEN-034)
- WHEN um administrador acessa o seu dashboard, o sistema SHALL apresentar as contas por perfil, ativas e desativadas, as contas aguardando a troca da senha provisória, as contas criadas recentemente e, por curso, o coordenador e o número de disciplinas, turmas e estudantes, sem nenhum dado acadêmico.

---


## Resumo das regras
- O sistema deve validar autenticação e autorizar o acesso por perfil.
- O sistema deve registrar e relacionar estudantes, turmas, disciplinas, notas, frequência e atividades.
- O sistema deve calcular indicadores acadêmicos e gerar alertas.
- O sistema deve apoiar acompanhamento escolar individual e por turma.
- O sistema deve disponibilizar relatórios e planos de recuperação quando necessário.

Convenção de obrigação: **SHALL** = obrigatório (reprova a aceitação) · **SHOULD** = recomendado · **MAY** = opcional.
