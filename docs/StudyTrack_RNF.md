# StudyTrack — Requisitos Não Funcionais (EARS)

## RNF-01 — Desempenho
- O sistema SHALL carregar as páginas principais em até 3 segundos, em condições normais de utilização (P95).

## RNF-02 — Segurança
- O sistema SHALL armazenar toda senha de usuário utilizando hash seguro, nunca em texto puro.

## RNF-03 — Controle de acesso
- O sistema SHALL verificar a autorização do perfil do usuário antes de conceder acesso a qualquer funcionalidade ou dado.
- IF a autorização não existir, THEN o sistema SHALL bloquear o acesso e exibir mensagem de negação.

## RNF-04 — Usabilidade
- O sistema SHALL adaptar a interface a diferentes tamanhos de tela (computador, tablet, smartphone), mantendo navegação e leitura adequadas.

## RNF-05 — Privacidade
- O sistema SHALL restringir o acesso aos dados acadêmicos de um estudante apenas a usuários autorizados.
- IF um usuário sem autorização tentar visualizar dados acadêmicos de terceiros, THEN o sistema SHALL bloquear a operação.

## RNF-06 — Identidade visual e consistência da interface
- O sistema SHALL aplicar o logotipo, a paleta e os componentes definidos em `identidade-visual.md` em todas as telas, para os três perfis.
- O sistema SHALL oferecer, após o login, uma navegação única e consistente (menu do perfil, identificação do usuário e ação de sair) em todas as telas autenticadas.
- O sistema SHALL representar a situação acadêmica sempre com as mesmas cores e rótulos (Normal, Atenção, Risco), sem depender só da cor para transmitir a informação.

---


## Resumo das regras
- O sistema deve ter boa performance e resposta rápida.
- O sistema deve garantir segurança na persistência de senhas.
- O sistema deve controlar acesso por perfil e limitar dados sensíveis.
- O sistema deve oferecer uma interface responsiva e preservar a privacidade dos dados acadêmicos.
- O sistema deve ter identidade visual própria e navegação consistente em todas as telas.
