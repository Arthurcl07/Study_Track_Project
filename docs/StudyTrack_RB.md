# StudyTrack — Regras de Negócio

RB-01 — Perfis de usuário. O sistema opera com três perfis: Estudante, Professor e Coordenador. Todo usuário cadastrado possui exatamente um perfil. *Aplicada por RF-02, RF-03.*

RB-02 — Acesso do estudante. Um estudante visualiza apenas os próprios dados acadêmicos. *Aplicada por RF-02, RNF-05.*

RB-03 — Acesso do professor. Um professor visualiza os dados acadêmicos apenas dos estudantes vinculados às turmas que leciona. *Aplicada por RF-02, RF-13.*

RB-04 — Acesso do coordenador. Um coordenador visualiza os indicadores apenas das turmas sob sua responsabilidade. *Aplicada por RF-02, RF-15.*

RB-05 — Frequência mínima. Frequência inferior a 75% caracteriza risco acadêmico, independentemente da média. *Aplicada por RF-11.*

RB-06 — Média de atenção. Média inferior a 7,0 caracteriza situação de Atenção. *Aplicada por RF-11.*

RB-07 — Baixo desempenho. Média inferior a 5,0 caracteriza situação de Risco. *Aplicada por RF-11.*

RB-08 — Atividade atrasada. Uma atividade sem entrega registrada até o fim do prazo é considerada atrasada. *Aplicada por RF-09.*

RB-09 — Classificação acadêmica. A situação do estudante é sempre uma entre: Normal, Atenção ou Risco. Frequência < 75% ou média < 5,0 → Risco; média entre 5,0 e 6,9 (com frequência OK) → Atenção; caso contrário → Normal. *Aplicada por RF-11, RF-12.*

RB-10 — Atualização do indicador. Toda alteração em nota, frequência ou atividade relevante recalcula o indicador acadêmico do estudante correspondente. *Aplicada por RF-06, RF-07, RF-11.*

RB-11 — Plano de recuperação. Somente um estudante em Risco pode ter um plano de recuperação; o plano é sempre associado a um professor responsável. *Aplicada por RF-14.*

RB-12 — Progresso do plano. O progresso de um plano de recuperação é a proporção de atividades do plano concluídas em relação ao total previsto. *Aplicada por RF-14.*

---

## Resumo das regras
- O sistema deve operar com base em perfis e autorizações distintas.
- O sistema deve aplicar critérios acadêmicos para classificação de risco e atenção.
- O sistema deve controlar acesso aos dados conforme a responsabilidade do usuário.
- O sistema deve acompanhar desempenho, frequência e prazos para gerar alertas e planos de recuperação.
