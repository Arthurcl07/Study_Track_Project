-- CreateEnum
CREATE TYPE "StatusPeriodo" AS ENUM ('Aberto', 'Encerrado');

-- CreateTable
CREATE TABLE "PeriodoLetivo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "status" "StatusPeriodo" NOT NULL DEFAULT 'Aberto',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encerradoEm" TIMESTAMP(3),

    CONSTRAINT "PeriodoLetivo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PeriodoLetivo_nome_key" ON "PeriodoLetivo"("nome");

-- CreateIndex
CREATE INDEX "Turma_periodo_idx" ON "Turma"("periodo");

-- SPEC-017 / OPEN-040: um período (Aberto) para cada texto de período já usado pelas turmas, antes da chave estrangeira.
INSERT INTO "PeriodoLetivo" ("id", "nome")
SELECT gen_random_uuid()::text, "periodo" FROM (SELECT DISTINCT "periodo" FROM "Turma") AS existentes;

-- INV-017-02: nome no formato AAAA/1 ou AAAA/2 (NOT VALID: só vale para períodos novos, não para textos antigos).
ALTER TABLE "PeriodoLetivo" ADD CONSTRAINT "PeriodoLetivo_nome_formato" CHECK ("nome" ~ '^[0-9]{4}/[12]$') NOT VALID;

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_periodo_fkey" FOREIGN KEY ("periodo") REFERENCES "PeriodoLetivo"("nome") ON DELETE RESTRICT ON UPDATE CASCADE;
