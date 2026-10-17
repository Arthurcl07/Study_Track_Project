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

    UC3 -.include.-> REC[Recalcular Indicador Acadêmico]
    UC8 -.include.-> REC
    REC -.include.-> ALE[Emitir Alerta de Atenção/Risco]
    UC10 -.extend.-> UC4
```

Os casos de uso completos estão em arquivos individuais nesta pasta: `UC-01-autenticar.md`, `UC-02-consultar-situacao-academica.md`, `UC-03-registrar-nota.md`, `UC-04-criar-plano-recuperacao.md`, `UC-05-consultar-relatorios.md`, `UC-06-cadastrar-estudante.md`, `UC-07-cadastrar-disciplina-turma.md`, `UC-08-registrar-frequencia.md`, `UC-09-cadastrar-atividade-registrar-entrega.md` e `UC-10-consultar-dashboard-turma.md`.

Todo RF tem caso de uso (ver `docs/rastreabilidade.md`). Diagramas de sequência dos UC-03 e UC-04 em `docs/uml/sequencias.md`.
