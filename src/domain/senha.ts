// Regras da senha própria (SPEC-011, RF-18, RB-15, OPEN-026). Funções puras: sem Next.js nem Prisma.
// A conferência da senha atual com o hash gravado fica no servidor; aqui só o formato da troca.
import { TAMANHO_MINIMO_SENHA, type Validacao } from "./estrutura-academica";

export type TrocaDeSenha = { senhaAtual: string; novaSenha: string };

const texto = (valor: unknown) => (typeof valor === "string" ? valor : "");

// RB-15 / INV-011-03: senha atual informada, nova com 8+ caracteres, diferente da atual e igual à confirmação.
export function validarTrocaDeSenha(entrada: Record<string, unknown>): Validacao<TrocaDeSenha> {
  const senhaAtual = texto(entrada.senhaAtual);
  const novaSenha = texto(entrada.novaSenha);
  const confirmacao = texto(entrada.confirmacao);
  const erros: Record<string, string> = {};

  if (!senhaAtual) erros.senhaAtual = "Informe a senha atual.";
  if (!novaSenha) erros.novaSenha = "Informe a nova senha.";
  else if (novaSenha.length < TAMANHO_MINIMO_SENHA) erros.novaSenha = `A nova senha precisa de pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`;
  else if (novaSenha === senhaAtual) erros.novaSenha = "A nova senha precisa ser diferente da atual.";
  if (!erros.novaSenha && confirmacao !== novaSenha) erros.confirmacao = "A confirmação não é igual à nova senha.";

  return Object.keys(erros).length > 0 ? { ok: false, erros } : { ok: true, dados: { senhaAtual, novaSenha } };
}

export const MENSAGEM_SENHA_ATUAL_INCORRETA = "Senha atual incorreta.";
export const MENSAGEM_DEFINIR_SENHA = "Defina a sua nova senha antes de continuar.";
