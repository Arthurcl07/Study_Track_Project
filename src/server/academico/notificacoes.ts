// Casos de uso das notificações (SPEC-022, RF-31, UC-21). Só estudante e professor recebem (INV-022-05); cada um
// vê e marca só as próprias (RB-23). As de prazo são geradas quando o estudante entra no sistema (OPEN-043).
import type { Sessao } from "@/server/auth/token";
import * as dados from "@/server/dados/notificacoes";
import type { Resultado } from "./cadastros";

const recebe = (sessao: Sessao) => sessao.perfil === "Estudante" || sessao.perfil === "Professor";

// Contador do menu: para o estudante, antes gera os avisos de prazo que faltarem.
export async function naoLidasDoMenu(sessao: Sessao): Promise<number | undefined> {
  if (!recebe(sessao)) return undefined;
  if (sessao.perfil === "Estudante") await dados.gerarNotificacoesDePrazo(sessao.usuarioId);
  return dados.contarNaoLidas(sessao.usuarioId);
}

export async function consultarNotificacoes(sessao: Sessao) {
  if (!recebe(sessao)) return null;
  if (sessao.perfil === "Estudante") await dados.gerarNotificacoesDePrazo(sessao.usuarioId);
  const [notificacoes, naoLidas] = await Promise.all([dados.listarNotificacoes(sessao.usuarioId), dados.contarNaoLidas(sessao.usuarioId)]);
  return { naoLidas, notificacoes: notificacoes.map((n) => ({ ...n, criadaEm: n.criadaEm.toISOString(), lidaEm: n.lidaEm?.toISOString() ?? null })) };
}

export async function marcarComoLida(sessao: Sessao, id: string): Promise<Resultado<{ id: string; link: string }>> {
  const notificacao = await dados.existeDoUsuario(sessao.usuarioId, id);
  if (!notificacao) return { ok: false, falha: { tipo: "nao-encontrado", erro: "Notificação não encontrada." } };
  await dados.marcarLida(sessao.usuarioId, id);
  return { ok: true, valor: notificacao };
}

export async function marcarTodasComoLidas(sessao: Sessao) {
  const { count } = await dados.marcarTodasLidas(sessao.usuarioId);
  return { marcadas: count };
}
