-- SPEC-016 / RF-25: data de criação da conta. As contas que já existem recebem a data desta migração.
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
