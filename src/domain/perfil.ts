// Perfis de usuário (RB-01, INV-001-01). Camada de domínio: sem dependência de Next.js ou Prisma.

export const PERFIS = ["Estudante", "Professor", "Coordenador"] as const;

export type Perfil = (typeof PERFIS)[number];

export function ehPerfilValido(valor: unknown): valor is Perfil {
  return typeof valor === "string" && (PERFIS as readonly string[]).includes(valor);
}
