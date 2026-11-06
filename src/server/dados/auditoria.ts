// Acesso a dados da auditoria (SPEC-019, RF-28, RB-22). Gravação sempre com o cliente da transação da escrita
// (INV-019-01); consulta com o escopo do perfil dentro da query (ADR-003). Não há edição nem exclusão (INV-019-02).
import { Prisma } from "@prisma/client";
import { ACOES, REGISTROS_POR_PAGINA, semSegredos, type AcaoAuditoria } from "@/domain/auditoria";
import type { ClienteBanco } from "./indicadores";
import { prisma } from "./prisma";

export type NovoRegistro = {
  autorId: string;
  acao: AcaoAuditoria;
  descricao: string;
  cursoId?: string | null;
  turmaId?: string | null;
  antes?: unknown;
  depois?: unknown;
};

const json = (valor: unknown) => (valor === undefined || valor === null ? Prisma.JsonNull : (semSegredos(valor) as Prisma.InputJsonValue));

export function auditar(db: ClienteBanco, registro: NovoRegistro) {
  return db.registroAuditoria.create({
    data: {
      categoria: ACOES[registro.acao].categoria,
      acao: registro.acao,
      descricao: registro.descricao,
      autorId: registro.autorId,
      cursoId: registro.cursoId ?? null,
      turmaId: registro.turmaId ?? null,
      antes: json(registro.antes),
      depois: json(registro.depois),
    },
    select: { id: true },
  });
}

// Curso e rótulo ("ES-A · Modelagem de Software") da turma, para a descrição e o escopo do registro acadêmico.
export async function turmaParaAuditoria(turmaId: string, db: ClienteBanco = prisma) {
  const turma = await db.turma.findUniqueOrThrow({ where: { id: turmaId }, select: { id: true, nome: true, cursoId: true, disciplina: { select: { nome: true } } } });
  return { turmaId: turma.id, cursoId: turma.cursoId, rotulo: `${turma.nome} · ${turma.disciplina.nome}` };
}

export async function nomeDoUsuario(id: string, db: ClienteBanco = prisma) {
  return (await db.usuario.findUnique({ where: { id }, select: { nome: true } }))?.nome ?? "—";
}

export async function listarRegistros(escopo: Prisma.RegistroAuditoriaWhereInput, acoes: string[], pagina: number) {
  const where = { AND: [escopo, { acao: { in: acoes } }] };
  const [total, registros] = await Promise.all([
    prisma.registroAuditoria.count({ where }),
    prisma.registroAuditoria.findMany({
      where,
      select: { id: true, acao: true, descricao: true, antes: true, depois: true, registradoEm: true, autor: { select: { nome: true } }, curso: { select: { nome: true } } },
      orderBy: [{ registradoEm: "desc" }, { id: "asc" }],
      skip: (pagina - 1) * REGISTROS_POR_PAGINA,
      take: REGISTROS_POR_PAGINA,
    }),
  ]);
  return { total, registros };
}
