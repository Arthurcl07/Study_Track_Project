// Criação de contas. Nesta Spec só o seed usa (OPEN-013: sem cadastro público).
import type { Perfil } from "@/domain/perfil";
import { salvarUsuario } from "@/server/dados/usuarios";
import { gerarHashSenha } from "./senha";

// Recebe a senha em texto e persiste apenas o hash (INV-001-02).
// SPEC-015 / RB-19: conta de Estudante precisa do curso (CHECK no banco); os outros perfis não têm curso.
export async function salvarConta(dados: { nome: string; email: string; senha: string; perfil: Perfil; cursoId?: string | null }) {
  const { senha, ...resto } = dados;
  return salvarUsuario({ ...resto, senhaHash: await gerarHashSenha(senha) });
}
