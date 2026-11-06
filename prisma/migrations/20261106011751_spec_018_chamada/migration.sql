-- CreateTable
CREATE TABLE "Aula" (
    "id" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "registradaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Aula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presenca" (
    "aulaId" TEXT NOT NULL,
    "estudanteId" TEXT NOT NULL,
    "presente" BOOLEAN NOT NULL,

    CONSTRAINT "Presenca_pkey" PRIMARY KEY ("aulaId","estudanteId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Aula_turmaId_data_key" ON "Aula"("turmaId", "data");

-- CreateIndex
CREATE INDEX "Presenca_estudanteId_idx" ON "Presenca"("estudanteId");

-- AddForeignKey
ALTER TABLE "Aula" ADD CONSTRAINT "Aula_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_aulaId_fkey" FOREIGN KEY ("aulaId") REFERENCES "Aula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
