// Perfis de usuário (RB-01, INV-001-01, INV-010-01). Camada de domínio: sem dependência de Next.js ou Prisma.
// Administrador (SPEC-010, OPEN-025) só gerencia contas e não acessa dados acadêmicos (RB-13).

export const PERFIS = ["Estudante", "Professor", "Coordenador", "Administrador"] as const;

export type Perfil = (typeof PERFIS)[number];

export function ehPerfilValido(valor: unknown): valor is Perfil {
  return typeof valor === "string" && (PERFIS as readonly string[]).includes(valor);
}
