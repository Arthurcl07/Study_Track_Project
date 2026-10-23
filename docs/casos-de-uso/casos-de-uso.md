# Casos de Uso — StudyTrack

## Diagrama (atores x casos de uso)

```mermaid
flowchart LR
    Estudante((Estudante))
    Professor((Professor))
    Coordenador((Coordenador))

    Estudante --> UC1[UC-01 Autenticar-se]
    Professor --> UC1
    Coordenador --> UC1

    Estudante --> UC2[UC-02 Consultar Situação Acadêmica]
    Professor --> UC3[UC-03 Registrar Nota]
    Professor --> UC4[UC-04 Criar Plano de Recuperação]
    Professor --> UC5[UC-05 Consultar Relatórios]
    Coordenador --> UC5
    Coordenador --> UC6[UC-06 Cadastrar Estudante]
    Coordenador --> UC7[UC-07 Cadastrar Disciplina e Turma]
    Professor --> UC8[UC-08 Registrar Frequência]
    Professor --> UC9[UC-09 Cadastrar Atividade e Registrar Entrega]
    Professor --> UC10[UC-10 Consultar Dashboard da Turma]
    Administrador((Administrador)) --> UC11[UC-11 Gerenciar Contas]
    Estudante --> UC12[UC-12 Definir ou Alterar Senha]
    Professor --> UC12
    Coordenador --> UC12
    Administrador --> UC12
    Professor --> UC13[UC-13 Consultar Histórico de Notas]
    Coordenador --> UC13
    Administrador --> UC1
    Administrador --> UC14[UC-14 Gerenciar Cursos]
    Coordenador --> UC15[UC-15 Montar a Grade do Curso]
    Estudante --> UC16[UC-16 Consultar o Dashboard Inicial]
    Professor --> UC16
    Coordenador --> UC16
    Administrador --> UC16

    UC3 -.include.-> REC[Recalcular Indicador Acadêmico]
    UC8 -.include.-> REC
    REC -.include.-> ALE[Emitir Alerta de Atenção/Risco]
    UC10 -.extend.-> UC4
```

Os casos de uso completos estão em arquivos individuais nesta pasta: `UC-01-autenticar.md`, `UC-02-consultar-situacao-academica.md`, `UC-03-registrar-nota.md`, `UC-04-criar-plano-recuperacao.md`, `UC-05-consultar-relatorios.md`, `UC-06-cadastrar-estudante.md`, `UC-07-cadastrar-disciplina-turma.md`, `UC-08-registrar-frequencia.md`, `UC-09-cadastrar-atividade-registrar-entrega.md` `UC-10-consultar-dashboard-turma.md`, `UC-11-gerenciar-contas.md`, `UC-12-definir-alterar-senha.md`, `UC-13-consultar-historico-notas.md`, `UC-14-gerenciar-cursos.md`, `UC-15-montar-grade-curso.md` e `UC-16-consultar-dashboard.md`.

Todo RF tem caso de uso (ver `docs/rastreabilidade.md`). Diagramas de sequência dos UC-03 e UC-04 em `docs/uml/sequencias.md`.
