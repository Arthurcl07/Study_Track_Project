-- AlterEnum
ALTER TYPE "TipoNotificacao" ADD VALUE 'Comunicado';

-- CreateTable
CREATE TABLE "Comunicado" (
    "id" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "turmaId" TEXT,
    "cursoId" TEXT,
    "titulo" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comunicado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Comunicado_turmaId_idx" ON "Comunicado"("turmaId");

-- CreateIndex
CREATE INDEX "Comunicado_cursoId_idx" ON "Comunicado"("cursoId");

-- AddForeignKey
ALTER TABLE "Comunicado" ADD CONSTRAINT "Comunicado_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comunicado" ADD CONSTRAINT "Comunicado_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comunicado" ADD CONSTRAINT "Comunicado_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- INV-025-01: exatamente um alcance (turma ou curso).
ALTER TABLE "Comunicado" ADD CONSTRAINT "Comunicado_um_alcance" CHECK (("turmaId" IS NULL) <> ("cursoId" IS NULL));
