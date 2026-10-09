// Criação de contas. Nesta Spec só o seed usa (OPEN-013: sem cadastro público).
import type { Perfil } from "@/domain/perfil";
import { salvarUsuario } from "@/server/dados/usuarios";
import { gerarHashSenha } from "./senha";

// Recebe a senha em texto e persiste apenas o hash (INV-001-02).
export async function salvarConta(dados: { nome: string; email: string; senha: string; perfil: Perfil }) {
  const { senha, ...resto } = dados;
  return salvarUsuario({ ...resto, senhaHash: await gerarHashSenha(senha) });
}
