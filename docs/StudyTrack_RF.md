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

---

## Resumo das regras
- O sistema deve validar autenticação e autorizar o acesso por perfil.
- O sistema deve registrar e relacionar estudantes, turmas, disciplinas, notas, frequência e atividades.
- O sistema deve calcular indicadores acadêmicos e gerar alertas.
- O sistema deve apoiar acompanhamento escolar individual e por turma.
- O sistema deve disponibilizar relatórios e planos de recuperação quando necessário.

Convenção de obrigação: **SHALL** = obrigatório (reprova a aceitação) · **SHOULD** = recomendado · **MAY** = opcional.
