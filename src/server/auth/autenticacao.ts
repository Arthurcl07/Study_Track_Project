// Caso de uso UC-01 — Autenticar-se (SPEC-001).
import { buscarUsuarioPorEmail } from "@/server/dados/usuarios";
import { conferirSenha, gerarHashSenha } from "./senha";
import type { Sessao } from "./token";

// Hash usado quando o e-mail não existe, para que o tempo de resposta não revele
// se o cadastro existe (mensagem de erro genérica — SPEC-001, seção 5).
let hashDeReferencia: Promise<string> | undefined;

export async function autenticar(email: string, senha: string): Promise<Sessao | null> {
  const usuario = await buscarUsuarioPorEmail(email);
  if (!usuario) {
    hashDeReferencia ??= gerarHashSenha("senha-inexistente-para-comparacao");
    await conferirSenha(senha, await hashDeReferencia);
    return null;
  }
  // OPEN-014: o modelo não tem atributo de cadastro ativo; todo usuário existente é tratado como ativo.
  const senhaConfere = await conferirSenha(senha, usuario.senhaHash);
  if (!senhaConfere) return null;
  return { usuarioId: usuario.id, nome: usuario.nome, perfil: usuario.perfil };
}
