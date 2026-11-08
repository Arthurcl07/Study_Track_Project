# StudyTrack — Regras de Negócio

# Regras de Negócio — StudyTrack

RB-01 — Perfis de usuário
Descrição: O sistema opera com quatro perfis: Estudante, Professor, Coordenador e Administrador (Administrador incluído em 2026-10-17, OPEN-025; desde 2026-11-06 o Administrador é também a secretaria acadêmica, OPEN-057, sem perfil novo). Todo usuário cadastrado possui exatamente um perfil.
Cláusula EARS: O sistema SHALL atribuir a cada usuário cadastrado exatamente um perfil dentre: Estudante, Professor, Coordenador ou Administrador.
Aplicada por: RF-02, RF-03, RF-16.

RB-02 — Acesso do estudante
Descrição: Um estudante visualiza apenas os próprios dados acadêmicos.
Cláusula EARS: WHEN um estudante solicitar a visualização de dados acadêmicos, o sistema SHALL exibir apenas os dados do próprio estudante.
Aplicada por: RF-02, RNF-05.

RB-03 — Acesso do professor
Descrição: Um professor visualiza os dados acadêmicos apenas dos estudantes vinculados às turmas que leciona.
Cláusula EARS: WHEN um professor solicitar a visualização de dados acadêmicos, o sistema SHALL exibir apenas os dados dos estudantes vinculados às turmas que ele leciona.
Aplicada por: RF-02, RF-13.

RB-04 — Acesso do coordenador
Descrição: Um coordenador visualiza os indicadores apenas das turmas sob sua responsabilidade, que são as turmas dos cursos que ele coordena (desde 2026-10-22, OPEN-030).
Cláusula EARS: WHEN um coordenador solicitar a visualização de indicadores acadêmicos, o sistema SHALL exibir apenas os indicadores das turmas dos cursos que ele coordena.
Aplicada por: RF-02, RF-15, RF-21, RF-24.

RB-05 — Frequência mínima
Descrição: Frequência inferior a 75% caracteriza risco acadêmico, independentemente da média.
Cláusula EARS: IF a frequência do estudante em uma turma for inferior a 75%, THEN o sistema SHALL classificar a situação do estudante nessa turma como Risco, independentemente da média.
Aplicada por: RF-11.

RB-06 — Média de atenção
Descrição: Média inferior a 6,0 (e igual ou superior a 5,0) caracteriza situação de Atenção, desde que a frequência esteja igual ou superior a 75%.
Cláusula EARS: IF a média do estudante em uma turma for igual ou superior a 5,0 e inferior a 6,0, e a frequência for igual ou superior a 75%, THEN o sistema SHALL classificar a situação do estudante nessa turma como Atenção.
Aplicada por: RF-11.

RB-07 — Baixo desempenho
Descrição: Média inferior a 5,0 caracteriza situação de Risco.
Cláusula EARS: IF a média do estudante em uma turma for inferior a 5,0, THEN o sistema SHALL classificar a situação do estudante nessa turma como Risco.
Aplicada por: RF-11.

RB-08 — Atividade atrasada
Descrição: Uma atividade sem entrega registrada até o fim do prazo é considerada atrasada.
Cláusula EARS: IF uma atividade não tiver entrega registrada até o fim do prazo, THEN o sistema SHALL marcar a entrega correspondente com status Atrasada.
Aplicada por: RF-09.

RB-09 — Classificação acadêmica
Descrição: A situação do estudante é sempre uma entre: Normal, Atenção ou Risco. Frequência < 75% ou média < 5,0 → Risco; média entre 5,0 e 5,9 (com frequência OK) → Atenção; média igual ou superior a 6,0 (com frequência OK) → Normal.
Cláusula EARS:
  IF a frequência do estudante for inferior a 75% ou a média for inferior a 5,0, THEN o sistema SHALL classificar a situação do estudante como Risco.
  IF a média do estudante estiver entre 5,0 e 5,9 e a frequência for igual ou superior a 75%, THEN o sistema SHALL classificar a situação do estudante como Atenção.
  IF a média do estudante for igual ou superior a 6,0 e a frequência for igual ou superior a 75%, THEN o sistema SHALL classificar a situação do estudante como Normal.
Aplicada por: RF-11, RF-12.

