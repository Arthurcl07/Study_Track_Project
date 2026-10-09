import { PrismaClient } from "@prisma/client";

// Instância única do Prisma (evita múltiplas conexões no hot reload do Next.js em dev).
const globalParaPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalParaPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalParaPrisma.prisma = prisma;
