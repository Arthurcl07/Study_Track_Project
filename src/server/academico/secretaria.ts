// Casos de uso da secretaria acadêmica (SPEC-031 a SPEC-035, RF-39 a RF-43, UC-28 a UC-31). Quem pode: o
// Administrador (RB-13, recurso secretaria), conferido na rota; a lista e a ficha também para o Coordenador (cursos
// dele) e a ficha para o próprio Estudante (RB-33). Escopo dentro da query (ADR-003). Toda escrita com auditoria na
// mesma transação (RB-22).
import type { Prisma } from "@prisma/client";
import { hojeEmBrasilia } from "@/domain/atividades";
import { dataBR } from "@/domain/auditoria";
import {
  ROTULO_MOTIVO_ABONO,
  ROTULO_SITUACAO_CURSO,
  SITUACOES_CURSO,
  cpfMascarado,
  efeitoNasMatriculas,
  paginar,
  validarAbono,
  validarFicha,
  validarInstituicao,
  validarLogotipo,
  validarMudancaDeSituacao,
  type SituacaoCurso,
} from "@/domain/secretaria";
import type { Sessao } from "@/server/auth/token";
import { deData, paraData } from "@/server/dados/atividades";
import { auditar } from "@/server/dados/auditoria";
import { filtroDeBusca, idsQueBatem } from "@/server/dados/busca";
import { recalcularFrequencia } from "@/server/dados/chamada";
import type { ClienteBanco } from "@/server/dados/indicadores";
import { executarEmTransacao } from "@/server/dados/notas";
import { prisma } from "@/server/dados/prisma";
import type { Falha, Resultado } from "./cadastros";
import { motivoParaNaoConcluir } from "@/domain/matriz";
import { integralizacaoDoEstudante, listarAproveitamentos } from "./matriz";
import { recalcularIndicador } from "./indicador";

const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const falha = <T>(f: Falha): Resultado<T> => ({ ok: false, falha: f });
const naoEncontrado = falha<never>({ tipo: "nao-encontrado", erro: "Estudante não encontrado." });

// RB-33 / INV-033-03: quem vê qual estudante. Professor e outros perfis: ninguém.
function escopoDoEstudante(sessao: Sessao): Prisma.UsuarioWhereInput | null {
  if (sessao.perfil === "Administrador") return { perfil: "Estudante" };
  if (sessao.perfil === "Coordenador") return { perfil: "Estudante", curso: { coordenadorId: sessao.usuarioId } };
  if (sessao.perfil === "Estudante") return { id: sessao.usuarioId, perfil: "Estudante" };
  return null;
}

// ---------------------------------------------------------------- Lista de estudantes (SPEC-034)

export async function listarEstudantes(sessao: Sessao, filtros: { q?: unknown; pagina?: unknown; cursoId?: unknown; situacao?: unknown }) {
  const escopo = escopoDoEstudante(sessao);
  if (!escopo || sessao.perfil === "Estudante") return null;
  const ids = await idsQueBatem(filtros.q);
  const cursoId = typeof filtros.cursoId === "string" && filtros.cursoId ? filtros.cursoId : null;
  const situacao = (SITUACOES_CURSO as readonly unknown[]).includes(filtros.situacao) ? (filtros.situacao as SituacaoCurso) : null;
  const where: Prisma.UsuarioWhereInput = {
    AND: [escopo, filtroDeBusca(ids), cursoId ? { cursoId } : {}, situacao ? { ficha: { situacaoCurso: situacao } } : {}],
  };
  const total = await prisma.usuario.count({ where });
  const pagina = paginar(total, filtros.pagina);
  const estudantes = await prisma.usuario.findMany({
    where,
    select: { id: true, nome: true, email: true, ativo: true, curso: { select: { id: true, nome: true } }, ficha: { select: { numeroMatricula: true, situacaoCurso: true } } },
    orderBy: [{ nome: "asc" }, { id: "asc" }],
    skip: pagina.pular,
    take: pagina.porPagina,
  });
  const cursos = await prisma.curso.findMany({
    where: sessao.perfil === "Coordenador" ? { coordenadorId: sessao.usuarioId } : {},
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });
  return {
    pagina,
    cursos,
    estudantes: estudantes.map((e) => ({
      id: e.id,
      nome: e.nome,
      email: e.email,
      ativo: e.ativo,
      curso: e.curso?.nome ?? "—",
      numeroMatricula: e.ficha?.numeroMatricula ?? "—",
      situacaoCurso: (e.ficha?.situacaoCurso ?? "Ativo") as SituacaoCurso,
    })),
  };
}

