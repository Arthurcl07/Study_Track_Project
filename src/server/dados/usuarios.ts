// Acesso a dados de Usuario (camada de persistência, ADR-001).
import type { Perfil } from "@/domain/perfil";
import { prisma } from "./prisma";

export type UsuarioComHash = {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  perfil: Perfil;
};

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function buscarUsuarioPorEmail(email: string): Promise<UsuarioComHash | null> {
  return prisma.usuario.findUnique({ where: { email: normalizarEmail(email) } });
}

export async function salvarUsuario(dados: Omit<UsuarioComHash, "id">): Promise<UsuarioComHash> {
  const email = normalizarEmail(dados.email);
  return prisma.usuario.upsert({
    where: { email },
    update: { nome: dados.nome, senhaHash: dados.senhaHash, perfil: dados.perfil },
    create: { ...dados, email },
  });
}
