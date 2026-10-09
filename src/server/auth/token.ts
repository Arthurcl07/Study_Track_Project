// Sessão como JWT assinado no servidor, entregue em cookie httpOnly (ADR-004).
import { SignJWT, jwtVerify } from "jose";
import { ehPerfilValido, type Perfil } from "@/domain/perfil";

export const NOME_COOKIE_SESSAO = "studytrack_sessao";

// Duração provisória de 8 horas — ver OPEN-015 em docs/decisoes-em-aberto.md.
export const DURACAO_SESSAO_SEGUNDOS = 8 * 60 * 60;

export type Sessao = {
  usuarioId: string;
  nome: string;
  perfil: Perfil;
};

function chaveSecreta(): Uint8Array {
  const segredo = process.env.JWT_SECRET;
  if (!segredo || segredo.length < 32) {
    throw new Error("JWT_SECRET ausente ou curto demais (mínimo de 32 caracteres).");
  }
  return new TextEncoder().encode(segredo);
}

export async function assinarSessao(sessao: Sessao): Promise<string> {
  return new SignJWT({ nome: sessao.nome, perfil: sessao.perfil })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sessao.usuarioId)
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_SESSAO_SEGUNDOS}s`)
    .sign(chaveSecreta());
}

// Retorna null para token ausente, expirado, adulterado ou com perfil inválido (nega por padrão).
export async function verificarSessao(token: string | undefined | null): Promise<Sessao | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, chaveSecreta(), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string" || typeof payload.nome !== "string") return null;
    if (!ehPerfilValido(payload.perfil)) return null;
    return { usuarioId: payload.sub, nome: payload.nome, perfil: payload.perfil };
  } catch {
    return null;
  }
}

export function opcoesCookieSessao() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACAO_SESSAO_SEGUNDOS,
  };
}
