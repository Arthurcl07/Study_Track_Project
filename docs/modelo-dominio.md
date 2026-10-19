# Modelo de Domínio — StudyTrack


## Classes e responsabilidades

- **Usuario** — id, nome, email, senhaHash, perfil {Estudante, Professor, Coordenador, Administrador}, ativo. Representa qualquer pessoa que acessa o sistema; o atributo `perfil` define o papel (um usuário, não classes separadas). `ativo` (padrão: sim) é alterado só pelo Administrador (RB-14, OPEN-025); conta inativa não entra no sistema, mas seus dados permanecem. `trocarSenha` (padrão: não) marca conta criada pela tela que ainda não definiu a própria senha (RB-15, OPEN-026).
- **Turma** — id, nome, período.
- **Disciplina** — id, nome, cargaHoraria.
- **Avaliacao** — id, nome/tipo, peso, data.
- **Nota** — id, valor, dataRegistro.
- **Frequencia** — id, percentual, atualizadaEm.
- **Atividade** — id, descrição, prazo.
- **Entrega** — id, dataEntrega, status {NoPrazo, Atrasada, Pendente}. O status é **derivado** de prazo, data da entrega e data atual (OPEN-010); só a entrega registrada é persistida, e "Pendente"/"Atrasada" sem entrega não geram registro.
- **IndicadorAcademico** — id, media, frequenciaAtual, situacao {Normal, Atenção, Risco}, atualizadoEm.
- **PlanoRecuperacao** — id, status {Ativo, Encerrado}, criadoEm, encerradoEm. O progresso é **derivado** dos itens (RB-12), não gravado (OPEN-021).
- **ItemPlano** — id, descrição, concluído, concluídoEm. Item próprio do plano; o professor marca, o estudante só vê (OPEN-021, OPEN-027).
- **HistoricoNota** — id, valorAnterior (vazio no lançamento), valorNovo, registradoEm. Um registro por lançamento ou alteração de nota, com o autor; nunca editado nem apagado (RB-16, OPEN-028).


## Relacionamentos e multiplicidades

- Um Usuario (Professor) leciona de 0 a N Turmas; cada Turma pertence a exatamente 1 Professor responsável.
- Uma Disciplina possui de 0 a N Turmas; cada Turma pertence a exatamente 1 Disciplina.
- Um Usuario (Estudante) matricula-se em 0 a N Turmas; cada Turma possui de 0 a N Estudantes (N:M).
- Uma Turma possui de 0 a N Avaliações; cada Avaliação pertence a exatamente 1 Turma.
- Uma Avaliação recebe de 0 a N Notas; cada Nota pertence a exatamente 1 Avaliação e a exatamente 1 Estudante.
- Um Estudante possui, por Turma, exatamente 1 registro de Frequência vigente.
- Uma Turma possui de 0 a N Atividades; cada Atividade pertence a exatamente 1 Turma.
- Uma Atividade gera de 0 a N Entregas (uma por estudante); cada Entrega refere-se a exatamente 1 Atividade e 1 Estudante.
- Um Estudante possui, por Turma, exatamente 1 Indicador Acadêmico vigente (RB-09, RB-10).
- Um Estudante em Risco pode ter de 0 a N Planos de Recuperação (RB-11), no máximo 1 Ativo por Turma; cada Plano pertence a exatamente 1 Turma, é responsabilidade de exatamente 1 Professor (o da turma) e contém de 1 a N Itens previstos (RB-12, OPEN-021).
- Um Usuario (Coordenador) é responsável por 0 a N Turmas; cada Turma pode ter, opcionalmente, 1 Coordenador responsável.
- Uma Avaliação acumula de 0 a N registros de HistoricoNota; cada registro refere-se a exatamente 1 Avaliação, 1 Estudante e 1 Usuario autor (OPEN-028).


## Diagrama de classes (versionável — GitHub renderiza Mermaid nativamente)

```mermaid
classDiagram
    class Usuario {
      +id
      +nome
      +email
      +senhaHash
      +perfil
      +ativo
      +trocarSenha
    }
    class Turma {
      +id
      +nome
      +periodo
    }
    class Disciplina {
      +id
      +nome
      +cargaHoraria
    }
    class Avaliacao {
      +id
      +nome
      +peso
      +data
    }
    class Nota {
      +id
      +valor
      +dataRegistro
    }
    class Frequencia {
      +id
      +percentual
      +atualizadaEm
    }
    class Atividade {
      +id
      +descricao
      +prazo
    }
    class Entrega {
      +id
      +dataEntrega
      +status
    }
    class IndicadorAcademico {
      +id
      +media
      +frequenciaAtual
      +situacao
      +atualizadoEm
    }
    class PlanoRecuperacao {
      +id
      +status
      +criadoEm
      +encerradoEm
    }

    Usuario "1" --> "0..*" Turma : leciona (Professor)
    Disciplina "1" --> "0..*" Turma : possui
    Usuario "0..*" -- "0..*" Turma : matricula (Estudante)
    Turma "1" --> "0..*" Avaliacao
    Avaliacao "1" --> "0..*" Nota
    Usuario "1" --> "0..*" Nota : recebe (Estudante)
    Usuario "1" --> "0..*" Frequencia : possui (Estudante)
    Turma "1" --> "0..*" Frequencia
    Turma "1" --> "0..*" Atividade
    Atividade "1" --> "0..*" Entrega
    Usuario "1" --> "0..*" Entrega : realiza (Estudante)
    Usuario "1" --> "0..*" IndicadorAcademico : possui (Estudante)
    Turma "1" --> "0..*" IndicadorAcademico
    Usuario "1" --> "0..*" PlanoRecuperacao : acompanha (Estudante)
    Usuario "1" --> "0..*" PlanoRecuperacao : responsavel (Professor)
    class ItemPlano {
      +id
      +descricao
      +concluido
      +concluidoEm
    }
    PlanoRecuperacao "1" --> "1..*" ItemPlano : preve
    Turma "1" --> "0..*" PlanoRecuperacao
    Usuario "1" --> "0..*" Turma : responsavel (Coordenador)
```
