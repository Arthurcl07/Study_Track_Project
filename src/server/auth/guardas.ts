// Verificação de autorização no servidor (INV-001-03, RNF-03, ADR-003).
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { podeAcessar, type Recurso } from "@/domain/autorizacao";
import { MENSAGEM_DEFINIR_SENHA } from "@/domain/senha";
import { situacaoDaConta } from "@/server/dados/contas";
import { NOME_COOKIE_SESSAO, verificarSessao, type Sessao } from "./token";

function lerCookie(cabecalho: string | null, nome: string): string | undefined {
  if (!cabecalho) return undefined;
  for (const parte of cabecalho.split(";")) {
    const [chave, ...valor] = parte.trim().split("=");
    if (chave === nome) return decodeURIComponent(valor.join("="));
  }
  return undefined;
}

export type ContaDaSessao = { sessao: Sessao; trocarSenha: boolean };

// RB-14 / INV-010-04 (SPEC-010): o JWT só vale se a conta ainda existe, está ativa e tem o mesmo perfil.
// Assim, desativar uma conta corta na próxima requisição uma sessão que já tinha sido emitida.
// Também informa se a conta ainda usa a senha provisória (RB-15, SPEC-011).
async function confirmarConta(sessao: Sessao | null): Promise<ContaDaSessao | null> {
  if (!sessao) return null;
  const conta = await situacaoDaConta(sessao.usuarioId);
  return conta && conta.ativo && conta.perfil === sessao.perfil ? { sessao, trocarSenha: conta.trocarSenha } : null;
}

// Para a troca de senha (SPEC-011): aceita conta com senha provisória.
export async function contaDaRequisicao(requisicao: Request): Promise<ContaDaSessao | null> {
  return confirmarConta(await verificarSessao(lerCookie(requisicao.headers.get("cookie"), NOME_COOKIE_SESSAO)));
}

export async function contaDaPagina(): Promise<ContaDaSessao | null> {
  const armazenamento = await cookies();
  return confirmarConta(await verificarSessao(armazenamento.get(NOME_COOKIE_SESSAO)?.value));
}

export async function sessaoDaRequisicao(requisicao: Request): Promise<Sessao | null> {
  return (await contaDaRequisicao(requisicao))?.sessao ?? null;
}

export async function sessaoDaPagina(): Promise<Sessao | null> {
  return (await contaDaPagina())?.sessao ?? null;
}

// Para Route Handlers: 401 sem sessão válida, 403 com perfil sem permissão.
export async function autorizarApi(
  requisicao: Request,
  recurso: Recurso,
): Promise<{ sessao: Sessao } | { negado: Response }> {
  const conta = await contaDaRequisicao(requisicao);
  if (!conta) {
    return { negado: Response.json({ erro: "Autenticação necessária." }, { status: 401 }) };
  }
  // RB-15 / INV-011-02: com senha provisória, só definir a senha e sair (rotas que não passam por aqui).
  if (conta.trocarSenha) {
    return { negado: Response.json({ erro: MENSAGEM_DEFINIR_SENHA, trocarSenha: true }, { status: 403 }) };
  }
  const { sessao } = conta;
  if (!podeAcessar(sessao.perfil, recurso)) {
    return { negado: Response.json({ erro: "Acesso negado." }, { status: 403 }) };
  }
  return { sessao };
}

// Para páginas (Server Components): sem sessão vai ao login; perfil errado vai à página de acesso negado.
export async function exigirAcessoPagina(recurso: Recurso): Promise<Sessao> {
  const conta = await contaDaPagina();
  if (!conta) redirect("/login");
  if (conta.trocarSenha) redirect("/definir-senha");
  if (!podeAcessar(conta.sessao.perfil, recurso)) redirect("/acesso-negado");
  return conta.sessao;
}