// ---------------------------------------------------------------- Ficha (SPEC-033), situação (SPEC-031), abonos (SPEC-032)

export async function consultarFicha(sessao: Sessao, estudanteId: string) {
  const escopo = escopoDoEstudante(sessao);
  if (!escopo) return null;
  const estudante = await prisma.usuario.findFirst({
    where: { AND: [escopo, { id: estudanteId }] },
    select: { id: true, nome: true, email: true, ativo: true, curso: { select: { id: true, nome: true } }, ficha: true },
  });
  if (!estudante?.ficha) return null;
  const f = estudante.ficha;
  const [abonos, cursando, cursos, curso, aproveitamentos] = await Promise.all([
    listarAbonos(estudanteId),
    prisma.matricula.count({ where: { estudanteId, situacao: "Cursando", turma: { periodoLetivo: { status: "Aberto" } } } }),
    sessao.perfil === "Administrador" ? prisma.curso.findMany({ select: { id: true, nome: true }, orderBy: { nome: "asc" } }) : Promise.resolve([]),
    // SPEC-037 / SPEC-042: integralização e aproveitamentos na ficha.
    estudante.curso ? integralizacaoDoEstudante(estudanteId, estudante.curso.id) : Promise.resolve(null),
    listarAproveitamentos(estudanteId),
  ]);
  return {
    id: estudante.id,
    nome: estudante.nome,
    email: estudante.email,
    ativo: estudante.ativo,
    curso: estudante.curso,
    numeroMatricula: f.numeroMatricula,
    cpf: f.cpf,
    dataNascimento: f.dataNascimento ? deData(f.dataNascimento) : null,
    telefone: f.telefone,
    responsavelNome: f.responsavelNome,
    responsavelTelefone: f.responsavelTelefone,
    situacaoCurso: f.situacaoCurso as SituacaoCurso,
    situacaoDesde: deData(f.situacaoDesde),
    situacaoMotivo: f.situacaoMotivo,
    matriculasCursandoAbertas: cursando,
    abonos,
    cursos: cursos.filter((c) => c.id !== estudante.curso?.id),
    integralizacao: curso?.integralizacao ?? null,
    // Disciplinas da matriz ainda não aprovadas nem aproveitadas (opções do aproveitamento).
    disciplinasParaAproveitar: (curso?.matriz ?? []).filter((d) => !curso!.historico.aprovadas.has(d.disciplinaId) && !curso!.historico.aproveitadas.has(d.disciplinaId)).map((d) => ({ id: d.disciplinaId, nome: d.nome, cargaHoraria: d.cargaHoraria })),
    aproveitamentos,
  };
}

export type FichaConsultada = NonNullable<Awaited<ReturnType<typeof consultarFicha>>>;

async function estudanteParaSecretaria(estudanteId: string) {
  return prisma.usuario.findFirst({ where: { id: estudanteId, perfil: "Estudante" }, select: { id: true, nome: true, cursoId: true, ficha: true } });
}

// AC-033-02 / INV-033-02: CPF válido e único; auditoria sem o CPF completo.
export async function salvarFicha(estudanteId: string, entrada: Record<string, unknown>, administradorId: string, hoje = hojeEmBrasilia()) {
  const estudante = await estudanteParaSecretaria(estudanteId);
  if (!estudante?.ficha) return naoEncontrado;
  const validacao = validarFicha(entrada, hoje);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  const d = validacao.dados;
  const cpfRepetido = falha({ tipo: "invalido", erros: { cpf: "Este CPF já pertence a outro estudante." } });
  if (d.cpf && (await prisma.fichaEstudante.findFirst({ where: { cpf: d.cpf, estudanteId: { not: estudanteId } }, select: { estudanteId: true } }))) return cpfRepetido;
  const resumo = (f: { cpf: string | null; dataNascimento: string | null; telefone: string | null; responsavelNome: string | null; responsavelTelefone: string | null }) => ({
    ...f,
    cpf: cpfMascarado(f.cpf),
  });
  try {
    return sucesso(
      await executarEmTransacao(async (tx) => {
        await tx.fichaEstudante.update({ where: { estudanteId }, data: { ...d, dataNascimento: d.dataNascimento ? paraData(d.dataNascimento) : null } });
        const antes = estudante.ficha!;
        await auditar(tx, {
          autorId: administradorId,
          acao: "ficha.alterada",
          cursoId: estudante.cursoId,
          descricao: `${estudante.nome} (${antes.numeroMatricula})`,
          antes: resumo({ cpf: antes.cpf, dataNascimento: antes.dataNascimento ? deData(antes.dataNascimento) : null, telefone: antes.telefone, responsavelNome: antes.responsavelNome, responsavelTelefone: antes.responsavelTelefone }),
          depois: resumo(d),
        });
        return { estudanteId };
      }),
    );
  } catch (erro) {
    if ((erro as { code?: string }).code === "P2002") return cpfRepetido;
    throw erro;
  }
}

