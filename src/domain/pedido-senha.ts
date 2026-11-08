// Regras do pedido de redefinição de senha (SPEC-027, RF-36, RB-27, OPEN-049). Funções puras.

// INV-027-01: a resposta é a mesma, exista ou não a conta (não revela quem está cadastrado, RNF-05).
export const MENSAGEM_PEDIDO_SENHA =
  "Se o e-mail estiver cadastrado, o pedido foi enviado à secretaria. Procure a secretaria para receber a senha provisória.";

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function lerEmailDoPedido(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const email = valor.trim().toLowerCase();
  return FORMATO_EMAIL.test(email) && email.length <= 254 ? email : null;
}

export type ContaDoPedido = { ativo: boolean; temPedidoPendente: boolean } | null;

// RB-27: só grava pedido para conta ativa existente e sem outro pedido pendente.
export function deveGravarPedido(conta: ContaDoPedido): boolean {
  return Boolean(conta && conta.ativo && !conta.temPedidoPendente);
}

export type PedidoParaResolver = { status: "Pendente" | "Aprovado" | "Recusado"; usuarioId: string };

// RB-27 / INV-027-05: pedido já resolvido não muda; o administrador não aprova o próprio pedido.
export function motivoParaNaoResolver(pedido: PedidoParaResolver, administradorId: string, acao: "aprovar" | "recusar"): string | null {
  if (pedido.status !== "Pendente") return "Este pedido já foi resolvido.";
  if (acao === "aprovar" && pedido.usuarioId === administradorId) return "Você não pode aprovar o pedido da sua própria conta. Peça a outro administrador.";
  return null;
}
