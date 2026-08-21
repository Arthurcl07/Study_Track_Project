# StudyTrack — Requisitos Funcionais (Formato de Regras)

## Regra RF-01 — Autenticação
- Quando um usuário informar suas credenciais, o sistema deve validar os dados informados.
- Quando as credenciais forem válidas, o sistema deve permitir o acesso ao usuário.
- Quando as credenciais forem inválidas, o sistema deve negar o acesso e informar o usuário.

## Regra RF-02 — Controle de acesso
- Quando um usuário acessar o sistema, o sistema deve disponibilizar apenas as funcionalidades autorizadas ao perfil do usuário.
- Quando o usuário tentar acessar uma funcionalidade sem permissão, o sistema deve bloquear o acesso.

## Regra RF-03 — Cadastro de estudantes
- Quando um usuário autorizado cadastrar um estudante, o sistema deve armazenar os dados do estudante.
- Quando o cadastro for concluído, o sistema deve vincular o estudante à turma correspondente.
- Quando houver dados obrigatórios ausentes, o sistema deve impedir o cadastro.

## Regra RF-04 — Cadastro de disciplinas e turmas
- Quando um usuário autorizado cadastrar uma disciplina ou turma, o sistema deve armazenar as informações relevantes.
- Quando a disciplina ou turma for cadastrada, o sistema deve permitir a associação com professores, estudantes e demais vínculos necessários.

## Regra RF-05 — Registro de notas
- Quando um professor registrar uma nota, o sistema deve associar a nota ao estudante, à disciplina e à avaliação correspondente.
- Quando a nota for inválida, o sistema deve rejeitar o registro.

## Regra RF-06 — Cálculo de média
- Quando uma nota for registrada ou alterada, o sistema deve recalcular a média do estudante na disciplina correspondente.
- Quando a média for recalculada, o sistema deve atualizar o valor armazenado.

## Regra RF-07 — Registro de frequência
- Quando um professor registrar a frequência, o sistema deve atualizar o percentual de frequência do estudante.
- Quando a frequência for alterada, o sistema deve refletir a nova situação no histórico acadêmico.

## Regra RF-08 — Cadastro de atividades
- Quando um professor cadastrar uma atividade, o sistema deve registrar sua descrição, prazo e disciplina vinculada.
- Quando os dados da atividade forem incompletos, o sistema deve impedir o cadastro.

## Regra RF-09 — Controle de atividades atrasadas
- Quando o prazo de uma atividade for ultrapassado sem registro de entrega, o sistema deve classificar a atividade como atrasada.
- Quando a atividade estiver atrasada, o sistema deve indicar essa condição para o aluno e para o professor.

## Regra RF-10 — Dashboard do estudante
- Quando um estudante acessar seu dashboard, o sistema deve apresentar notas, médias, frequência, atividades, evolução e situação acadêmica.
- Quando houver alterações acadêmicas, o sistema deve atualizar automaticamente os dados exibidos.

## Regra RF-11 — Indicador acadêmico
- Quando os dados acadêmicos de um estudante forem atualizados, o sistema deve recalcular seu indicador de situação acadêmica.
- Quando o indicador for recalculado, o sistema deve atualizar a classificação do estudante.

## Regra RF-12 — Alertas
- Quando o indicador acadêmico atingir situação de atenção ou risco, o sistema deve apresentar alerta ao estudante e ao professor responsável.
- Quando houver alerta, o sistema deve destacar a condição para acompanhamento imediato.

## Regra RF-13 — Dashboard do professor
- Quando um professor acessar uma turma, o sistema deve apresentar indicadores de desempenho dos estudantes.
- Quando os dados da turma forem atualizados, o sistema deve refletir essas alterações no dashboard.

## Regra RF-14 — Plano de recuperação
- Quando um professor selecionar um estudante em situação de risco, o sistema deve permitir a criação de um plano de recuperação.
- Quando o plano for criado, o sistema deve associá-lo ao estudante e ao professor responsável.

## Regra RF-15 — Relatórios
- Quando um professor ou coordenador solicitar um relatório, o sistema deve apresentar informações consolidadas de desempenho, frequência e situação acadêmica.
- Quando o relatório for gerado, o sistema deve permitir a visualização dos dados conforme a autorização do usuário.

---

## Resumo das regras
- O sistema deve validar autenticação e autorizar o acesso por perfil.
- O sistema deve registrar e relacionar estudantes, turmas, disciplinas, notas, frequência e atividades.
- O sistema deve calcular indicadores acadêmicos e gerar alertas.
- O sistema deve apoiar acompanhamento escolar individual e por turma.
- O sistema deve disponibilizar relatórios e planos de recuperação quando necessário.
