-- AlterEnum
ALTER TYPE "Perfil" ADD VALUE 'Administrador';

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true;
