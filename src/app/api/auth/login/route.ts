// POST /api/auth/login — Autenticar (SPEC-001, seção 9), com o limite de tentativas (SPEC-046, RB-44).
// Rota fina: delega ao serviço de autenticação.
import { NextResponse } from "next/server";
import { painelDoPerfil } from "@/domain/autorizacao";
import { precisaAceitar } from "@/domain/lgpd";
import { mensagemDeBloqueio, mensagemDeErro, tentativasRestantes } from "@/domain/login";
import { autenticar } from "@/server/auth/autenticacao";
import { bloqueioDoEmail, registrarErro, zerarTentativas } from "@/server/auth/tentativas";
import { situacaoDaConta } from "@/server/dados/contas";
import { NOME_COOKIE_SESSAO, assinarSessao, opcoesCookieSessao } from "@/server/auth/token";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaPOST(requisicao: Request) {
  const corpo = await requisicao.json().catch(() => null);
  const email = corpo?.email;
  const senha = corpo?.senha;
  if (typeof email !== "string" || typeof senha !== "string" || !email.trim() || !senha) {
    return NextResponse.json({ erro: "Informe e-mail e senha." }, { status: 400 });
  }

  // RB-44: o bloqueio é conferido antes de comparar a senha; durante ele, até a senha certa é recusada (AC-046-03).
  const bloqueadoAte = await bloqueioDoEmail(email);
  if (bloqueadoAte) {
    return NextResponse.json({ erro: mensagemDeBloqueio(bloqueadoAte), bloqueadoAte }, { status: 429 });
  }

  const sessao = await autenticar(email, senha);
  if (!sessao) {
    // INV-046-02: a contagem e as mensagens são as mesmas para e-mail com conta e sem conta.
    const tentativas = await registrarErro(email);
    if (tentativas.bloqueou) {
      return NextResponse.json({ erro: mensagemDeBloqueio(tentativas.bloqueadoAte!), bloqueadoAte: tentativas.bloqueadoAte }, { status: 429 });
    }
    return NextResponse.json({ erro: mensagemDeErro(tentativas.erradas), restantes: tentativasRestantes(tentativas.erradas) }, { status: 401 });
  }
  await zerarTentativas(email, sessao.usuarioId, sessao.nome);

  // RB-15 (SPEC-011): com senha provisória, o primeiro destino é definir a senha; RB-43 (SPEC-045): depois, o aceite.
  const conta = await situacaoDaConta(sessao.usuarioId);
  const destino = conta?.trocarSenha
    ? "/definir-senha"
    : conta && precisaAceitar(conta.aceites.map((a) => a.versao))
      ? "/termos/aceite"
      : painelDoPerfil(sessao.perfil);
  const resposta = NextResponse.json({ perfil: sessao.perfil, destino });
  resposta.cookies.set(NOME_COOKIE_SESSAO, await assinarSessao(sessao), opcoesCookieSessao());
  return resposta;
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const POST = comRegistroDeErro(rotaPOST);
