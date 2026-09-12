# Modelo de Domínio — StudyTrack

## Classes e responsabilidades

- **Usuario** — id, nome, email, senhaHash, perfil {Estudante, Professor, Coordenador}. Representa qualquer pessoa que acessa o sistema; o atributo `perfil` define o papel (um usuário, não classes separadas).
- **Turma** — id, nome, período.
- **Disciplina** — id, nome, cargaHoraria.
- **Avaliacao** — id, nome/tipo, peso, data.
- **Nota** — id, valor, dataRegistro.
- **Frequencia** — id, percentual, atualizadaEm.
- **Atividade** — id, descrição, prazo.
- **Entrega** — id, dataEntrega, status {NoPrazo, Atrasada, Pendente}.
- **IndicadorAcademico** — id, media, frequenciaAtual, situacao {Normal, Atenção, Risco}, atualizadoEm.
- **PlanoRecuperacao** — id, progresso, criadoEm.

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
- Um Estudante em Risco pode ter de 0 a N Planos de Recuperação (RB-11); cada Plano é responsabilidade de exatamente 1 Professor e contém de 1 a N Atividades previstas (RB-12).
- Um Usuario (Coordenador) é responsável por 0 a N Turmas; cada Turma pode ter, opcionalmente, 1 Coordenador responsável.

## Diagrama de classes (versionável — GitHub renderiza Mermaid nativamente)

​```mermaid
classDiagram
    class Usuario {
      +id
      +nome
      +email
      +senhaHash
      +perfil
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
      +progresso
      +criadoEm
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
    PlanoRecuperacao "1" --> "1..*" Atividade : preve
    Usuario "1" --> "0..*" Turma : responsavel (Coordenador)
​```
