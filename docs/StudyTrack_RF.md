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
- Desde 2026-11-05 (OPEN-041), o percentual é calculado pela chamada de cada aula (RF-27, RB-21); o professor não digita mais o percentual.

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

## RF-26 — Período letivo (incluído em 2026-11-05, OPEN-040)
- WHEN um administrador cadastra um período letivo, o sistema SHALL criá-lo com status Aberto.
- WHEN um administrador encerra um período letivo, o sistema SHALL tornar somente leitura todas as turmas desse período, até que ele seja reaberto.
- WHEN um coordenador cadastra uma turma, o sistema SHALL vinculá-la a exatamente 1 período letivo aberto.

## RF-27 — Chamada por aula (incluído em 2026-11-05, OPEN-041; substitui o lançamento do percentual do RF-07; de 1 a 4 aulas na mesma data desde 2026-11-06, OPEN-050)
- WHEN um professor registra a chamada de uma ou mais aulas (até 4) de uma data numa turma que leciona, o sistema SHALL gravar a presença ou a falta de cada estudante matriculado e recalcular a frequência e o indicador acadêmico de cada um.
- WHEN um professor corrige a chamada de uma aula já registrada, o sistema SHALL substituir as presenças dessa aula e recalcular a frequência e o indicador.

## RF-28 — Auditoria (incluído em 2026-11-05, OPEN-039)
- WHEN qualquer usuário realiza uma operação de escrita, o sistema SHALL registrar quem fez, quando, o que foi feito e os valores anteriores e novos, na mesma transação da operação.
- WHEN um coordenador consulta a auditoria, o sistema SHALL apresentar só as ações acadêmicas dos cursos que ele coordena; WHEN um administrador consulta, só as ações de contas, cursos e períodos.

## RF-29 — Boletim e histórico escolar (incluído em 2026-11-05, OPEN-038, OPEN-044)
- WHEN um estudante, um coordenador ou o administrador (secretaria, desde 2026-11-06, OPEN-057) solicita o boletim de um período, o sistema SHALL apresentar um documento pronto para impressão e PDF com as turmas do estudante no período, as notas, a média, a frequência, a situação e o resultado.
- WHEN um estudante, um coordenador ou o administrador solicita o histórico escolar, o sistema SHALL apresentar o documento com todas as turmas do estudante, agrupadas por período, com carga horária, média, frequência e resultado.

## RF-30 — Importação de estudantes por planilha (incluído em 2026-11-05, OPEN-042)
- WHEN um coordenador envia uma planilha CSV de estudantes para uma turma de um curso que coordena, o sistema SHALL mostrar a prévia de cada linha, com o que será feito e os erros encontrados, sem gravar nada.
- WHEN o coordenador confirma uma importação sem erros, o sistema SHALL criar as contas novas com senha provisória e matricular todos os estudantes da planilha na turma, numa única transação.

## RF-31 — Notificações (incluído em 2026-11-05, OPEN-043)
- WHEN um estudante entra em situação de Risco, recebe uma nota, ganha um plano de recuperação ou tem uma atividade a até 2 dias do prazo sem entrega, o sistema SHALL gravar uma notificação para o estudante; WHEN um estudante entra em Risco, também para o professor da turma.
- WHEN o destinatário abre ou marca uma notificação como lida, o sistema SHALL registrar a leitura e atualizar o contador de não lidas.

## RF-32 — Simulador de notas (incluído em 2026-11-06, OPEN-045)
- WHEN um estudante ou o professor da turma consulta a turma, o sistema SHALL mostrar a nota que o estudante precisa tirar, igual em todas as avaliações ainda sem nota, para chegar à média 6,0 e à média 5,0.
- WHEN o estudante informa notas hipotéticas para as avaliações sem nota, o sistema SHALL mostrar a média e a situação simuladas sem gravar nada.

## RF-33 — Comparativo entre semestres (incluído em 2026-11-06, OPEN-046)
- WHEN um coordenador consulta o dashboard, o sistema SHALL comparar, por período letivo, a média, a frequência média, o percentual em Risco e, nos períodos encerrados, o percentual de aprovação dos cursos que coordena, no total e por disciplina.
- WHEN um estudante consulta os documentos, o sistema SHALL mostrar a média e a frequência de cada período em que cursou turmas.

## RF-34 — Mural de comunicados (incluído em 2026-11-06, OPEN-047)
- WHEN um professor publica um comunicado para uma turma que leciona, ou um coordenador para uma turma ou para todas as turmas de um curso que coordena, o sistema SHALL gravar o comunicado e notificar os estudantes alcançados (e os professores das turmas, quando o autor for o coordenador).
- WHEN o autor apaga o próprio comunicado, o sistema SHALL retirá-lo do mural e registrar a ação na auditoria.

