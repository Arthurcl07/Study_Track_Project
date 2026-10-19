-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "trocarSenha" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "HistoricoNota" (
    "id" TEXT NOT NULL,
    "avaliacaoId" TEXT NOT NULL,
    "estudanteId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "valorAnterior" DOUBLE PRECISION,
    "valorNovo" DOUBLE PRECISION NOT NULL,
    "registradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoNota_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HistoricoNota_avaliacaoId_idx" ON "HistoricoNota"("avaliacaoId");

-- CreateIndex
CREATE INDEX "HistoricoNota_estudanteId_idx" ON "HistoricoNota"("estudanteId");

-- AddForeignKey
ALTER TABLE "HistoricoNota" ADD CONSTRAINT "HistoricoNota_avaliacaoId_fkey" FOREIGN KEY ("avaliacaoId") REFERENCES "Avaliacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoNota" ADD CONSTRAINT "HistoricoNota_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoNota" ADD CONSTRAINT "HistoricoNota_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RB-16 / OPEN-002: valores do histórico na mesma faixa da nota (0 a 10).
ALTER TABLE "HistoricoNota" ADD CONSTRAINT "HistoricoNota_valores_check"
  CHECK ("valorNovo" >= 0 AND "valorNovo" <= 10 AND ("valorAnterior" IS NULL OR ("valorAnterior" >= 0 AND "valorAnterior" <= 10)));
