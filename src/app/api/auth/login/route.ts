// POST /api/auth/login — Autenticar (SPEC-001, seção 9). Rota fina: delega ao serviço de autenticação.
import { NextResponse } from "next/server";
import { painelDoPerfil } from "@/domain/autorizacao";
import { autenticar } from "@/server/auth/autenticacao";
import { NOME_COOKIE_SESSAO, assinarSessao, opcoesCookieSessao } from "@/server/auth/token";

// Mesma mensagem para e-mail inexistente e senha errada (não revela se o e-mail existe).
const MENSAGEM_CREDENCIAIS_INVALIDAS = "E-mail ou senha inválidos.";

export async function POST(requisicao: Request) {
  const corpo = await requisicao.json().catch(() => null);
  const email = corpo?.email;
  const senha = corpo?.senha;
  if (typeof email !== "string" || typeof senha !== "string" || !email.trim() || !senha) {
    return NextResponse.json({ erro: "Informe e-mail e senha." }, { status: 400 });
  }

  const sessao = await autenticar(email, senha);
  if (!sessao) {
    return NextResponse.json({ erro: MENSAGEM_CREDENCIAIS_INVALIDAS }, { status: 401 });
  }

  const resposta = NextResponse.json({ perfil: sessao.perfil, destino: painelDoPerfil(sessao.perfil) });
  resposta.cookies.set(NOME_COOKIE_SESSAO, await assinarSessao(sessao), opcoesCookieSessao());
  return resposta;
}