RB-10 — Atualização do indicador
Descrição: Toda alteração em nota, frequência ou atividade relevante recalcula o indicador acadêmico do estudante correspondente.
Cláusula EARS: WHEN houver alteração em nota, frequência ou atividade relevante de um estudante, o sistema SHALL recalcular o indicador acadêmico correspondente.
Aplicada por: RF-06, RF-07, RF-11.

RB-11 — Plano de recuperação
Descrição: Somente um estudante em Risco pode ter um plano de recuperação; o plano é sempre associado a um professor responsável.
Cláusula EARS:
  IF um estudante não estiver classificado como Risco, THEN o sistema SHALL impedir a criação de um plano de recuperação para esse estudante.
  WHEN um plano de recuperação for criado, o sistema SHALL associá-lo a exatamente um professor responsável.
Aplicada por: RF-14.

RB-12 — Progresso do plano
Descrição: O progresso de um plano de recuperação é a proporção de atividades do plano concluídas em relação ao total previsto.
Cláusula EARS: O sistema SHALL calcular o progresso de um plano de recuperação como a proporção de atividades concluídas em relação ao total de atividades previstas no plano.
Aplicada por: RF-14.

RB-13 — Acesso do administrador (secretaria acadêmica)
Descrição: O administrador gerencia contas, cursos e períodos e, como secretaria acadêmica (OPEN-057, 2026-11-06), cuida dos pedidos de senha, da ficha e da situação do estudante no curso, do abono de faltas, da virada de semestre, dos dados da instituição e da emissão de boletim e histórico. Ele vê notas e frequência só nos documentos e no abono; não lança nem altera dado acadêmico e não vê dashboards acadêmicos, relatórios, alertas, planos nem o histórico de notas (privilégio mínimo, RNF-05).
Cláusula EARS:
  WHEN um administrador solicitar dashboards acadêmicos, relatórios, alertas, indicadores, planos ou o histórico de notas, o sistema SHALL negar o acesso.
  IF um administrador tentar registrar ou alterar avaliação, nota, chamada, atividade, entrega ou plano, THEN o sistema SHALL negar a operação.
  WHEN um administrador emitir o boletim ou o histórico de um estudante, o sistema SHALL apresentar o documento completo.
Aplicada por: RF-02, RF-16, RF-22, RF-25, RF-29, RF-36, RF-38, RF-39, RF-40, RF-41, RF-42.

RB-14 — Conta desativada
Descrição: Conta desativada não acessa o sistema, mas seus dados continuam guardados e a conta pode ser reativada.
Cláusula EARS:
  IF uma conta estiver desativada, THEN o sistema SHALL recusar o login e as requisições feitas com uma sessão dessa conta.
  IF o administrador tentar desativar a própria conta, THEN o sistema SHALL impedir a desativação.
  IF o professor responsável por ao menos uma turma de período letivo aberto for desativado, THEN o sistema SHALL impedir a desativação ("de período aberto" incluído em 2026-11-05, OPEN-040).
  IF o coordenador de ao menos um curso for desativado, THEN o sistema SHALL impedir a desativação (incluído em 2026-10-22, OPEN-030).
Aplicada por: RF-01, RF-16, RF-22.

RB-15 — Senha inicial provisória
Descrição: A senha definida por outra pessoa ao criar a conta é provisória; o dono da conta define a própria senha no primeiro acesso.
Cláusula EARS:
  IF a conta tiver sido criada pela tela por um administrador ou coordenador, ou tiver a senha redefinida por pedido aprovado (RB-27, 2026-11-06), e o dono ainda não tiver definido a própria senha, THEN o sistema SHALL negar todas as funções, exceto definir a nova senha e sair.
  WHEN o usuário definir a nova senha, o sistema SHALL exigir no mínimo 8 caracteres e que ela seja diferente da senha atual.
Aplicada por: RF-18, RF-36.

RB-16 — Histórico de notas imutável
Descrição: Todo lançamento e toda alteração de nota ficam registrados e o registro não pode ser editado nem apagado pelos usuários.
Cláusula EARS:
  WHEN uma nota for lançada ou alterada, o sistema SHALL gravar, na mesma operação, um registro com autor, data e hora, valor anterior e valor novo.
  O sistema SHALL NOT oferecer alteração nem exclusão de registros do histórico.
Aplicada por: RF-20.

