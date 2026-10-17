-- CreateTable
CREATE TABLE "Atividade" (
    "id" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "prazo" DATE NOT NULL,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Atividade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entrega" (
    "id" TEXT NOT NULL,
    "atividadeId" TEXT NOT NULL,
    "estudanteId" TEXT NOT NULL,
    "dataEntrega" DATE NOT NULL,
    "registradaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Entrega_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Atividade_turmaId_idx" ON "Atividade"("turmaId");

-- CreateIndex
CREATE INDEX "Entrega_estudanteId_idx" ON "Entrega"("estudanteId");

-- CreateIndex
CREATE UNIQUE INDEX "Entrega_atividadeId_estudanteId_key" ON "Entrega"("atividadeId", "estudanteId");

-- AddForeignKey
ALTER TABLE "Atividade" ADD CONSTRAINT "Atividade_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entrega" ADD CONSTRAINT "Entrega_atividadeId_fkey" FOREIGN KEY ("atividadeId") REFERENCES "Atividade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entrega" ADD CONSTRAINT "Entrega_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