// AC-031-01 a AC-031-05 / RB-30: grava a situação e ajusta só as matrículas cursando de turmas de período aberto.
export async function mudarSituacao(estudanteId: string, entrada: Record<string, unknown>, administradorId: string, hoje = hojeEmBrasilia()) {
  const estudante = await estudanteParaSecretaria(estudanteId);
  if (!estudante?.ficha) return naoEncontrado;
  const atual = estudante.ficha.situacaoCurso as SituacaoCurso;
  const validacao = validarMudancaDeSituacao(entrada, atual, hoje);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  const { situacao, data, motivo } = validacao.dados;
  // SPEC-042 / RB-40 (AC-042-03): Concluído só com integralização de 100%.
  if (situacao === "Concluido") {
    if (!estudante.cursoId) return falha({ tipo: "invalido", erros: { situacao: "O estudante não tem curso." } });
    const { integralizacao: resumo } = await integralizacaoDoEstudante(estudanteId, estudante.cursoId);
    const motivoConclusao = motivoParaNaoConcluir(resumo);
    if (motivoConclusao) return falha({ tipo: "invalido", erros: { situacao: motivoConclusao } });
  }
  return sucesso(await executarEmTransacao((tx) => gravarSituacao(tx, { id: estudanteId, nome: estudante.nome, cursoId: estudante.cursoId, numeroMatricula: estudante.ficha!.numeroMatricula, atual }, { situacao, data, motivo }, administradorId)));
}

// RB-30: grava a situação, ajusta as matrículas cursando de período aberto e audita. Usado também pelo deferimento do
// trancamento de curso (SPEC-044), dentro da transação do requerimento.
export async function gravarSituacao(
  tx: ClienteBanco,
  estudante: { id: string; nome: string; cursoId: string | null; numeroMatricula: string; atual: SituacaoCurso },
  nova: { situacao: SituacaoCurso; data: string; motivo: string },
  autorId: string,
) {
  const { situacao, data, motivo } = nova;
  const efeito = efeitoNasMatriculas(situacao);
  await tx.fichaEstudante.update({ where: { estudanteId: estudante.id }, data: { situacaoCurso: situacao, situacaoDesde: paraData(data), situacaoMotivo: motivo } });
  const { count } = efeito
    ? await tx.matricula.updateMany({ where: { estudanteId: estudante.id, situacao: "Cursando", turma: { periodoLetivo: { status: "Aberto" } } }, data: { situacao: efeito } })
    : { count: 0 };
  await auditar(tx, {
    autorId,
    acao: "estudante.situacao",
    cursoId: estudante.cursoId,
    descricao: `${estudante.nome} (${estudante.numeroMatricula}): ${ROTULO_SITUACAO_CURSO[estudante.atual]} → ${ROTULO_SITUACAO_CURSO[situacao]} em ${dataBR(data)} — ${motivo}${efeito ? ` (${count} matrícula(s) ${efeito === "Trancada" ? "trancada(s)" : "cancelada(s)"})` : ""}`,
    antes: { situacao: estudante.atual },
    depois: { situacao, data, motivo, matriculas: count },
  });
  return { situacao, matriculasAlteradas: count };
}

