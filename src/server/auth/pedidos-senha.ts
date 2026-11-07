// Casos de uso do pedido de redefinição de senha (SPEC-027, RF-36, UC-26, RB-27). O pedido é público (como o
// login); aprovar e recusar são do Administrador, conferido na rota (pedidosSenha). A senha provisória só existe
// na resposta da aprovação: no banco fica o hash (RNF-02, INV-027-03).
import { deveGravarPedido, lerEmailDoPedido, motivoParaNaoResolver } from "@/domain/pedido-senha";
import type { Falha, Resultado } from "@/server/academico/cadastros";
import { gerarSenhaProvisoria } from "@/server/academico/importacao";
import { auditar } from "@/server/dados/auditoria";
import { executarEmTransacao } from "@/server/dados/notas";
import { prisma } from "@/server/dados/prisma";
import { gerarHashSenha } from "./senha";

const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const falha = <T>(f: Falha): Resultado<T> => ({ ok: false, falha: f });

// AC-027-01 a AC-027-03 / INV-027-01: quem chama responde sempre a mesma mensagem; aqui só se decide se grava.
export async function pedirRedefinicao(valorEmail: unknown): Promise<Resultado<{ gravado: boolean }>> {
  const email = lerEmailDoPedido(valorEmail);
  if (!email) return falha({ tipo: "invalido", erros: { email: "Informe um e-mail válido." } });
  const conta = await prisma.usuario.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, ativo: true, _count: { select: { pedidosSenha: { where: { status: "Pendente" } } } } },
  });
  const situacao = conta ? { ativo: conta.ativo, temPedidoPendente: conta._count.pedidosSenha > 0 } : null;
  if (!conta || !deveGravarPedido(situacao)) return sucesso({ gravado: false });
  try {
    await prisma.pedidoSenha.create({ data: { usuarioId: conta.id } });
  } catch (erro) {
    // INV-027-02: dois pedidos ao mesmo tempo — o índice parcial do banco garante um só pendente.
    if ((erro as { code?: string }).code === "P2002") return sucesso({ gravado: false });
    throw erro;
  }
  return sucesso({ gravado: true });
}

const PEDIDO = {
  id: true,
  status: true,
  criadoEm: true,
  resolvidoEm: true,
  usuario: { select: { id: true, nome: true, email: true, perfil: true } },
  resolvidoPor: { select: { nome: true } },
} as const;

// Pendentes (mais antigos primeiro) e resolvidos nos últimos 30 dias.
export async function listarPedidos(agora = new Date()) {
  const desde = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [pendentes, resolvidos] = await Promise.all([
    prisma.pedidoSenha.findMany({ where: { status: "Pendente" }, select: PEDIDO, orderBy: [{ criadoEm: "asc" }, { id: "asc" }] }),
    prisma.pedidoSenha.findMany({ where: { status: { not: "Pendente" }, resolvidoEm: { gte: desde } }, select: PEDIDO, orderBy: [{ resolvidoEm: "desc" }, { id: "asc" }], take: 50 }),
  ]);
  return { pendentes, resolvidos };
}

export function contarPedidosPendentes() {
  return prisma.pedidoSenha.count({ where: { status: "Pendente" } });
}

async function pedidoParaResolver(id: string) {
  return prisma.pedidoSenha.findUnique({ where: { id }, select: { id: true, status: true, usuarioId: true, usuario: { select: { nome: true, perfil: true } } } });
}

// AC-027-04 / INV-027-04: nova senha provisória (hash), conta marcada para definir senha nova (RB-15).
export async function aprovarPedido(id: string, administradorId: string): Promise<Resultado<{ senhaProvisoria: string; nome: string }>> {
  const pedido = await pedidoParaResolver(id);
  if (!pedido) return falha({ tipo: "nao-encontrado", erro: "Pedido não encontrado." });
  const motivo = motivoParaNaoResolver(pedido, administradorId, "aprovar");
  if (motivo) return falha({ tipo: "conflito", erro: motivo });
  const senhaProvisoria = gerarSenhaProvisoria();
  const senhaHash = await gerarHashSenha(senhaProvisoria);
  const resolvido = await executarEmTransacao(async (tx) => {
    // Só resolve se ainda estiver pendente (dois administradores ao mesmo tempo).
    const { count } = await tx.pedidoSenha.updateMany({ where: { id, status: "Pendente" }, data: { status: "Aprovado", resolvidoEm: new Date(), resolvidoPorId: administradorId } });
    if (count === 0) return false;
    await tx.usuario.update({ where: { id: pedido.usuarioId }, data: { senhaHash, trocarSenha: true } });
    await auditar(tx, { autorId: administradorId, acao: "senha.aprovada", descricao: `${pedido.usuario.nome} (${pedido.usuario.perfil}): senha provisória entregue pela secretaria` });
    return true;
  });
  if (!resolvido) return falha({ tipo: "conflito", erro: "Este pedido já foi resolvido." });
  return sucesso({ senhaProvisoria, nome: pedido.usuario.nome });
}

// AC-027-05: encerra o pedido sem mudar a senha.
export async function recusarPedido(id: string, administradorId: string): Promise<Resultado<{ id: string }>> {
  const pedido = await pedidoParaResolver(id);
  if (!pedido) return falha({ tipo: "nao-encontrado", erro: "Pedido não encontrado." });
  const motivo = motivoParaNaoResolver(pedido, administradorId, "recusar");
  if (motivo) return falha({ tipo: "conflito", erro: motivo });
  const resolvido = await executarEmTransacao(async (tx) => {
    const { count } = await tx.pedidoSenha.updateMany({ where: { id, status: "Pendente" }, data: { status: "Recusado", resolvidoEm: new Date(), resolvidoPorId: administradorId } });
    if (count === 0) return false;
    await auditar(tx, { autorId: administradorId, acao: "senha.recusada", descricao: `${pedido.usuario.nome} (${pedido.usuario.perfil})` });
    return true;
  });
  return resolvido ? sucesso({ id }) : falha({ tipo: "conflito", erro: "Este pedido já foi resolvido." });
}
