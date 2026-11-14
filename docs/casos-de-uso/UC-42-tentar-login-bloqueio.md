# UC-42 — Ser Bloqueado por Tentativas Erradas

- **Ator**: Visitante
- **Objetivo**: proteger a conta de quem tenta adivinhar a senha
- **Pré-condições**: nenhuma
- **Spec**: SPEC-046 · **Requisitos**: RF-55

**Fluxo principal**
1. Visitante erra a senha; o sistema avisa quantas tentativas restam.
2. Na 5ª errada, o sistema bloqueia o e-mail por 15 minutos e informa o horário de liberação.
3. Depois do prazo, o login volta a funcionar; o acerto zera a contagem.

**Fluxos alternativos**: —.
**Exceções**: login durante o bloqueio, mesmo com a senha certa.
**Regras aplicadas**: RB-22, RB-44.