// AC-031-06 / AC-031-07 / RB-19: só Ativo e sem matrícula cursando em período aberto; o histórico continua.
export async function trocarCurso(estudanteId: string, entrada: Record<string, unknown>, administradorId: string) {
  const estudante = await prisma.usuario.findFirst({ where: { id: estudanteId, perfil: "Estudante" }, select: { id: true, nome: true, cursoId: true, curso: { select: { nome: true } }, ficha: { select: { situacaoCurso: true } } } });
  if (!estudante) return naoEncontrado;
  const cursoId = typeof entrada.cursoId === "string" ? entrada.cursoId : "";
  const curso = cursoId ? await prisma.curso.findUnique({ where: { id: cursoId }, select: { id: true, nome: true } }) : null;
  if (!curso || curso.id === estudante.cursoId) return falha({ tipo: "invalido", erros: { cursoId: "Escolha o novo curso." } });
  if (estudante.ficha?.situacaoCurso !== "Ativo") return falha({ tipo: "conflito", erro: "Só estudante Ativo troca de curso." });
  const cursando = await prisma.matricula.count({ where: { estudanteId, situacao: "Cursando", turma: { periodoLetivo: { status: "Aberto" } } } });
  if (cursando > 0) return falha({ tipo: "conflito", erro: `O estudante tem ${cursando} matrícula(s) cursando em período aberto. Tranque ou cancele as matrículas antes de trocar o curso.` });
  return sucesso(
    await executarEmTransacao(async (tx) => {
      await tx.usuario.update({ where: { id: estudanteId }, data: { cursoId: curso.id } });
      // O registro vai para o curso novo; o antigo está na descrição.
      await auditar(tx, { autorId: administradorId, acao: "estudante.curso", cursoId: curso.id, descricao: `${estudante.nome}: ${estudante.curso?.nome ?? "—"} → ${curso.nome}`, antes: { curso: estudante.curso?.nome ?? null }, depois: { curso: curso.nome } });
      return { cursoId: curso.id };
    }),
  );
}

// Faltas do estudante nas aulas de cada turma dentro do intervalo (o que o abono muda).
async function faltasNoIntervalo(estudanteId: string, inicio: string, fim: string, db: ClienteBanco = prisma) {
  const faltas = await db.presenca.findMany({
    where: { estudanteId, presente: false, aula: { data: { gte: paraData(inicio), lte: paraData(fim) } } },
    select: { aula: { select: { turmaId: true, turma: { select: { diario: true, periodoLetivo: { select: { status: true } } } } } } },
  });
  // RB-20 / RB-37: só turma de período aberto e com diário aberto é recalculada.
  return faltas.map((f) => ({ turmaId: f.aula.turmaId, aberta: f.aula.turma.periodoLetivo.status === "Aberto" && f.aula.turma.diario === "Aberto" }));
}

export async function listarAbonos(estudanteId: string) {
  const abonos = await prisma.abono.findMany({
    where: { estudanteId },
    select: { id: true, inicio: true, fim: true, motivo: true, observacao: true, criadoEm: true, autor: { select: { nome: true } } },
    orderBy: [{ inicio: "desc" }, { id: "asc" }],
  });
  return Promise.all(
    abonos.map(async (a) => {
      const inicio = deData(a.inicio);
      const fim = deData(a.fim);
      return { id: a.id, inicio, fim, motivo: a.motivo, rotuloMotivo: ROTULO_MOTIVO_ABONO[a.motivo], observacao: a.observacao, autor: a.autor.nome, faltas: (await faltasNoIntervalo(estudanteId, inicio, fim)).length };
    }),
  );
}

// RB-31 / INV-032-03: recalcula frequência e indicador só nas turmas de período aberto com falta no intervalo.
async function recalcularTurmasDoAbono(estudanteId: string, turmas: string[], tx: ClienteBanco) {
  for (const turmaId of turmas) {
    await recalcularFrequencia(estudanteId, turmaId, tx);
    await recalcularIndicador(estudanteId, turmaId, tx);
  }
}

