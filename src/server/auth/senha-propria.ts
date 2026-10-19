// Caso de uso "Definir ou alterar senha" (SPEC-011, UC-12, RF-18, RB-15).
import { MENSAGEM_SENHA_ATUAL_INCORRETA, validarTrocaDeSenha } from "@/domain/senha";
import { gravarNovaSenha, hashDaConta } from "@/server/dados/contas";
import type { Resultado } from "@/server/academico/cadastros";
import { conferirSenha, gerarHashSenha } from "./senha";

export async function trocarSenha(usuarioId: string, entrada: Record<string, unknown>): Promise<Resultado<{ id: string }>> {
  const validacao = validarTrocaDeSenha(entrada);
  if (!validacao.ok) return { ok: false, falha: { tipo: "invalido", erros: validacao.erros } };

  const conta = await hashDaConta(usuarioId);
  if (!conta || !(await conferirSenha(validacao.dados.senhaAtual, conta.senhaHash))) {
    return { ok: false, falha: { tipo: "invalido", erros: { senhaAtual: MENSAGEM_SENHA_ATUAL_INCORRETA } } };
  }
  // RNF-02: só o hash da nova senha é gravado; a marca de senha provisória sai junto.
  return { ok: true, valor: await gravarNovaSenha(usuarioId, await gerarHashSenha(validacao.dados.novaSenha)) };
}
