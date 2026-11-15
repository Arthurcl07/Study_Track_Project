# Verificação de desempenho — SPEC-054 (RNF-01)

**Data:** 2026-11-14
**Comando:** `npm run build`, `npm run start` e `npm run carga` (`scripts/carga.ts`, sem dependência nova)
**Ambiente:** notebook de desenvolvimento (Windows 11), PostgreSQL 17 local, build de produção do Next.js 16
**Dados:** faculdade povoada pelo seed — 6 cursos, 360 estudantes, 84 turmas em 2026/2 (cerca de 30 estudantes cada),
2.514 matrículas com indicador no período aberto, histórico desde 2025/1 (252 turmas), chamada até a data de hoje.
**Carga:** 20 requisições por tela, 5 simultâneas, depois de uma requisição de aquecimento; cada perfil entra com a
própria conta (a coordenação mede com a Paula Martins, para não gastar o primeiro acesso da Marina).

## Resultado (AC-054-01): todas as telas com P95 abaixo de 3 s

| Perfil | Tela | P50 | P95 | Máximo |
|---|---|---:|---:|---:|
| Estudante | `/estudante` | 153 ms | 228 ms | 228 ms |
| Estudante | `/estudante/curso` | 93 ms | 118 ms | 120 ms |
| Estudante | `/estudante/documentos` | 127 ms | 132 ms | 139 ms |
| Estudante | `/requerimentos` | 57 ms | 60 ms | 61 ms |
| Estudante | `/api/painel` | 46 ms | 283 ms | 289 ms |
| Professor | `/professor` | 155 ms | 167 ms | 168 ms |
| Professor | `/professor/notas` | 80 ms | 104 ms | 105 ms |
| Professor | `/professor/frequencia` | 208 ms | 243 ms | 249 ms |
| Professor | `/relatorios` | 241 ms | 262 ms | 263 ms |
| Coordenador | `/coordenador` | 466 ms | 498 ms | 502 ms |
| Coordenador | `/relatorios` | 538 ms | 660 ms | 662 ms |
| Coordenador | `/evasao` | 173 ms | 197 ms | 197 ms |
| Coordenador | `/coordenador/acompanhamento` | 78 ms | 90 ms | 90 ms |
| Coordenador | `/api/relatorios/excel` (.xlsx) | 200 ms | 227 ms | 232 ms |
| Administrador | `/admin` | 59 ms | 70 ms | 71 ms |
| Administrador | `/admin/estudantes` | 61 ms | 72 ms | 72 ms |
| Administrador | `/evasao` (todos os cursos) | 792 ms | 818 ms | 823 ms |
| Administrador | `/admin/saude` | 869 ms | 879 ms | 880 ms |
| Administrador | `/requerimentos` | 57 ms | 65 ms | 66 ms |

A tela mais lenta ficou abaixo de 0,9 s, um terço do limite de 3 s do RNF-01.

## Ajustes feitos com a medição

- **Evasão da faculdade inteira** (secretaria): a consulta das presenças tinha um filtro redundante (estudante com
  alguma matrícula) que forçava uma junção a mais. Sem ele, o cálculo caiu de cerca de 0,8 s para 0,35 s
  (medido direto na função `painelDeEvasao`, `src/server/academico/evasao.ts`).
- **Só as aulas que importam:** a evasão lê apenas as 3 últimas datas de cada turma e as dos últimos 14 dias, e a
  última presença só dos candidatos; o acompanhamento lê só a última aula de cada turma.
- **Índices:** as consultas pesadas usam os índices que já existiam (`Turma(periodo)`, `Turma(cursoId)`,
  `Matricula(turmaId)`, `IndicadorAcademico(turmaId)`, `Presenca(estudanteId)` e a chave única
  `Aula(turmaId, data, numero)`); as tabelas novas nasceram com os índices das suas consultas
  (`RegistroErro(registradoEm)`, `HistoricoAnterior(estudanteId)` e as chaves únicas de `AceiteTermos` e
  `TentativaLogin`).
- **Saúde do sistema** mede de propósito, a cada abertura, quatro consultas reais (inclusive a evasão de todos os
  cursos); por isso é a página mais lenta, e mesmo assim abaixo de 0,9 s.

## Como repetir

```bash
npm run build
```

```bash
npm run start
```

```bash
npm run carga
```

Para outra URL ou mais requisições: `npm run carga -- http://localhost:3000 50`. Uma tela com P95 de 3 s ou mais sai
em vermelho e o comando termina com código 1 (AC-054-02).