RB-17 — Coordenação de curso
Descrição: Cada curso tem exatamente um coordenador; um coordenador pode coordenar vários cursos (OPEN-030).
Cláusula EARS:
  O sistema SHALL manter cada curso com exatamente um coordenador, usuário com perfil Coordenador e conta ativa.
  IF o usuário escolhido como coordenador não tiver perfil Coordenador ou estiver desativado, THEN o sistema SHALL impedir a operação.
Aplicada por: RF-22.

RB-18 — Turma de um curso
Descrição: Uma disciplina pode fazer parte da grade de vários cursos, mas cada turma pertence a exatamente um curso, e a disciplina da turma está na grade desse curso (OPEN-031).
Cláusula EARS:
  WHEN uma turma for cadastrada, o sistema SHALL vinculá-la a exatamente um curso.
  IF a disciplina escolhida não fizer parte da grade do curso da turma, THEN o sistema SHALL impedir o cadastro.
Aplicada por: RF-04, RF-23.

RB-19 — Estudante de um curso
Descrição: Todo estudante pertence a exatamente um curso e só é matriculado em turmas desse curso (OPEN-032). Desde 2026-11-06 (OPEN-053), o administrador pode trocar o curso de um estudante ativo sem matrícula cursando em período aberto; o histórico anterior continua.
Cláusula EARS:
  WHEN uma conta de estudante for criada, o sistema SHALL vinculá-la a exatamente um curso.
  IF o curso da turma for diferente do curso do estudante, THEN o sistema SHALL impedir a matrícula.
  IF o estudante tiver matrícula cursando em turma de período aberto, THEN o sistema SHALL impedir a troca de curso.
Aplicada por: RF-03, RF-16, RF-39.

RB-20 — Período encerrado
Descrição: Turma de período letivo encerrado é somente leitura (OPEN-040).
Cláusula EARS:
  IF a turma pertencer a um período letivo encerrado, THEN o sistema SHALL impedir avaliação, nota, chamada, atividade, entrega, plano de recuperação, matrícula, importação, troca de professor, edição e exclusão de cadastros e abono de faltas nessa turma (os dois últimos incluídos em 2026-11-06, OPEN-048, OPEN-054).
  WHEN um período letivo for reaberto, o sistema SHALL voltar a permitir essas operações.
Aplicada por: RF-26.

RB-21 — Frequência pela chamada
Descrição: A frequência do estudante na turma é o percentual de presenças nas aulas em que ele constou da chamada (OPEN-041). Uma data pode ter de 1 a 4 aulas, cada uma com a própria presença (OPEN-050), e a falta abonada conta como presença (RB-31, OPEN-054).
Cláusula EARS:
  WHEN a chamada de uma aula for registrada, corrigida ou excluída, ou um abono for registrado ou excluído, o sistema SHALL calcular a frequência de cada estudante afetado como (presenças + faltas abonadas) ÷ aulas em que ele constou × 100 e recalcular o indicador acadêmico na mesma transação.
  IF o estudante ainda não constar de nenhuma aula, THEN o sistema SHALL tratar a frequência como não registrada.
  IF a data já tiver 4 aulas na turma, THEN o sistema SHALL impedir o registro de outra aula nessa data.
Aplicada por: RF-07, RF-27, RF-40.

RB-22 — Registro de auditoria
Descrição: Toda escrita gera um registro de auditoria, gravado na mesma transação; o registro nunca é alterado nem apagado e só é visto no escopo de cada perfil (OPEN-039).
Cláusula EARS:
  WHEN uma operação de escrita for concluída, o sistema SHALL gravar o autor, a data e hora, a ação, a descrição e os valores anteriores e novos.
  IF a operação falhar, THEN o sistema SHALL NOT gravar o registro.
  O sistema SHALL NOT oferecer alteração nem exclusão de registros de auditoria.
Aplicada por: RF-28.

RB-23 — Notificação do destinatário
Descrição: Cada notificação pertence a um único usuário, que é o único que a vê e a marca como lida; administrador e coordenador não recebem notificações (OPEN-043).
Cláusula EARS:
  WHEN um usuário consultar notificações, o sistema SHALL apresentar apenas as notificações das quais ele é o destinatário.
  O sistema SHALL gravar no máximo uma notificação de prazo por estudante e atividade.
Aplicada por: RF-31.

