// Registro de erros do servidor (SPEC-057, RNF-08). A mensagem é mascarada antes de gravar (INV-057-01).
import { codigoDoErro, mascararDadosPessoais, MENSAGEM_ERRO_INESPERADO, rotaSemIdentificadores } from "@/domain/erros";
import { NOME_COOKIE_SESSAO, verificarSessao } from "@/server/auth/token";
import { prisma } from "./prisma";

function lerCookie(cabecalho: string | null | undefined, nome: string): string | undefined {
  for (const parte of (cabecalho ?? "").split(";")) {
    const [chave, ...valor] = parte.trim().split("=");
    if (chave === nome) return decodeURIComponent(valor.join("="));
  }
  return undefined;
}

// Perfil de quem estava na requisição (nunca o nome nem o e-mail).
async function perfilDoCookie(cookie: string | null | undefined): Promise<string | null> {
  const sessao = await verificarSessao(lerCookie(cookie, NOME_COOKIE_SESSAO)).catch(() => null);
  return sessao?.perfil ?? null;
}

export async function registrarErro(erro: unknown, origem: { rota: string; metodo: string; cookie?: string | null; digest?: string | null }): Promise<string> {
  const codigo = codigoDoErro(origem.digest);
  const bruto = erro instanceof Error ? `${erro.name}: ${erro.message}` : String(erro);
  try {
    await prisma.registroErro.upsert({
      where: { codigo },
      update: {},
      create: {
        codigo,
        rota: rotaSemIdentificadores(origem.rota),
        metodo: origem.metodo.toUpperCase().slice(0, 10),
        perfil: await perfilDoCookie(origem.cookie),
        mensagem: mascararDadosPessoais(bruto),
      },
    });
  } catch {
    // Sem banco, o erro não é gravado; a página continua mostrando o código.
  }
  return codigo;
}

// AC-057-01: rota de API que falha registra o erro e responde 500 com o código no corpo.
export function comRegistroDeErro<A extends unknown[]>(rota: (...args: A) => Promise<Response>): (...args: A) => Promise<Response> {
  return async (...args: A) => {
    try {
      return await rota(...args);
    } catch (erro) {
      // redirect()/notFound() do Next.js seguem o caminho normal.
      if (erro && typeof erro === "object" && "digest" in erro && /^NEXT_/.test(String((erro as { digest: unknown }).digest))) throw erro;
      const requisicao = args[0] instanceof Request ? args[0] : null;
      const codigo = await registrarErro(erro, {
        rota: requisicao ? new URL(requisicao.url).pathname : "/api",
        metodo: requisicao?.method ?? "POST",
        cookie: requisicao?.headers.get("cookie"),
      });
      return Response.json({ erro: MENSAGEM_ERRO_INESPERADO, codigo }, { status: 500 });
    }
  };
}

export function errosRecentes(desde: Date, limite = 20) {
  return prisma.registroErro.findMany({ where: { registradoEm: { gte: desde } }, orderBy: { registradoEm: "desc" }, take: limite });
}

export function contarErrosDesde(desde: Date) {
  return prisma.registroErro.count({ where: { registradoEm: { gte: desde } } });
}

export function erroPeloCodigo(codigo: string) {
  return prisma.registroErro.findUnique({ where: { codigo: codigo.trim().toUpperCase() } });
}
