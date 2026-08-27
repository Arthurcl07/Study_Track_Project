# StudyTrack — Regras de Negócio (Formato de Regras)

## Regra RB-01 — Perfis de usuário
- Quando o sistema for inicializado, ele deve disponibilizar os perfis de usuário: Estudante, Professor e Coordenador.
- Quando um usuário for cadastrado, o sistema deve atribuir um perfil válido a ele.

## Regra RB-02 — Acesso do estudante
- Quando um estudante acessar o sistema, ele deve visualizar apenas seus próprios dados acadêmicos.
- Quando um estudante tentar acessar dados de outro estudante, o sistema deve bloquear a visualização.

## Regra RB-03 — Acesso do professor
- Quando um professor acessar o sistema, ele deve visualizar os dados acadêmicos dos estudantes vinculados às suas turmas.
- Quando um professor tentar acessar dados fora de suas turmas, o sistema deve negar o acesso.

## Regra RB-04 — Acesso do coordenador
- Quando um coordenador acessar o sistema, ele deve visualizar os indicadores das turmas sob sua responsabilidade.
- Quando a turma não estiver sob sua responsabilidade, o sistema deve impedir o acesso aos indicadores.

## Regra RB-05 — Frequência mínima
- Quando a frequência de um estudante for inferior a 75%, o sistema deve considerar essa situação como risco.
- Quando a frequência for igual ou superior a 75%, o sistema não deve classificar automaticamente como risco por frequência.

## Regra RB-06 — Média de atenção
- Quando a média de um estudante for inferior a 7,0, o sistema deve considerar essa situação como atenção.
- Quando a média for igual ou superior a 7,0, o sistema não deve sinalizar atenção por média.

## Regra RB-07 — Baixo desempenho
- Quando a média de um estudante for inferior a 5,0, o sistema deve considerar essa situação como risco.
- Quando a média for igual ou superior a 5,0, o sistema não deve classificar automaticamente como risco por desempenho.

## Regra RB-08 — Atividade atrasada
- Quando o prazo de uma atividade for encerrado sem registro de entrega, o sistema deve considerar a atividade como atrasada.
- Quando houver entrega registrada dentro do prazo, a atividade não deve ser classificada como atrasada.

## Regra RB-09 — Classificação acadêmica
- Quando o sistema avaliar o desempenho acadêmico, ele deve classificar a situação em: Normal, Atenção ou Risco.
- Quando a classificação for definida, o sistema deve armazenar o status para exibição em dashboards e relatórios.

## Regra RB-10 — Atualização do indicador
- Quando ocorrer alteração em nota, frequência ou atividade relevante, o sistema deve atualizar o indicador acadêmico do estudante.
- Quando o indicador for atualizado, o sistema deve refletir a nova situação em alertas e relatórios.

## Regra RB-11 — Plano de recuperação
- Quando um estudante for classificado como risco, ele pode ter um plano de recuperação.
- Quando um professor responsável criar o plano, o sistema deve associá-lo ao estudante correspondente.

## Regra RB-12 — Progresso do plano
- Quando um plano de recuperação for criado, o sistema deve calcular seu progresso com base na quantidade de atividades concluídas.
- Quando houver mudanças nas atividades concluídas, o sistema deve recalcular o progresso do plano.

---

## Resumo das regras
- O sistema deve operar com base em perfis e autorizações distintas.
- O sistema deve aplicar critérios acadêmicos para classificação de risco e atenção.
- O sistema deve controlar acesso aos dados conforme a responsabilidade do usuário.
- O sistema deve acompanhar desempenho, frequência e prazos para gerar alertas e planos de recuperação.