RB-24 — Resultado da turma
Descrição: No histórico e no boletim, o resultado de uma turma de período encerrado é Aprovado com média igual ou superior a 6,0 e frequência igual ou superior a 75%; caso contrário, Reprovado, com o motivo (OPEN-044). Desde 2026-11-06, com nota de exame final vale a nota final (RB-29), e matrícula trancada ou cancelada mostra esse resultado (OPEN-051, OPEN-053).
Cláusula EARS:
  IF o período da turma estiver encerrado e a média for igual ou superior a 6,0 e a frequência for igual ou superior a 75%, THEN o sistema SHALL apresentar o resultado Aprovado.
  IF o período estiver encerrado, houver nota de exame final, a nota final for igual ou superior a 5,0 e a frequência igual ou superior a 75%, THEN o sistema SHALL apresentar Aprovado no exame.
  IF o período estiver encerrado e a média (ou a nota final, com exame) estiver abaixo do mínimo ou a frequência for inferior a 75%, THEN o sistema SHALL apresentar Reprovado por nota, por frequência ou por nota e frequência.
  IF o período estiver encerrado e faltar média ou frequência, THEN o sistema SHALL apresentar Sem registro; IF o período estiver aberto, THEN Em curso.
  IF a matrícula estiver trancada ou cancelada, THEN o sistema SHALL apresentar Trancada ou Cancelada, em qualquer período.
Aplicada por: RF-29, RF-37, RF-39.

RB-25 — Nota necessária
Descrição: A nota necessária é a nota igual nas avaliações ainda sem nota que, com os pesos, leva a média ponderada à meta (6,0 ou 5,0); a simulação nunca é gravada (OPEN-045). Substitutiva e exame final não entram na simulação (OPEN-051).
Cláusula EARS:
  WHEN o simulador for consultado, o sistema SHALL calcular a nota necessária como (meta × soma de todos os pesos − soma de peso × nota das avaliações com nota) ÷ soma dos pesos das avaliações sem nota, arredondada para cima com uma casa.
  IF a nota necessária for menor ou igual a zero, THEN o sistema SHALL indicar meta já garantida; IF for maior que 10, THEN SHALL indicar meta não alcançável; IF não houver avaliação sem nota, THEN SHALL indicar que não há avaliação restante.
  IF a frequência for inferior a 75%, THEN o sistema SHALL avisar que a situação continua Risco independentemente da nota (RB-05).
Aplicada por: RF-32.

RB-26 — Alcance do comunicado
Descrição: Um comunicado alcança uma turma ou todas as turmas de período aberto de um curso; só quem está nesse alcance o vê, e só o autor o apaga (OPEN-047).
Cláusula EARS:
  WHEN um estudante ou professor consultar o mural, o sistema SHALL apresentar apenas os comunicados das turmas em que estuda ou leciona e dos cursos dessas turmas.
  IF o autor não for professor da turma nem coordenador do curso do alcance, ou a turma for de período encerrado, THEN o sistema SHALL impedir a publicação.
  IF quem pede a exclusão não for o autor, THEN o sistema SHALL impedir a exclusão.
Aplicada por: RF-34.

RB-27 — Pedido de redefinição de senha
Descrição: A senha esquecida só é redefinida por pedido aprovado pelo administrador, que recebe uma senha provisória aleatória para entregar à pessoa (OPEN-049).
Cláusula EARS:
  WHEN alguém pedir a redefinição informando um e-mail, o sistema SHALL responder com a mesma mensagem, exista ou não uma conta ativa com esse e-mail.
  IF a conta já tiver um pedido pendente, THEN o sistema SHALL NOT gravar outro.
  WHEN o administrador aprovar o pedido, o sistema SHALL gravar uma senha provisória aleatória, marcar a conta para definir senha nova (RB-15) e mostrar a senha uma única vez.
  IF o pedido for da própria conta do administrador, THEN o sistema SHALL impedir que ele o aprove.
  O sistema SHALL NOT gravar a senha provisória na auditoria nem no pedido.
Aplicada por: RF-36.

RB-28 — Prova substitutiva
Descrição: A nota da substitutiva troca a menor nota entre as provas da turma (prova sem nota conta como zero), quando isso aumenta a média; ela não tem peso próprio (OPEN-051).
Cláusula EARS:
  WHEN o estudante tiver nota na substitutiva, o sistema SHALL calcular a média trocando a nota da prova de menor valor (zero, se sem nota) pela nota da substitutiva, com o peso dessa prova, IF o resultado for maior que a média sem a troca.
  IF a turma já tiver uma substitutiva, THEN o sistema SHALL impedir o cadastro de outra.
