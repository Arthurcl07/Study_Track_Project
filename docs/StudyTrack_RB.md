# StudyTrack — Regras de Negócio

# Regras de Negócio — StudyTrack

RB-01 — Perfis de usuário
Descrição: O sistema opera com três perfis: Estudante, Professor e Coordenador. Todo usuário cadastrado possui exatamente um perfil.
Cláusula EARS: O sistema SHALL atribuir a cada usuário cadastrado exatamente um perfil dentre: Estudante, Professor ou Coordenador.
Aplicada por: RF-02, RF-03.

RB-02 — Acesso do estudante
Descrição: Um estudante visualiza apenas os próprios dados acadêmicos.
Cláusula EARS: WHEN um estudante solicitar a visualização de dados acadêmicos, o sistema SHALL exibir apenas os dados do próprio estudante.
Aplicada por: RF-02, RNF-05.

RB-03 — Acesso do professor
Descrição: Um professor visualiza os dados acadêmicos apenas dos estudantes vinculados às turmas que leciona.
Cláusula EARS: WHEN um professor solicitar a visualização de dados acadêmicos, o sistema SHALL exibir apenas os dados dos estudantes vinculados às turmas que ele leciona.
Aplicada por: RF-02, RF-13.

RB-04 — Acesso do coordenador
Descrição: Um coordenador visualiza os indicadores apenas das turmas sob sua responsabilidade.
Cláusula EARS: WHEN um coordenador solicitar a visualização de indicadores acadêmicos, o sistema SHALL exibir apenas os indicadores das turmas sob sua responsabilidade.
Aplicada por: RF-02, RF-15.

RB-05 — Frequência mínima
Descrição: Frequência inferior a 75% caracteriza risco acadêmico, independentemente da média.
Cláusula EARS: IF a frequência do estudante em uma turma for inferior a 75%, THEN o sistema SHALL classificar a situação do estudante nessa turma como Risco, independentemente da média.
Aplicada por: RF-11.

RB-06 — Média de atenção
Descrição: Média inferior a 7,0 caracteriza situação de Atenção. [AJUSTAR: ver nota de inconsistência abaixo]
Cláusula EARS: IF a média do estudante em uma turma for inferior a 7,0 e a frequência for igual ou superior a 75%, THEN o sistema SHALL classificar a situação do estudante nessa turma como Atenção.
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
Descrição: A situação do estudante é sempre uma entre: Normal, Atenção ou Risco. Frequência < 75% ou média < 5,0 → Risco; média entre 5,0 e 6,9 (com frequência OK) → Atenção; caso contrário → Normal.
Cláusula EARS:
  IF a frequência do estudante for inferior a 75% ou a média for inferior a 5,0, THEN o sistema SHALL classificar a situação do estudante como Risco.
  IF a média do estudante estiver entre 5,0 e 6,9 e a frequência for igual ou superior a 75%, THEN o sistema SHALL classificar a situação do estudante como Atenção.
  IF nenhuma das condições anteriores for satisfeita, THEN o sistema SHALL classificar a situação do estudante como Normal.
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


## Resumo das regras

- O sistema deve operar com base em perfis e autorizações distintas.
- O sistema deve aplicar critérios acadêmicos para classificação de risco e atenção.
- O sistema deve controlar acesso aos dados conforme a responsabilidade do usuário.
- O sistema deve acompanhar desempenho, frequência e prazos para gerar alertas e planos de recuperação.
