# StudyTrack — Requisitos Não Funcionais (Formato de Regras)

## Regra RNF-01 — Desempenho
- Quando um usuário acessar as principais páginas do sistema, o sistema deve carregá-las em até 3 segundos em condições normais de utilização.
- Quando houver uso normal, o sistema deve manter tempo de resposta aceitável para navegação e consulta.

## Regra RNF-02 — Segurança
- Quando um usuário cadastrar ou alterar uma senha, o sistema deve armazená-la utilizando hash seguro.
- Quando a senha for persistida, o sistema não deve armazená-la em texto puro.

## Regra RNF-03 — Controle de acesso
- Quando um usuário tentar acessar uma funcionalidade ou dado, o sistema deve verificar se o perfil do usuário possui autorização.
- Quando a autorização não existir, o sistema deve bloquear o acesso e exibir mensagem de negação.

## Regra RNF-04 — Usabilidade
- Quando o sistema for acessado em computadores, tablets ou smartphones, a interface deve adaptar-se ao dispositivo.
- Quando a interface for utilizada em diferentes tamanhos de tela, o sistema deve manter navegação e leitura adequadas.

## Regra RNF-05 — Privacidade
- Quando um estudante possuir dados acadêmicos, o sistema deve restringir o acesso apenas aos usuários autorizados.
- Quando um usuário sem autorização tentar visualizar informações acadêmicas, o sistema deve bloquear a operação.

---

## Resumo das regras
- O sistema deve ter boa performance e resposta rápida.
- O sistema deve garantir segurança na persistência de senhas.
- O sistema deve controlar acesso por perfil e limitar dados sensíveis.
- O sistema deve oferecer uma interface responsiva e preservar a privacidade dos dados acadêmicos.
