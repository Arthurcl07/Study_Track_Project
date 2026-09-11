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
    Coordenador --> UC5[UC-05 Consultar Relatórios]

    UC3 -.include.-> UC6[Recalcular Indicador Acadêmico]
    UC6 -.include.-> UC7[Emitir Alerta de Atenção/Risco]
```

Os casos de uso completos estão em arquivos individuais nesta pasta: `UC-01-autenticar.md`, `UC-02-consultar-situacao-academica.md`, `UC-03-registrar-nota.md`, `UC-04-criar-plano-recuperacao.md`.
