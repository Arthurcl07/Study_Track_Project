# Planilhas de exemplo (dados fictícios)

Usadas na demonstração das telas de importação. Os e-mails terminam em `@anterior.faculdade-exemplo.test`; o seed
(`npm run seed`, opção 3 do `Iniciar StudyTrack.bat`) apaga essas contas, então a importação pode ser repetida.

| Arquivo | Tela | O que mostra |
|---|---|---|
| `sistema-anterior-alunos.csv` + `sistema-anterior-historico.csv` | Administrador → Importar do sistema anterior (SPEC-058) | 6 alunos de Administração e Sistemas de Informação com 63 registros de histórico; prévia com aprovados e integralização, depois o histórico escolar com a seção "Cursado no sistema anterior" |
| `sistema-anterior-historico-com-erro.csv` | a mesma | uma disciplina fora da matriz ("Cálculo III"): a prévia aponta a linha e nada é gravado (tudo ou nada, RB-49) |
| `professores.csv` | Administrador → Contas → Importar professores (SPEC-053) | 5 professores com senha provisória mostrada uma vez |
