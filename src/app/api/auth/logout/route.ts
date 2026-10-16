// POST /api/auth/logout — Sair (OPEN-019): apaga o cookie de sessão no navegador.
import { NextResponse } from "next/server";
import { NOME_COOKIE_SESSAO, opcoesCookieSessao } from "@/server/auth/token";

export async function POST() {
  const resposta = NextResponse.json({ destino: "/login" });
  resposta.cookies.set(NOME_COOKIE_SESSAO, "", { ...opcoesCookieSessao(), maxAge: 0 });
  return resposta;
}