Aplicada por: RF-37.

RB-29 — Exame final
Descrição: Faz exame final o estudante com média menor que 6,0 e frequência de pelo menos 75%; a nota final é (média + exame) ÷ 2, e a aprovação no exame exige nota final de 5,0 ou mais. O exame não muda a situação Normal/Atenção/Risco (OPEN-051).
Cláusula EARS:
  IF o estudante tiver média igual ou superior a 6,0, sem média ou com frequência inferior a 75%, THEN o sistema SHALL impedir o lançamento da nota de exame dele.
  WHEN a nota de exame for lançada, o sistema SHALL calcular a nota final como (média + exame) ÷ 2.
  IF a turma já tiver um exame final, THEN o sistema SHALL impedir o cadastro de outro.
Aplicada por: RF-37.

RB-30 — Situação do estudante no curso
Descrição: O estudante está Ativo, Trancado, Transferido, Cancelado ou Concluído no curso; só o administrador muda a situação, e só estudante ativo é matriculado (OPEN-053).
Cláusula EARS:
  IF a situação do estudante no curso não for Ativo, THEN o sistema SHALL impedir novas matrículas e importações dele.
  WHEN o estudante for trancado, o sistema SHALL marcar como Trancadas as matrículas dele em turmas de período aberto; WHEN for transferido ou cancelado, SHALL marcá-las como Canceladas.
  IF a matrícula estiver trancada ou cancelada, THEN o sistema SHALL tirá-la da chamada, do lançamento de notas, das entregas, dos planos, dos dashboards, dos alertas e dos relatórios, mantendo-a no boletim e no histórico.
Aplicada por: RF-39.

RB-31 — Abono de faltas
Descrição: Falta numa aula dentro do intervalo de um abono registrado pela secretaria conta como presença (OPEN-054).
Cláusula EARS:
  WHEN um abono for registrado ou excluído, o sistema SHALL recalcular a frequência e o indicador do estudante em cada turma de período aberto com aula no intervalo, na mesma transação (RB-21).
  IF a data final for anterior à inicial ou o intervalo passar de 180 dias, THEN o sistema SHALL recusar o abono.
Aplicada por: RF-40.

RB-32 — Exclusão sem registro dependente
Descrição: Só se exclui o cadastro criado por engano que ainda não tem registro dependente; nada que já tenha nota, presença, entrega ou plano é apagado (OPEN-048).
Cláusula EARS:
  IF a disciplina tiver turma, a turma tiver matrícula, a avaliação tiver nota, a atividade tiver entrega, ou o estudante tiver nota, presença, entrega ou plano na turma, THEN o sistema SHALL impedir a exclusão e informar o motivo.
  WHEN uma aula for excluída, o sistema SHALL excluir as presenças dela e recalcular a frequência e o indicador na mesma transação.
Aplicada por: RF-35.

RB-33 — Ficha do estudante
Descrição: Os dados pessoais da ficha (CPF, data de nascimento, telefone e responsável) são vistos só pelo administrador, pelo coordenador do curso e pelo próprio estudante; o número de matrícula é único e não muda (OPEN-055).
Cláusula EARS:
  WHEN um estudante for cadastrado por qualquer meio, o sistema SHALL atribuir a ele o próximo número de matrícula do ano (ano + sequência de 4 dígitos).
  IF o CPF for inválido ou já pertencer a outro estudante, THEN o sistema SHALL recusar a ficha e indicar o campo.
  IF quem consulta for professor, THEN o sistema SHALL apresentar apenas o nome e o número de matrícula.
Aplicada por: RF-41.


## Resumo das regras

- O sistema deve operar com base em perfis e autorizações distintas.
- O sistema deve aplicar critérios acadêmicos para classificação de risco e atenção.
- O sistema deve controlar acesso aos dados conforme a responsabilidade do usuário.
- O sistema deve organizar disciplinas, turmas e estudantes por curso, cada curso com um coordenador.
- O sistema deve acompanhar desempenho, frequência e prazos para gerar alertas e planos de recuperação.
- O sistema deve organizar as turmas por período letivo, travar os períodos encerrados e registrar quem fez cada alteração.
- O sistema deve apoiar a secretaria acadêmica (ficha, situação no curso, abono, documentos e senhas) sem abrir dados acadêmicos além do necessário.
