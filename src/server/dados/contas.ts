// Acesso a dados da gestão de contas (SPEC-010, RF-16). Nunca devolve o hash da senha.
import type { Perfil } from "@/domain/perfil";
import { prisma } from "./prisma";

const CONTA = { id: true, nome: true, email: true, perfil: true, ativo: true } as const;

export function listarContas(perfil?: Perfil) {
  return prisma.usuario.findMany({
    where: perfil ? { perfil } : {},
    select: CONTA,
    orderBy: [{ perfil: "desc" }, { nome: "asc" }], // Administrador, Coordenador, Professor, Estudante
  });
}

export function criarConta(dados: { nome: string; email: string; senhaHash: string; perfil: Perfil }) {
  return prisma.usuario.create({ data: dados, select: CONTA });
}

export async function contaParaDesativar(id: string) {
  const conta = await prisma.usuario.findUnique({
    where: { id },
    select: { id: true, nome: true, _count: { select: { turmasLecionadas: true } } },
  });
  return conta ? { id: conta.id, nome: conta.nome, turmasComoProfessor: conta._count.turmasLecionadas } : null;
}

export function definirAtivo(id: string, ativo: boolean) {
  return prisma.usuario.update({ where: { id }, data: { ativo }, select: CONTA });
}

// RB-14: a guarda confere a cada requisição se a conta da sessão continua existindo, ativa e com o mesmo perfil.
export function situacaoDaConta(id: string) {
  return prisma.usuario.findUnique({ where: { id }, select: { ativo: true, perfil: true } });
}
