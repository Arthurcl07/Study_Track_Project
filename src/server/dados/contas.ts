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

// RB-15 (SPEC-011): conta criada pela tela começa com senha provisória.
export function criarConta(dados: { nome: string; email: string; senhaHash: string; perfil: Perfil }) {
  return prisma.usuario.create({ data: { ...dados, trocarSenha: true }, select: CONTA });
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
  return prisma.usuario.findUnique({ where: { id }, select: { ativo: true, perfil: true, trocarSenha: true } });
}

// SPEC-011: hash atual para conferir a senha atual, e gravação da nova (só o hash, RNF-02).
export function hashDaConta(id: string) {
  return prisma.usuario.findUnique({ where: { id }, select: { senhaHash: true } });
}

export function gravarNovaSenha(id: string, senhaHash: string) {
  return prisma.usuario.update({ where: { id }, data: { senhaHash, trocarSenha: false }, select: { id: true } });
}