## RF-35 — Correção de cadastros (incluído em 2026-11-06, OPEN-048)
- WHEN o administrador edita o nome ou o e-mail de uma conta, o coordenador edita uma disciplina ou turma dos cursos que coordena, ou o professor edita uma avaliação, atividade ou aula de uma turma que leciona, o sistema SHALL gravar a alteração, recalcular o que depender dela e registrá-la na auditoria.
- WHEN um desses usuários exclui um cadastro feito por engano que ainda não tem registro dependente, ou tira um estudante de uma turma, o sistema SHALL excluí-lo e registrar a exclusão na auditoria; IF houver registro dependente, THEN SHALL recusar e dizer o motivo.

## RF-36 — Redefinição de senha por pedido (incluído em 2026-11-06, OPEN-049)
- WHEN uma pessoa informa o e-mail em "Esqueci minha senha", o sistema SHALL registrar um pedido de redefinição para a conta ativa desse e-mail, se existir, e responder sempre com a mesma mensagem.
- WHEN o administrador aprova um pedido, o sistema SHALL gerar uma senha provisória aleatória, mostrá-la uma única vez ao administrador e exigir que a pessoa defina uma senha nova no primeiro acesso; WHEN recusa, SHALL encerrar o pedido sem mudar a senha.

## RF-37 — Prova substitutiva e exame final (incluído em 2026-11-06, OPEN-051)
- WHEN o professor cadastra uma avaliação, o sistema SHALL registrar o tipo: Prova, Trabalho, Substitutiva ou Exame final.
- WHEN o estudante tem nota na substitutiva, o sistema SHALL calcular a média trocando a menor nota entre as provas pela da substitutiva, se isso aumentar a média.
- WHEN o professor lança a nota do exame final de um estudante com média menor que 6,0 e frequência de pelo menos 75%, o sistema SHALL calcular a nota final e usá-la no resultado do boletim e do histórico.

## RF-38 — Virada de semestre (incluído em 2026-11-06, OPEN-052)
- WHEN o administrador escolhe as turmas de um período e um período de destino aberto, o sistema SHALL criar no destino uma cópia de cada turma (nome, disciplina, curso e professor) e, quando pedido, matricular nela os estudantes ativos da turma de origem, numa única transação.

## RF-39 — Situação do estudante no curso (incluído em 2026-11-06, OPEN-053)
- WHEN o administrador muda a situação de um estudante no curso para Trancado, Transferido, Cancelado, Concluído ou Ativo, o sistema SHALL gravar a situação com a data e o motivo e, ao trancar, transferir ou cancelar, encerrar as matrículas em turmas de período aberto.
- WHEN o administrador muda o curso de um estudante ativo sem matrícula em turma de período aberto, o sistema SHALL gravar o novo curso e manter o histórico anterior.

## RF-40 — Abono de faltas (incluído em 2026-11-06, OPEN-054)
- WHEN o administrador registra ou exclui um abono de faltas para um estudante num intervalo de datas, com o motivo, o sistema SHALL contar como presença as faltas do estudante nas aulas desse intervalo (ou deixar de contar, ao excluir) e recalcular a frequência e o indicador das turmas afetadas.

## RF-41 — Ficha do estudante (incluído em 2026-11-06, OPEN-055)
- WHEN um estudante é cadastrado, o sistema SHALL atribuir a ele um número de matrícula único.
- WHEN o administrador edita a ficha de um estudante (CPF, data de nascimento, telefone e responsável), o sistema SHALL validar e gravar os dados; o coordenador do curso e o próprio estudante SHALL poder consultá-la.

## RF-42 — Dados da instituição (incluído em 2026-11-06, OPEN-055)
- WHEN o administrador grava os dados da instituição (nome, CNPJ, endereço, contato, responsável pela secretaria e logotipo), o sistema SHALL usá-los no cabeçalho e na assinatura do boletim e do histórico.

## RF-43 — Busca e paginação (incluído em 2026-11-06, OPEN-056)
- WHEN um usuário consulta uma lista de contas, estudantes, histórico de notas ou notificações, o sistema SHALL apresentá-la em páginas de 25 itens e permitir buscar por nome, e-mail ou número de matrícula.

---


## Resumo das regras
- O sistema deve validar autenticação e autorizar o acesso por perfil.
- O sistema deve registrar e relacionar estudantes, turmas, disciplinas, notas, frequência e atividades.
- O sistema deve calcular indicadores acadêmicos e gerar alertas.
- O sistema deve apoiar acompanhamento escolar individual e por turma.
- O sistema deve disponibilizar relatórios e planos de recuperação quando necessário.

Convenção de obrigação: **SHALL** = obrigatório (reprova a aceitação) · **SHOULD** = recomendado · **MAY** = opcional.
