// Verificação de autorização no servidor (INV-001-03, RNF-03, ADR-003).
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { podeAcessar, type Recurso } from "@/domain/autorizacao";
import { NOME_COOKIE_SESSAO, verificarSessao, type Sessao } from "./token";

function lerCookie(cabecalho: string | null, nome: string): string | undefined {
  if (!cabecalho) return undefined;
  for (const parte of cabecalho.split(";")) {
    const [chave, ...valor] = parte.trim().split("=");
    if (chave === nome) return decodeURIComponent(valor.join("="));
  }
  return undefined;
}

export function sessaoDaRequisicao(requisicao: Request): Promise<Sessao | null> {
  return verificarSessao(lerCookie(requisicao.headers.get("cookie"), NOME_COOKIE_SESSAO));
}

export async function sessaoDaPagina(): Promise<Sessao | null> {
  const armazenamento = await cookies();
  return verificarSessao(armazenamento.get(NOME_COOKIE_SESSAO)?.value);
}

// Para Route Handlers: 401 sem sessão válida, 403 com perfil sem permissão.
export async function autorizarApi(
  requisicao: Request,
  recurso: Recurso,
): Promise<{ sessao: Sessao } | { negado: Response }> {
  const sessao = await sessaoDaRequisicao(requisicao);
  if (!sessao) {
    return { negado: Response.json({ erro: "Autenticação necessária." }, { status: 401 }) };
  }
  if (!podeAcessar(sessao.perfil, recurso)) {
    return { negado: Response.json({ erro: "Acesso negado." }, { status: 403 }) };
  }
  return { sessao };
}

// Para páginas (Server Components): sem sessão vai ao login; perfil errado vai à página de acesso negado.
export async function exigirAcessoPagina(recurso: Recurso): Promise<Sessao> {
  const sessao = await sessaoDaPagina();
  if (!sessao) redirect("/login");
  if (!podeAcessar(sessao.perfil, recurso)) redirect("/acesso-negado");
  return sessao;
}
