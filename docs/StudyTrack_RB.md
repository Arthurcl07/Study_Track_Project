# StudyTrack — Regras de Negócio

# Regras de Negócio — StudyTrack

RB-01 — Perfis de usuário
Descrição: O sistema opera com quatro perfis: Estudante, Professor, Coordenador e Administrador (Administrador incluído em 2026-10-17, OPEN-025). Todo usuário cadastrado possui exatamente um perfil.
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

RB-13 — Acesso do administrador
Descrição: O administrador gerencia contas e cursos (nome e coordenador, OPEN-034) e não acessa dados acadêmicos (privilégio mínimo, RNF-05). No dashboard ele vê apenas contagens de contas e da estrutura dos cursos.
Cláusula EARS: WHEN um administrador solicitar dados acadêmicos (notas, frequência, turmas, indicadores, planos ou relatórios), o sistema SHALL negar o acesso.
Aplicada por: RF-02, RF-16, RF-22, RF-25.

RB-14 — Conta desativada
Descrição: Conta desativada não acessa o sistema, mas seus dados continuam guardados e a conta pode ser reativada.
Cláusula EARS:
  IF uma conta estiver desativada, THEN o sistema SHALL recusar o login e as requisições feitas com uma sessão dessa conta.
  IF o administrador tentar desativar a própria conta, THEN o sistema SHALL impedir a desativação.
  IF o professor responsável por ao menos uma turma for desativado, THEN o sistema SHALL impedir a desativação.
  IF o coordenador de ao menos um curso for desativado, THEN o sistema SHALL impedir a desativação (incluído em 2026-10-22, OPEN-030).
Aplicada por: RF-01, RF-16, RF-22.

RB-15 — Senha inicial provisória
Descrição: A senha definida por outra pessoa ao criar a conta é provisória; o dono da conta define a própria senha no primeiro acesso.
Cláusula EARS:
  IF a conta tiver sido criada pela tela por um administrador ou coordenador e o dono ainda não tiver definido a própria senha, THEN o sistema SHALL negar todas as funções, exceto definir a nova senha e sair.
  WHEN o usuário definir a nova senha, o sistema SHALL exigir no mínimo 8 caracteres e que ela seja diferente da senha atual.
Aplicada por: RF-18.

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
Descrição: Todo estudante pertence a exatamente um curso e só é matriculado em turmas desse curso (OPEN-032).
Cláusula EARS:
  WHEN uma conta de estudante for criada, o sistema SHALL vinculá-la a exatamente um curso.
  IF o curso da turma for diferente do curso do estudante, THEN o sistema SHALL impedir a matrícula.
Aplicada por: RF-03, RF-16.


## Resumo das regras

- O sistema deve operar com base em perfis e autorizações distintas.
- O sistema deve aplicar critérios acadêmicos para classificação de risco e atenção.
- O sistema deve controlar acesso aos dados conforme a responsabilidade do usuário.
- O sistema deve organizar disciplinas, turmas e estudantes por curso, cada curso com um coordenador.
- O sistema deve acompanhar desempenho, frequência e prazos para gerar alertas e planos de recuperação.