// AC-032-01 / AC-032-04: com "previa", só conta as faltas que seriam abonadas; senão grava e recalcula.
export async function registrarAbono(estudanteId: string, entrada: Record<string, unknown>, administradorId: string) {
  const estudante = await estudanteParaSecretaria(estudanteId);
  if (!estudante?.ficha) return naoEncontrado;
  const validacao = validarAbono(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  const { inicio, fim, motivo, observacao } = validacao.dados;
  const faltas = await faltasNoIntervalo(estudanteId, inicio, fim);
  const abertas = faltas.filter((f) => f.aberta);
  const turmas = [...new Set(abertas.map((f) => f.turmaId))];
  if (entrada.previa === true) return sucesso({ gravado: false, faltas: abertas.length, turmas: turmas.length, id: null as string | null });
  return sucesso(
    await executarEmTransacao(async (tx) => {
      const abono = await tx.abono.create({ data: { estudanteId, inicio: paraData(inicio), fim: paraData(fim), motivo, observacao, autorId: administradorId }, select: { id: true } });
      await recalcularTurmasDoAbono(estudanteId, turmas, tx);
      await auditar(tx, {
        autorId: administradorId,
        acao: "abono.registrado",
        cursoId: estudante.cursoId,
        descricao: `${estudante.nome} (${estudante.ficha!.numeroMatricula}): ${dataBR(inicio)} a ${dataBR(fim)}, ${ROTULO_MOTIVO_ABONO[motivo]} — ${abertas.length} falta(s) abonada(s) em ${turmas.length} turma(s)`,
        depois: { inicio, fim, motivo, observacao },
      });
      return { gravado: true, faltas: abertas.length, turmas: turmas.length, id: abono.id as string | null };
    }),
  );
}

// AC-032-02: excluir devolve as faltas (frequência recalculada).
export async function excluirAbono(abonoId: string, administradorId: string) {
  const abono = await prisma.abono.findUnique({ where: { id: abonoId }, select: { id: true, inicio: true, fim: true, motivo: true, estudanteId: true, estudante: { select: { nome: true, cursoId: true } } } });
  if (!abono) return falha({ tipo: "nao-encontrado", erro: "Abono não encontrado." });
  const inicio = deData(abono.inicio);
  const fim = deData(abono.fim);
  const turmas = [...new Set((await faltasNoIntervalo(abono.estudanteId, inicio, fim)).filter((f) => f.aberta).map((f) => f.turmaId))];
  return sucesso(
    await executarEmTransacao(async (tx) => {
      await tx.abono.delete({ where: { id: abonoId } });
      await recalcularTurmasDoAbono(abono.estudanteId, turmas, tx);
      await auditar(tx, { autorId: administradorId, acao: "abono.excluido", cursoId: abono.estudante.cursoId, descricao: `${abono.estudante.nome}: ${dataBR(inicio)} a ${dataBR(fim)}, ${ROTULO_MOTIVO_ABONO[abono.motivo]}`, antes: { inicio, fim, motivo: abono.motivo } });
      return { id: abonoId };
    }),
  );
}

// ---------------------------------------------------------------- Instituição (SPEC-033, RF-42)

export function obterInstituicao() {
  return prisma.instituicao.findUnique({ where: { id: 1 } });
}

export type Instituicao = Awaited<ReturnType<typeof obterInstituicao>>;

// AC-033-06 / AC-033-07: valida, grava o registro único e audita (sem o logotipo na auditoria).
export async function salvarInstituicao(entrada: Record<string, unknown>, administradorId: string) {
  const validacao = validarInstituicao(entrada);
  const logo = validarLogotipo(entrada.logotipo);
  if (!validacao.ok || !logo.ok) {
    return falha({ tipo: "invalido", erros: { ...(validacao.ok ? {} : validacao.erros), ...(logo.ok ? {} : { logotipo: logo.erro }) } });
  }
  const anterior = await obterInstituicao();
  // "manterLogotipo": o formulário não reenviou a imagem, então a atual fica.
  const logotipo = entrada.manterLogotipo === true ? (anterior?.logotipo ?? null) : logo.logotipo;
  const dados = { ...validacao.dados, logotipo };
  return sucesso(
    await executarEmTransacao(async (tx) => {
      const salva = await tx.instituicao.upsert({ where: { id: 1 }, update: dados, create: { id: 1, ...dados } });
      const { logotipo: _l, atualizadaEm: _a, id: _i, ...antes } = anterior ?? { logotipo: null, atualizadaEm: null, id: 1 };
      await auditar(tx, { autorId: administradorId, acao: "instituicao.alterada", descricao: validacao.dados.nome, antes: anterior ? antes : null, depois: { ...validacao.dados, logotipo: logotipo ? "enviado" : null } });
      return { nome: salva.nome };
    }),
  );
}

// ---------------------------------------------------------------- Dashboard da secretaria (SPEC-035, INV-035-03)

export async function contagemDaSecretaria() {
  const [porSituacao, pedidos] = await Promise.all([
    prisma.fichaEstudante.groupBy({ by: ["situacaoCurso"], _count: { _all: true } }),
    prisma.pedidoSenha.count({ where: { status: "Pendente" } }),
  ]);
  const situacoes = Object.fromEntries(SITUACOES_CURSO.map((s) => [s, porSituacao.find((p) => p.situacaoCurso === s)?._count._all ?? 0])) as Record<SituacaoCurso, number>;
  return { situacoes, pedidosPendentes: pedidos };
}
