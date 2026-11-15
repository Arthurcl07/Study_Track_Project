// POST /api/auth/logout — Sair (OPEN-019): apaga o cookie de sessão no navegador.
import { NextResponse } from "next/server";
import { NOME_COOKIE_SESSAO, opcoesCookieSessao } from "@/server/auth/token";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaPOST() {
  const resposta = NextResponse.json({ destino: "/login" });
  resposta.cookies.set(NOME_COOKIE_SESSAO, "", { ...opcoesCookieSessao(), maxAge: 0 });
  return resposta;
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const POST = comRegistroDeErro(rotaPOST);
