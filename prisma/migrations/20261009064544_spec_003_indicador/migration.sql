-- CreateEnum
CREATE TYPE "Situacao" AS ENUM ('Normal', 'Atenção', 'Risco');

-- CreateTable
CREATE TABLE "Avaliacao" (
    "id" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nota" (
    "id" TEXT NOT NULL,
    "avaliacaoId" TEXT NOT NULL,
    "estudanteId" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "dataRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Nota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Frequencia" (
    "id" TEXT NOT NULL,
    "estudanteId" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,
    "percentual" DOUBLE PRECISION NOT NULL,
    "atualizadaEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Frequencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndicadorAcademico" (
    "id" TEXT NOT NULL,
    "estudanteId" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,
    "media" DOUBLE PRECISION,
    "frequenciaAtual" DOUBLE PRECISION,
    "situacao" "Situacao" NOT NULL,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndicadorAcademico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Avaliacao_turmaId_idx" ON "Avaliacao"("turmaId");

-- CreateIndex
CREATE INDEX "Nota_estudanteId_idx" ON "Nota"("estudanteId");

-- CreateIndex
CREATE UNIQUE INDEX "Nota_avaliacaoId_estudanteId_key" ON "Nota"("avaliacaoId", "estudanteId");

-- CreateIndex
CREATE UNIQUE INDEX "Frequencia_estudanteId_turmaId_key" ON "Frequencia"("estudanteId", "turmaId");

-- CreateIndex
CREATE INDEX "IndicadorAcademico_turmaId_idx" ON "IndicadorAcademico"("turmaId");

-- CreateIndex
CREATE UNIQUE INDEX "IndicadorAcademico_estudanteId_turmaId_key" ON "IndicadorAcademico"("estudanteId", "turmaId");

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_avaliacaoId_fkey" FOREIGN KEY ("avaliacaoId") REFERENCES "Avaliacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Frequencia" ADD CONSTRAINT "Frequencia_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Frequencia" ADD CONSTRAINT "Frequencia_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndicadorAcademico" ADD CONSTRAINT "IndicadorAcademico_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndicadorAcademico" ADD CONSTRAINT "IndicadorAcademico_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- OPEN-002: faixas válidas garantidas também no banco (ADR-002).
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_peso_positivo" CHECK ("peso" > 0);
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_valor_entre_0_e_10" CHECK ("valor" >= 0 AND "valor" <= 10);
ALTER TABLE "Frequencia" ADD CONSTRAINT "Frequencia_percentual_entre_0_e_100" CHECK ("percentual" >= 0 AND "percentual" <= 100);
ALTER TABLE "IndicadorAcademico" ADD CONSTRAINT "IndicadorAcademico_media_entre_0_e_10" CHECK ("media" IS NULL OR ("media" >= 0 AND "media" <= 10));
ALTER TABLE "IndicadorAcademico" ADD CONSTRAINT "IndicadorAcademico_frequencia_entre_0_e_100" CHECK ("frequenciaAtual" IS NULL OR ("frequenciaAtual" >= 0 AND "frequenciaAtual" <= 100));
