// Acesso a dados da gestão de contas (SPEC-010, RF-16). Nunca devolve o hash da senha.
import type { Perfil } from "@/domain/perfil";
import type { ClienteBanco } from "./indicadores";
import { paginar } from "@/domain/secretaria";
import { filtroDeBusca } from "./busca";
import { prisma } from "./prisma";

const CONTA = { id: true, nome: true, email: true, perfil: true, ativo: true, curso: { select: { nome: true } } } as const;

// SPEC-034: com a busca (ids) e a página; o total vem da mesma condição (INV-034-02).
export async function listarContas(perfil: Perfil | undefined, ids: string[] | null, pagina: unknown) {
  const where = { ...(perfil ? { perfil } : {}), ...filtroDeBusca(ids) };
  const total = await prisma.usuario.count({ where });
  const paginacao = paginar(total, pagina);
  const itens = await prisma.usuario.findMany({
    where,
    select: CONTA,
    orderBy: [{ perfil: "desc" }, { nome: "asc" }, { id: "asc" }], // Administrador, Coordenador, Professor, Estudante
    skip: paginacao.pular,
    take: paginacao.porPagina,
  });
  return { itens, pagina: paginacao };
}

// RB-15 (SPEC-011): conta criada pela tela começa com senha provisória.
// SPEC-015 / RB-19: o curso só é gravado para Estudante (CHECK na migração, INV-015-05).
export function criarConta(dados: { nome: string; email: string; senhaHash: string; perfil: Perfil; cursoId: string | null }, db: ClienteBanco = prisma) {
  return db.usuario.create({ data: { ...dados, trocarSenha: true }, select: CONTA });
}

export async function contaParaDesativar(id: string) {
  const conta = await prisma.usuario.findUnique({
    where: { id },
    select: { id: true, nome: true, _count: { select: { turmasLecionadas: { where: { periodoLetivo: { status: "Aberto" } } }, cursosCoordenados: true } } },
  });
  return conta
    ? { id: conta.id, nome: conta.nome, turmasComoProfessor: conta._count.turmasLecionadas, cursosCoordenados: conta._count.cursosCoordenados }
    : null;
}

export function definirAtivo(id: string, ativo: boolean, db: ClienteBanco = prisma) {
  return db.usuario.update({ where: { id }, data: { ativo }, select: CONTA });
}

// RB-14 (SPEC-017: só turmas de período aberto impedem a desativação do professor, INV-017-07): a guarda confere a cada requisição se a conta da sessão continua existindo, ativa e com o mesmo perfil.
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
