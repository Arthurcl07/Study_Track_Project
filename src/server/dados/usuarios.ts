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

export async function buscarUsuarioPorEmail(email: string): Promise<(UsuarioComHash & { ativo: boolean }) | null> {
  return prisma.usuario.findUnique({ where: { email: normalizarEmail(email) } });
}

export async function salvarUsuario(dados: Omit<UsuarioComHash, "id"> & { cursoId?: string | null }): Promise<UsuarioComHash> {
  const email = normalizarEmail(dados.email);
  const cursoId = dados.perfil === "Estudante" ? (dados.cursoId ?? null) : null;
  return prisma.usuario.upsert({
    where: { email },
    update: { nome: dados.nome, senhaHash: dados.senhaHash, perfil: dados.perfil, cursoId },
    create: { ...dados, email, cursoId },
  });
}
