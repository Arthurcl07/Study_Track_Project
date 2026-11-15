// Casos de uso da LGPD (SPEC-045, RF-54, RB-43, UC-41): aceitar os termos e baixar os próprios dados.
import { VERSAO_TERMOS, pacoteDeDados } from "@/domain/lgpd";
import type { Sessao } from "@/server/auth/token";
import { auditar } from "@/server/dados/auditoria";
import { prisma } from "@/server/dados/prisma";

export async function encarregadoDeDados() {
  const instituicao = await prisma.instituicao.findUnique({ where: { id: 1 }, select: { nome: true, encarregadoNome: true, encarregadoEmail: true } });
  return { instituicao: instituicao?.nome ?? "Instituição", nome: instituicao?.encarregadoNome ?? null, email: instituicao?.encarregadoEmail ?? null };
}

export async function aceiteVigente(usuarioId: string) {
  return prisma.aceiteTermos.findUnique({ where: { usuarioId_versao: { usuarioId, versao: VERSAO_TERMOS } }, select: { versao: true, aceitoEm: true } });
}

// AC-045-02: grava o aceite da versão vigente (uma vez por versão) e audita na mesma transação.
export async function aceitarTermos(sessao: Sessao, versao: unknown): Promise<{ ok: true } | { ok: false; erro: string }> {
  if (versao !== VERSAO_TERMOS) return { ok: false, erro: "Versão dos termos diferente da vigente. Recarregue a página." };
  await prisma.$transaction(async (tx) => {
    const ja = await tx.aceiteTermos.findUnique({ where: { usuarioId_versao: { usuarioId: sessao.usuarioId, versao } } });
    if (ja) return;
    await tx.aceiteTermos.create({ data: { usuarioId: sessao.usuarioId, versao } });
    await auditar(tx, { acao: "termos.aceitos", descricao: `${sessao.nome} aceitou os termos e a política de privacidade v${versao}`, autorId: sessao.usuarioId, depois: { versao } });
  });
  return { ok: true };
}

// INV-045-02: toda consulta filtra pelo próprio usuário (ADR-003); INV-045-03: o hash da senha não é lido.
export async function meusDados(sessao: Sessao) {
  const id = sessao.usuarioId;
  const [conta, ficha, matriculas, notas, presencas, entregas, requerimentos, notificacoes, aceites, turmasLecionadas, cursosCoordenados] = await Promise.all([
    prisma.usuario.findUniqueOrThrow({ where: { id }, select: { nome: true, email: true, perfil: true, ativo: true, criadaEm: true, curso: { select: { nome: true } } } }),
    prisma.fichaEstudante.findUnique({ where: { estudanteId: id }, omit: { estudanteId: true } }),
    prisma.matricula.findMany({
      where: { estudanteId: id },
      select: {
        situacao: true,
        turma: { select: { nome: true, periodo: true, disciplina: { select: { nome: true, cargaHoraria: true } } } },
        indicador: { select: { media: true, frequenciaAtual: true, situacao: true, atualizadoEm: true } },
      },
      orderBy: [{ turma: { periodo: "asc" } }, { turma: { nome: "asc" } }],
    }),
    prisma.nota.findMany({
      where: { estudanteId: id },
      select: { valor: true, dataRegistro: true, avaliacao: { select: { nome: true, tipo: true, peso: true, data: true, turma: { select: { nome: true } } } } },
      orderBy: { dataRegistro: "asc" },
    }),
    prisma.presenca.findMany({ where: { estudanteId: id }, select: { presente: true, aula: { select: { data: true, numero: true, turma: { select: { nome: true } } } } } }),
    prisma.entrega.findMany({ where: { estudanteId: id }, select: { dataEntrega: true, atividade: { select: { descricao: true, prazo: true, turma: { select: { nome: true } } } } } }),
    prisma.requerimento.findMany({ where: { estudanteId: id }, select: { protocolo: true, tipo: true, status: true, descricao: true, resposta: true, criadoEm: true, respondidoEm: true } }),
    prisma.notificacao.findMany({ where: { usuarioId: id }, select: { tipo: true, titulo: true, texto: true, criadaEm: true, lidaEm: true }, orderBy: { criadaEm: "desc" } }),
    prisma.aceiteTermos.findMany({ where: { usuarioId: id }, select: { versao: true, aceitoEm: true } }),
    prisma.turma.findMany({ where: { professorId: id }, select: { nome: true, periodo: true, disciplina: { select: { nome: true } } } }),
    prisma.curso.findMany({ where: { coordenadorId: id }, select: { nome: true } }),
  ]);
  const pacote = pacoteDeDados(
    {
      conta: { ...conta, curso: conta.curso?.nome ?? null },
      ficha,
      matriculas,
      notas,
      presencas,
      entregas,
      requerimentos,
      notificacoes,
      aceites,
      ...(turmasLecionadas.length > 0 ? { turmasLecionadas } : {}),
      ...(cursosCoordenados.length > 0 ? { cursosCoordenados } : {}),
    },
    new Date(),
  );
  // AC-045-04: o download fica na auditoria.
  await auditar(prisma, { acao: "dados.baixados", descricao: `${sessao.nome} baixou os próprios dados (LGPD)`, autorId: id });
  return { nome: conta.nome, pacote };
}
